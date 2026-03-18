"""Shapley-style attribution engine for CampaignPilot."""

from __future__ import annotations

import logging
from typing import Final

import numpy as np
import pandas as pd
import shap
from sklearn.linear_model import LogisticRegression

from models import AttributionResult, VariantMetrics
from replay import load_criteo_journeys, match_domain_strategy

logger = logging.getLogger(__name__)

TOTAL_BUDGET: Final[float] = 1_000_000.0
JOURNEY_COUNT: Final[int] = 200
_rng = np.random.default_rng()
FALLBACK_CHANNELS: Final[list[str]] = [
    "Instagram",
    "Facebook",
    "YouTube",
    "Google Search",
    "LinkedIn",
    "Email",
]


def _align_metric_channels(metrics: list[VariantMetrics], domain: str | None = None) -> list[VariantMetrics]:
    """Ensure attribution runs on a diversified, unique channel set."""

    channels = [metric.channel for metric in metrics]
    if len(set(channels)) == len(channels):
        return metrics

    inferred_domain = domain
    if not inferred_domain:
        inferred_domain = next((metric.benchmark_category for metric in metrics if metric.benchmark_category), None)

    strategy = match_domain_strategy(inferred_domain) if inferred_domain else None
    recommended = strategy.get("recommended_platforms", []) if strategy else []
    mapped_channels = [
        str(item.get("platform")).strip()
        for item in recommended
        if isinstance(item, dict) and item.get("platform")
    ]
    unique_channels = list(dict.fromkeys(mapped_channels)) or list(FALLBACK_CHANNELS)

    aligned: list[VariantMetrics] = []
    for index, metric in enumerate(metrics):
        aligned.append(metric.model_copy(update={"channel": unique_channels[index % len(unique_channels)]}))
    return aligned


def _normalize_percentages(values: dict[str, float]) -> dict[str, float]:
    """Normalize raw channel values into percentages that sum to 100."""

    total = sum(max(value, 0.0) for value in values.values())
    if total <= 0:
        equal_share = round(100.0 / len(values), 4) if values else 0.0
        return {channel: equal_share for channel in values}

    normalized = {
        channel: round((max(value, 0.0) / total) * 100.0, 4)
        for channel, value in values.items()
    }
    drift = round(100.0 - sum(normalized.values()), 4)
    if normalized:
        top_channel = max(normalized, key=normalized.get)
        normalized[top_channel] = round(normalized[top_channel] + drift, 4)
    return normalized


def _weighted_channels(metrics: list[VariantMetrics]) -> tuple[list[str], np.ndarray]:
    """Create weighted sampling probabilities from current variant performance."""

    channels = [metric.channel for metric in metrics]
    weights = np.array(
        [
            max(
                (metric.ctr * 0.5)
                + (metric.conversion_rate * 0.35)
                + ((metric.conversions / max(metric.clicks, 1)) * 100.0 * 0.15),
                0.1,
            )
            for metric in metrics
        ],
        dtype=float,
    )
    weights = weights / weights.sum()
    return channels, weights


def generate_journeys(metrics: list[VariantMetrics]) -> list[list[str]]:
    """Generate or load customer journeys aligned to the current variant channels."""

    available_channels = {metric.channel for metric in metrics}
    real_journeys = [
        [str(channel) for channel in item["path"]] + ["conversion"]
        for item in load_criteo_journeys()
        if isinstance(item, dict)
        and item.get("conversion", 0)
        and isinstance(item.get("path"), list)
        and any(str(channel) in available_channels for channel in item["path"])
    ]
    if real_journeys:
        logger.info("Loaded %s real customer journeys from processed clickstream data", len(real_journeys))
        return [
            [channel for channel in journey[:-1] if channel in available_channels] + ["conversion"]
            for journey in real_journeys
            if [channel for channel in journey[:-1] if channel in available_channels]
        ]

    channels, weights = _weighted_channels(metrics)
    journeys: list[list[str]] = []

    for _ in range(JOURNEY_COUNT):
        touch_count = int(_rng.choice([1, 2, 3, 4], p=[0.2, 0.35, 0.3, 0.15]))
        selected = list(_rng.choice(channels, size=touch_count, replace=True, p=weights))
        journeys.append(selected + ["conversion"])

    logger.info("Generated %s synthetic customer journeys", len(journeys))
    return journeys


def _build_training_frame(journeys: list[list[str]], channels: list[str]) -> tuple[pd.DataFrame, np.ndarray]:
    """Build a balanced training set for logistic regression from journey touchpoints."""

    positive_rows: list[dict[str, int]] = []
    negative_rows: list[dict[str, int]] = []

    for journey in journeys:
        touchpoints = journey[:-1]
        positive_rows.append({channel: int(channel in touchpoints) for channel in channels})

        negative_touch_count = max(1, len(touchpoints) - 1)
        negative_touchpoints = list(_rng.choice(channels, size=negative_touch_count, replace=False))
        negative_rows.append({channel: int(channel in negative_touchpoints) for channel in channels})

    frame = pd.DataFrame(positive_rows + negative_rows)
    target = np.array([1] * len(positive_rows) + [0] * len(negative_rows), dtype=int)
    return frame, target


def _compute_shapley_credit(journeys: list[list[str]], channels: list[str]) -> dict[str, float]:
    """Compute normalized channel credit using a linear SHAP explainer."""

    frame, target = _build_training_frame(journeys, channels)
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(frame, target)

    explainer = shap.LinearExplainer(model, frame)
    shap_values = explainer.shap_values(frame.iloc[: len(journeys)])
    shap_array = np.asarray(shap_values)
    if shap_array.ndim == 3:
        shap_array = shap_array[0]

    raw_credit = {
        channel: float(np.abs(shap_array[:, index]).mean())
        for index, channel in enumerate(channels)
    }
    return _normalize_percentages(raw_credit)


def _fallback_shapley_credit(metrics: list[VariantMetrics]) -> dict[str, float]:
    """Fall back to proportional channel credit if SHAP computation fails."""

    logger.warning("Using fallback proportional attribution model")
    raw_credit = {
        metric.channel: (metric.ctr * 0.55) + (metric.conversion_rate * 0.45)
        for metric in metrics
    }
    return _normalize_percentages(raw_credit)


def _compute_last_click(journeys: list[list[str]], channels: list[str]) -> dict[str, float]:
    """Compute last-click attribution percentages from synthetic journeys."""

    last_click_counts = {channel: 0.0 for channel in channels}
    for journey in journeys:
        if len(journey) >= 2:
            last_channel = journey[-2]
            last_click_counts[last_channel] += 1.0
    return _normalize_percentages(last_click_counts)


def compute(metrics: list[VariantMetrics], domain: str | None = None) -> list[AttributionResult]:
    """Compute channel attribution recommendations from the latest campaign metrics."""

    aligned_metrics = _align_metric_channels(metrics, domain)
    channels = [metric.channel for metric in aligned_metrics]
    journeys = generate_journeys(aligned_metrics)
    last_click_credit = _compute_last_click(journeys, channels)

    try:
        shapley_credit = _compute_shapley_credit(journeys, channels)
    except Exception as exc:
        logger.exception("SHAP attribution failed; using fallback: %s", exc)
        shapley_credit = _fallback_shapley_credit(aligned_metrics)

    results: list[AttributionResult] = []
    for channel in channels:
        last_click = round(last_click_credit.get(channel, 0.0), 4)
        shapley = round(shapley_credit.get(channel, 0.0), 4)
        difference = round(shapley - last_click, 4)

        if shapley > last_click + 10.0:
            recommendation = "increase"
        elif shapley < last_click - 10.0:
            recommendation = "decrease"
        else:
            recommendation = "maintain"

        budget_change_inr = round(abs(difference) / 100.0 * TOTAL_BUDGET, 2)
        results.append(
            AttributionResult(
                channel=channel,
                last_click_credit=last_click,
                shapley_credit=shapley,
                difference=difference,
                recommendation=recommendation,
                budget_change_inr=budget_change_inr,
            )
        )

    results.sort(key=lambda item: item.shapley_credit, reverse=True)
    logger.info("Computed attribution results for %s channels", len(results))
    return results


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
    from simulator import generate_cycle

    latest_metrics = generate_cycle()
    attribution_results = compute(latest_metrics)
    logger.info("Attribution results: %s", [item.model_dump() for item in attribution_results])

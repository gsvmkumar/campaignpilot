"""Thompson Sampling engine for campaign budget allocation."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Final

from scipy.stats import beta as beta_distribution

from models import BudgetAllocation, VariantMetrics

logger = logging.getLogger(__name__)

MIN_BUDGET_PERCENTAGE: Final[float] = 3.0

_VARIANT_NAMES: Final[dict[str, str]] = {
    "variant_a": "Instagram Video",
    "variant_b": "Google Search",
    "variant_c": "YouTube Pre-roll",
    "variant_d": "Facebook Carousel",
    "variant_e": "Email Banner",
    "variant_f": "Twitter Promoted",
}

_state: dict[str, dict[str, float]] = {
    "variant_a": {"alpha": 47.0, "beta": 953.0},
    "variant_b": {"alpha": 18.0, "beta": 982.0},
    "variant_c": {"alpha": 118.0, "beta": 882.0},
    "variant_d": {"alpha": 38.0, "beta": 962.0},
    "variant_e": {"alpha": 29.0, "beta": 971.0},
    "variant_f": {"alpha": 11.0, "beta": 989.0},
}


def _iso_timestamp() -> str:
    """Return the current UTC time as an ISO formatted string."""

    return datetime.now(timezone.utc).isoformat()


def update(metrics: list[VariantMetrics]) -> None:
    """Update Thompson Sampling alpha/beta parameters using the latest cycle metrics."""

    for metric in metrics:
        if metric.variant_id not in _state:
            logger.warning("Skipping unknown variant in Thompson update: %s", metric.variant_id)
            continue

        wins = float(metric.conversions)
        losses = float(max(metric.clicks - metric.conversions, 0))
        _state[metric.variant_id]["alpha"] += wins
        _state[metric.variant_id]["beta"] += losses

    logger.info("Updated Thompson state for %s variants", len(metrics))


def allocate() -> list[BudgetAllocation]:
    """Sample posteriors and return normalized budget allocations for all variants."""

    timestamp = _iso_timestamp()
    sampled_scores: dict[str, float] = {}

    try:
        for variant_id, params in _state.items():
            alpha = max(params["alpha"], 1e-6)
            beta = max(params["beta"], 1e-6)
            sampled_scores[variant_id] = float(beta_distribution.rvs(alpha, beta))
    except Exception as exc:
        logger.exception("Thompson sampling failed; falling back to posterior mean: %s", exc)
        for variant_id, params in _state.items():
            alpha = params["alpha"]
            beta = params["beta"]
            sampled_scores[variant_id] = alpha / (alpha + beta) if (alpha + beta) else 0.0

    total_sample = sum(sampled_scores.values())
    if total_sample <= 0:
        logger.warning("Sample total was zero; falling back to equal allocation")
        sampled_scores = {variant_id: 1.0 for variant_id in _state}
        total_sample = float(len(sampled_scores))

    remaining_budget = 100.0 - (MIN_BUDGET_PERCENTAGE * len(sampled_scores))
    normalized_allocations: dict[str, float] = {}

    for variant_id, score in sampled_scores.items():
        proportional_share = (score / total_sample) * remaining_budget if total_sample else 0.0
        normalized_allocations[variant_id] = MIN_BUDGET_PERCENTAGE + proportional_share

    adjustment = 100.0 - sum(normalized_allocations.values())
    if normalized_allocations:
        top_variant_id = max(normalized_allocations, key=normalized_allocations.get)
        normalized_allocations[top_variant_id] += adjustment

    allocations = [
        BudgetAllocation(
            variant_id=variant_id,
            name=_VARIANT_NAMES[variant_id],
            budget_percentage=round(normalized_allocations[variant_id], 4),
            alpha=round(_state[variant_id]["alpha"], 4),
            beta=round(_state[variant_id]["beta"], 4),
            updated_at=timestamp,
        )
        for variant_id in _VARIANT_NAMES
    ]
    allocations.sort(key=lambda item: item.budget_percentage, reverse=True)

    logger.info("Generated Thompson allocations; top variant is %s", allocations[0].variant_id)
    return allocations


def get_state() -> dict[str, dict[str, float]]:
    """Return a copy of the current alpha/beta parameters for each variant."""

    return {
        variant_id: {"alpha": params["alpha"], "beta": params["beta"]}
        for variant_id, params in _state.items()
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
    from simulator import generate_cycle

    latest_metrics = generate_cycle()
    update(latest_metrics)
    logger.info("Current Thompson state: %s", get_state())
    logger.info("Allocations: %s", [item.model_dump() for item in allocate()])

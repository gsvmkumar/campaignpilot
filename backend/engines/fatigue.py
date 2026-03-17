"""Creative fatigue detection engine for CampaignPilot."""

from __future__ import annotations

import logging
from typing import Final

import numpy as np
from sklearn.linear_model import LinearRegression

from models import FatigueStatus, VariantMetrics
from replay import load_avazu_decay, load_benchmark_priors

logger = logging.getLogger(__name__)

FATIGUED_THRESHOLD: Final[float] = -0.08
WATCH_THRESHOLD: Final[float] = -0.03
MIN_HISTORY_POINTS: Final[int] = 4
WINDOW_SIZE: Final[int] = 7
_VARIANT_META: Final[dict[str, tuple[str, str]]] = {
    "variant_a": ("Instagram Video", "Instagram"),
    "variant_b": ("Google Search", "Google"),
    "variant_c": ("YouTube Pre-roll", "YouTube"),
    "variant_d": ("Facebook Carousel", "Facebook"),
    "variant_e": ("Email Banner", "Email"),
    "variant_f": ("Twitter Promoted", "Twitter"),
}


def _variant_meta() -> dict[str, tuple[str, str]]:
    priors = load_benchmark_priors()
    if not priors:
        return dict(_VARIANT_META)
    return {
        variant_id: (
            str(payload.get("name", variant_id)),
            str(payload.get("channel", "Unknown")),
        )
        for variant_id, payload in priors.items()
    }


def _thresholds() -> tuple[float, float]:
    payload = load_avazu_decay()
    if not payload:
        return WATCH_THRESHOLD, FATIGUED_THRESHOLD

    watch_threshold = float(payload.get("watch_threshold", WATCH_THRESHOLD))
    fatigued_threshold = float(payload.get("fatigued_threshold", FATIGUED_THRESHOLD))
    return watch_threshold, fatigued_threshold


def _classify_slope(slope: float) -> tuple[str, str]:
    """Map a regression slope to fatigue status and alert messaging."""

    watch_threshold, fatigued_threshold = _thresholds()
    if slope < fatigued_threshold:
        return "FATIGUED", "CTR declining fast - refresh creative immediately"
    if slope < watch_threshold:
        return "WATCH", "CTR showing early decline - monitor closely"
    return "HEALTHY", "Performing well"


def detect(variant_id: str, ctr_history: list[float]) -> FatigueStatus:
    """Detect fatigue for a single variant from its recent CTR history."""

    variant_meta = _variant_meta()
    name, channel = variant_meta.get(variant_id, (variant_id, "Unknown"))
    recent_history = [round(value, 4) for value in ctr_history[-WINDOW_SIZE:]]

    if len(recent_history) < MIN_HISTORY_POINTS:
        return FatigueStatus(
            variant_id=variant_id,
            name=name,
            channel=channel,
            ctr_history=recent_history,
            decay_slope=0.0,
            status="HEALTHY",
            alert_message="Performing well",
        )

    x_values = np.arange(len(recent_history)).reshape(-1, 1)
    y_values = np.array(recent_history, dtype=float)

    model = LinearRegression()
    model.fit(x_values, y_values)
    slope = float(model.coef_[0])
    status, alert_message = _classify_slope(slope)

    return FatigueStatus(
        variant_id=variant_id,
        name=name,
        channel=channel,
        ctr_history=recent_history,
        decay_slope=round(slope, 4),
        status=status,
        alert_message=alert_message,
    )


def detect_all(history: list[list[VariantMetrics]]) -> list[FatigueStatus]:
    """Detect fatigue for every configured variant using simulator history."""

    variant_meta = _variant_meta()
    ctr_by_variant: dict[str, list[float]] = {variant_id: [] for variant_id in variant_meta}
    for cycle in history[-WINDOW_SIZE:]:
        for metric in cycle:
            ctr_by_variant.setdefault(metric.variant_id, []).append(metric.ctr)

    statuses = [detect(variant_id, ctr_history) for variant_id, ctr_history in ctr_by_variant.items()]
    statuses.sort(key=lambda item: item.variant_id)
    logger.info("Computed fatigue statuses for %s variants", len(statuses))
    return statuses


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
    from simulator import generate_cycle, get_history

    for _ in range(7):
        generate_cycle()

    fatigue_results = detect_all(get_history())
    logger.info("Fatigue results: %s", [item.model_dump() for item in fatigue_results])

"""Creative fatigue detection engine for CampaignPilot."""

from __future__ import annotations

import logging
from typing import Final

import numpy as np
from sklearn.linear_model import LinearRegression

from models import FatigueStatus, VariantMetrics

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


def _classify_slope(slope: float) -> tuple[str, str]:
    """Map a regression slope to fatigue status and alert messaging."""

    if slope < FATIGUED_THRESHOLD:
        return "FATIGUED", "CTR declining fast — refresh creative immediately"
    if slope < WATCH_THRESHOLD:
        return "WATCH", "CTR showing early decline — monitor closely"
    return "HEALTHY", "Performing well"


def detect(variant_id: str, ctr_history: list[float]) -> FatigueStatus:
    """Detect fatigue for a single variant from its recent CTR history."""

    name, channel = _VARIANT_META.get(variant_id, (variant_id, "Unknown"))
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

    ctr_by_variant: dict[str, list[float]] = {variant_id: [] for variant_id in _VARIANT_META}
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

"""Campaign performance simulator for CampaignPilot."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Final

import numpy as np

from models import VariantMetrics

logger = logging.getLogger(__name__)

TOTAL_BUDGET: Final[float] = 1_000_000.0
MAX_HISTORY: Final[int] = 10
BASE_CONVERSION_VARIANCE: Final[float] = 0.35


@dataclass(frozen=True)
class VariantConfig:
    """Static configuration for a simulated campaign variant."""

    variant_id: str
    name: str
    channel: str
    baseline_ctr: float
    baseline_spend: float
    base_conversion_rate: float
    trend_per_cycle: float = 0.0


VARIANT_CONFIGS: Final[list[VariantConfig]] = [
    VariantConfig(
        variant_id="variant_a",
        name="Instagram Video",
        channel="Instagram",
        baseline_ctr=2.1,
        baseline_spend=120_000.0,
        base_conversion_rate=7.3,
    ),
    VariantConfig(
        variant_id="variant_b",
        name="Google Search",
        channel="Google",
        baseline_ctr=0.8,
        baseline_spend=90_000.0,
        base_conversion_rate=9.1,
        trend_per_cycle=-0.08,
    ),
    VariantConfig(
        variant_id="variant_c",
        name="YouTube Pre-roll",
        channel="YouTube",
        baseline_ctr=3.8,
        baseline_spend=410_000.0,
        base_conversion_rate=8.8,
        trend_per_cycle=0.05,
    ),
    VariantConfig(
        variant_id="variant_d",
        name="Facebook Carousel",
        channel="Facebook",
        baseline_ctr=1.4,
        baseline_spend=180_000.0,
        base_conversion_rate=6.5,
    ),
    VariantConfig(
        variant_id="variant_e",
        name="Email Banner",
        channel="Email",
        baseline_ctr=1.1,
        baseline_spend=140_000.0,
        base_conversion_rate=5.7,
    ),
    VariantConfig(
        variant_id="variant_f",
        name="Twitter Promoted",
        channel="Twitter",
        baseline_ctr=0.5,
        baseline_spend=60_000.0,
        base_conversion_rate=4.8,
        trend_per_cycle=-0.10,
    ),
]

_history: list[list[VariantMetrics]] = []
_rng = np.random.default_rng()


def _iso_timestamp() -> str:
    """Return the current UTC timestamp in ISO format."""

    return datetime.now(timezone.utc).isoformat()


def _budget_percentage(config: VariantConfig) -> float:
    """Return the baseline budget share for a variant as a percentage."""

    return (config.baseline_spend / TOTAL_BUDGET) * 100.0


def _compute_ctr(config: VariantConfig, cycle_index: int) -> float:
    """Compute a realistic CTR percentage for the current cycle."""

    if config.trend_per_cycle != 0.0:
        ctr = config.baseline_ctr + (config.trend_per_cycle * cycle_index)
    else:
        ctr = config.baseline_ctr + float(_rng.uniform(-0.15, 0.15))

    ctr += float(_rng.normal(0.0, 0.05))
    return round(max(0.1, ctr), 4)


def _compute_conversion_rate(config: VariantConfig) -> float:
    """Compute a realistic conversion rate percentage with mild noise."""

    rate = config.base_conversion_rate + float(_rng.normal(0.0, BASE_CONVERSION_VARIANCE))
    return round(max(1.0, min(rate, 35.0)), 4)


def generate_cycle() -> list[VariantMetrics]:
    """Generate one cycle of metrics for all configured variants and store it in memory."""

    cycle_index = len(_history)
    timestamp = _iso_timestamp()
    cycle_metrics: list[VariantMetrics] = []

    for config in VARIANT_CONFIGS:
        impressions = int(_rng.integers(8_000, 15_001))
        ctr = _compute_ctr(config, cycle_index)
        clicks = max(1, int(round(impressions * (ctr / 100.0))))
        conversion_rate = _compute_conversion_rate(config)
        conversions = min(
            clicks,
            max(0, int(round(clicks * (conversion_rate / 100.0) + _rng.normal(0.0, 2.0)))),
        )
        spend = round((_budget_percentage(config) / 100.0) * TOTAL_BUDGET, 2)

        cycle_metrics.append(
            VariantMetrics(
                variant_id=config.variant_id,
                name=config.name,
                channel=config.channel,
                impressions=impressions,
                clicks=clicks,
                ctr=round((clicks / impressions) * 100.0, 4),
                conversions=conversions,
                spend=spend,
                conversion_rate=round((conversions / clicks) * 100.0, 4) if clicks else 0.0,
                timestamp=timestamp,
            )
        )

    _history.append(cycle_metrics)
    if len(_history) > MAX_HISTORY:
        del _history[0]

    logger.info("Generated simulator cycle at %s with %s variants", timestamp, len(cycle_metrics))
    return cycle_metrics


def get_history() -> list[list[VariantMetrics]]:
    """Return all retained simulator cycles."""

    return [list(cycle) for cycle in _history]


def get_latest() -> list[VariantMetrics]:
    """Return the most recent simulator cycle, generating one if history is empty."""

    if not _history:
        logger.info("Simulator history empty; generating initial cycle")
        return generate_cycle()
    return list(_history[-1])


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
    latest = generate_cycle()
    logger.info("Latest cycle sample: %s", [metric.model_dump() for metric in latest])
    logger.info("History length: %s", len(get_history()))

"""Generate benchmark-relative intelligence signals for live variants."""

from __future__ import annotations

from datetime import datetime, timezone


def detect_signals(scored_variant: dict) -> list[dict]:
    """Return severity-ranked signals for one scored variant."""

    signals: list[dict] = []
    variant = scored_variant
    timestamp = datetime.now(timezone.utc).isoformat()

    if variant["ctr_delta"] >= 20:
        signals.append(
            {
                "type": "OUTPERFORMING",
                "metric": "CTR",
                "severity": 1,
                "color": "#22c55e",
                "title": f"CTR outperforming by {abs(variant['ctr_delta']):.0f}%",
                "message": (
                    f"{variant['channel']} is drawing clicks at {variant['actual_ctr']}% CTR, "
                    f"{abs(variant['ctr_delta']):.0f}% above the {variant['industry']} benchmark of "
                    f"{variant['bench_ctr']}%."
                ),
                "action": "Scale budget allocation",
                "actual": variant["actual_ctr"],
                "benchmark": variant["bench_ctr"],
                "delta": variant["ctr_delta"],
                "timestamp": timestamp,
            }
        )

    if variant["ctr_delta"] <= -25:
        signals.append(
            {
                "type": "UNDERPERFORMING",
                "metric": "CTR",
                "severity": 5,
                "color": "#ef4444",
                "title": f"CTR critically below benchmark by {abs(variant['ctr_delta']):.0f}%",
                "message": (
                    f"{variant['channel']} is landing at {variant['actual_ctr']}% CTR, "
                    f"{abs(variant['ctr_delta']):.0f}% below the {variant['industry']} benchmark of "
                    f"{variant['bench_ctr']}%. Creative, targeting, or keyword intent likely need review."
                ),
                "action": "Refresh copy and targeting",
                "actual": variant["actual_ctr"],
                "benchmark": variant["bench_ctr"],
                "delta": variant["ctr_delta"],
                "timestamp": timestamp,
            }
        )

    if variant["cpc_delta"] >= 30:
        signals.append(
            {
                "type": "COST_ALERT",
                "metric": "CPC",
                "severity": 4,
                "color": "#f59e0b",
                "title": f"CPC {abs(variant['cpc_delta']):.0f}% above industry average",
                "message": (
                    f"{variant['channel']} is paying INR {variant['actual_cpc']:.2f} per click versus the "
                    f"{variant['industry']} benchmark of INR {variant['bench_cpc']:.2f}."
                ),
                "action": "Tighten bids and audience quality",
                "actual": variant["actual_cpc"],
                "benchmark": variant["bench_cpc"],
                "delta": variant["cpc_delta"],
                "timestamp": timestamp,
            }
        )

    if variant["cvr_delta"] <= -20:
        gap = variant["bench_cvr"] - variant["actual_cvr"]
        lost_conversions = round((variant["conversions"] * gap) / max(variant["actual_cvr"], 0.01))
        signals.append(
            {
                "type": "CONVERSION_OPPORTUNITY",
                "metric": "CVR",
                "severity": 3,
                "color": "#6366f1",
                "title": f"Conversion rate {abs(variant['cvr_delta']):.0f}% below potential",
                "message": (
                    f"{variant['channel']} converts at {variant['actual_cvr']}% versus a benchmark "
                    f"{variant['bench_cvr']}%. Closing that gap could unlock roughly {lost_conversions} "
                    f"extra conversions at current traffic levels."
                ),
                "action": "Improve landing page and funnel",
                "actual": variant["actual_cvr"],
                "benchmark": variant["bench_cvr"],
                "delta": variant["cvr_delta"],
                "potential_conversions": lost_conversions,
                "timestamp": timestamp,
            }
        )

    if variant["actual_cpl"] > 0 and variant["bench_cpl"] > 0:
        cpl_ratio = variant["actual_cpl"] / variant["bench_cpl"]
        if cpl_ratio <= 0.75:
            signals.append(
                {
                    "type": "BUDGET_EFFICIENCY",
                    "metric": "CPL",
                    "severity": 2,
                    "color": "#3b82f6",
                    "title": f"Cost per lead {abs(variant['cpl_delta']):.0f}% below benchmark",
                    "message": (
                        f"{variant['channel']} is acquiring leads at INR {variant['actual_cpl']:.2f}, "
                        f"well below the {variant['industry']} benchmark of INR {variant['bench_cpl']:.2f}."
                    ),
                    "action": "Protect and scale this budget",
                    "actual": variant["actual_cpl"],
                    "benchmark": variant["bench_cpl"],
                    "delta": variant["cpl_delta"],
                    "timestamp": timestamp,
                }
            )
        elif cpl_ratio >= 1.5:
            signals.append(
                {
                    "type": "COST_ALERT",
                    "metric": "CPL",
                    "severity": 4,
                    "color": "#f59e0b",
                    "title": f"Cost per lead {abs(variant['cpl_delta']):.0f}% above benchmark",
                    "message": (
                        f"{variant['channel']} is paying INR {variant['actual_cpl']:.2f} per lead, "
                        f"far above the {variant['industry']} benchmark of INR {variant['bench_cpl']:.2f}."
                    ),
                    "action": "Reduce budget until funnel efficiency improves",
                    "actual": variant["actual_cpl"],
                    "benchmark": variant["bench_cpl"],
                    "delta": variant["cpl_delta"],
                    "timestamp": timestamp,
                }
            )

    if variant["performance_index"] >= 75 and not any(signal["type"] == "OUTPERFORMING" for signal in signals):
        signals.append(
            {
                "type": "OUTPERFORMING",
                "metric": "Overall",
                "severity": 1,
                "color": "#22c55e",
                "title": f"Grade {variant['grade']} - {variant['grade_label']}",
                "message": (
                    f"{variant['channel']} scores {variant['performance_index']}/100 against "
                    f"{variant['industry']} benchmarks, making it one of the strongest channels in play."
                ),
                "action": "Maintain current strategy",
                "actual": variant["performance_index"],
                "benchmark": 50,
                "delta": variant["performance_index"] - 50,
                "timestamp": timestamp,
            }
        )

    return sorted(signals, key=lambda item: item["severity"], reverse=True)


def detect_all_signals(scored_variants: list[dict]) -> dict[str, list[dict]]:
    """Return the per-variant signals keyed by variant id or name."""

    return {
        str(variant.get("variant_id") or variant["variant_name"]): detect_signals(variant)
        for variant in scored_variants
    }

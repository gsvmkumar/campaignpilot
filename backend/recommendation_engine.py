"""Generate campaign-level recommendations from intelligence scores and signals."""

from __future__ import annotations


def generate_recommendations(scored_variants: list[dict], all_signals: dict[str, list[dict]]) -> list[dict]:
    """Return a priority-ordered recommendation feed."""

    recommendations: list[dict] = []
    ranked = sorted(scored_variants, key=lambda item: item["performance_index"], reverse=True)
    if not ranked:
        return recommendations

    best = ranked[0]
    worst = ranked[-1]

    if best["performance_index"] >= 65:
        budget_increase = round(((best["performance_index"] - 50) / 50) * 20, 0)
        recommendations.append(
            {
                "priority": 1,
                "category": "Budget",
                "impact": "High",
                "color": "#22c55e",
                "title": f"Scale {best['channel']} - your strongest performer",
                "body": (
                    f"{best['channel']} scores {best['performance_index']}/100 against "
                    f"{best['industry']} benchmarks with Grade {best['grade']}. "
                    f"Consider increasing budget share by around {budget_increase:.0f}% while current efficiency holds."
                ),
                "metric": "Performance Index",
                "value": f"{best['performance_index']}/100",
                "variant": best["variant_name"],
            }
        )

    if worst["performance_index"] <= 35:
        wasted = round(worst["spend"] * 0.6)
        recommendations.append(
            {
                "priority": 2,
                "category": "Cost Control",
                "impact": "High",
                "color": "#ef4444",
                "title": f"Pause or rebuild {worst['channel']}",
                "body": (
                    f"{worst['channel']} is critically underperforming with a score of "
                    f"{worst['performance_index']}/100. CTR is {abs(worst['ctr_delta']):.0f}% below benchmark, "
                    f"and an estimated INR {wasted:,} of current spend may be wasted."
                ),
                "metric": "Estimated wasted spend",
                "value": f"INR {wasted:,}",
                "variant": worst["variant_name"],
            }
        )

    cvr_opportunities = [
        variant
        for variant in ranked
        if variant["cvr_delta"] <= -20 and variant["actual_ctr"] >= variant["bench_ctr"] * 0.8
    ]
    for variant in cvr_opportunities[:2]:
        gap = variant["bench_cvr"] - variant["actual_cvr"]
        extra_conv = round((variant["conversions"] * gap) / max(variant["actual_cvr"], 0.01))
        recommendations.append(
            {
                "priority": 3,
                "category": "Conversion",
                "impact": "Medium",
                "color": "#6366f1",
                "title": f"Landing page optimization could unlock {extra_conv} more conversions from {variant['channel']}",
                "body": (
                    f"{variant['channel']} is earning clicks, but CVR trails the {variant['industry']} benchmark. "
                    f"Focus on page speed, mobile UX, CTA clarity, and message match."
                ),
                "metric": "Potential extra conversions",
                "value": f"+{extra_conv}",
                "variant": variant["variant_name"],
            }
        )

    overpaying = [variant for variant in ranked if variant["cpc_delta"] >= 30]
    if overpaying:
        variant = overpaying[0]
        overpay_per_click = variant["actual_cpc"] - variant["bench_cpc"]
        total_overpay = round(overpay_per_click * max(variant.get("clicks", 0), 1))
        recommendations.append(
            {
                "priority": 4,
                "category": "Cost",
                "impact": "Medium",
                "color": "#f59e0b",
                "title": f"Reduce CPC on {variant['channel']}",
                "body": (
                    f"{variant['channel']} is paying INR {overpay_per_click:.2f} more per click than benchmark. "
                    f"Narrow audience quality, use negative keywords, and lower bid ceilings."
                ),
                "metric": "Estimated click overspend",
                "value": f"INR {total_overpay:,}",
                "variant": variant["variant_name"],
            }
        )

    total_spend = sum(variant["spend"] for variant in ranked)
    total_score = sum(max(variant["performance_index"], 1.0) for variant in ranked)
    optimal_budget = {
        variant["variant_name"]: round((max(variant["performance_index"], 1.0) / total_score) * total_spend)
        for variant in ranked
    }
    realloc_lines = []
    for variant in ranked:
        current = variant["spend"]
        optimal = optimal_budget[variant["variant_name"]]
        diff = optimal - current
        if abs(diff) > 5_000:
            direction = "increase" if diff > 0 else "reduce"
            realloc_lines.append(f"{variant['channel']}: {direction} by INR {abs(diff):,}")

    if realloc_lines:
        recommendations.append(
            {
                "priority": 5,
                "category": "Budget Reallocation",
                "impact": "High",
                "color": "#3b82f6",
                "title": "Optimal budget reallocation based on benchmark performance",
                "body": " | ".join(realloc_lines),
                "metric": "Channels to rebalance",
                "value": str(len(realloc_lines)),
                "variant": "All variants",
                "realloc_detail": optimal_budget,
            }
        )

    return sorted(recommendations, key=lambda item: item["priority"])


def generate_executive_summary(scored_variants: list[dict]) -> dict:
    """Return a judge-friendly summary of campaign health."""

    if not scored_variants:
        return {
            "average_performance_index": 0.0,
            "outperforming_count": 0,
            "underperforming_count": 0,
            "grade_distribution": {},
            "summary_text": "No live variants available yet.",
            "top_variant": None,
        }

    avg_pi = round(sum(item["performance_index"] for item in scored_variants) / len(scored_variants), 1)
    outperforming = [item for item in scored_variants if item["performance_index"] >= 65]
    underperforming = [item for item in scored_variants if item["performance_index"] <= 35]
    top_variant = max(scored_variants, key=lambda item: item["performance_index"])
    grade_distribution: dict[str, int] = {}
    for item in scored_variants:
        grade_distribution[item["grade"]] = grade_distribution.get(item["grade"], 0) + 1

    summary_text = (
        f"Across {len(scored_variants)} live variants, the campaign is averaging "
        f"{avg_pi}/100 against industry benchmarks. "
        f"{len(outperforming)} variant(s) are outperforming, and "
        f"{len(underperforming)} require immediate attention."
    )

    return {
        "average_performance_index": avg_pi,
        "outperforming_count": len(outperforming),
        "underperforming_count": len(underperforming),
        "grade_distribution": grade_distribution,
        "summary_text": summary_text,
        "top_variant": {
            "variant_name": top_variant["variant_name"],
            "channel": top_variant["channel"],
            "performance_index": top_variant["performance_index"],
            "grade": top_variant["grade"],
        },
    }

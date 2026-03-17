"""Compute benchmark-relative performance scores for live variants."""

from __future__ import annotations

from typing import Any

from domain_classifier import classify_domain
from wordstream_benchmarks import get_benchmark


def _score_metric(delta: float, *, higher_is_better: bool, weight: int) -> float:
    baseline = 50 + (delta * 0.5) if higher_is_better else 50 - (delta * 0.5)
    clipped = max(0.0, min(100.0, baseline))
    return clipped * (weight / 100.0)


def compute_performance_index(variant: dict[str, Any], manual_industry: str | None = None) -> dict[str, Any]:
    """Return the live-vs-benchmark scorecard for one variant."""

    industry = classify_domain(
        manual_input=manual_industry or variant.get("industry"),
        benchmark_category=variant.get("benchmark_category"),
        keywords=variant.get("keywords"),
        channel=variant.get("channel"),
        landing_page_url=variant.get("landing_page_url"),
    )
    benchmark = get_benchmark(industry)

    actual_ctr = float(variant.get("ctr", 0.0))
    actual_cvr = float(variant.get("cvr", 0.0))
    actual_cpc = float(variant.get("cpc", 0.0))
    actual_cpl = float(variant.get("cpl", 0.0))
    actual_spend = float(variant.get("spend", 0.0))
    actual_conv = int(variant.get("conversions", 0))
    actual_clicks = int(variant.get("clicks", 0))
    actual_impressions = int(variant.get("impressions", 0))

    ctr_delta = ((actual_ctr - benchmark["ctr"]) / benchmark["ctr"] * 100.0) if benchmark["ctr"] else 0.0
    cvr_delta = ((actual_cvr - benchmark["cvr"]) / benchmark["cvr"] * 100.0) if benchmark["cvr"] else 0.0
    cpc_delta = ((actual_cpc - benchmark["cpc"]) / benchmark["cpc"] * 100.0) if benchmark["cpc"] else 0.0
    cpl_delta = ((actual_cpl - benchmark["cpl"]) / benchmark["cpl"] * 100.0) if benchmark["cpl"] else 0.0

    ctr_score = _score_metric(ctr_delta, higher_is_better=True, weight=35)
    cvr_score = _score_metric(cvr_delta, higher_is_better=True, weight=35)
    cpc_score = _score_metric(cpc_delta, higher_is_better=False, weight=15)
    cpl_score = _score_metric(cpl_delta, higher_is_better=False, weight=15)
    performance_index = round(ctr_score + cvr_score + cpc_score + cpl_score, 1)

    if performance_index >= 75:
        grade = "A"
    elif performance_index >= 60:
        grade = "B"
    elif performance_index >= 45:
        grade = "C"
    elif performance_index >= 30:
        grade = "D"
    else:
        grade = "F"

    grade_labels = {
        "A": "Outperforming",
        "B": "Above average",
        "C": "On benchmark",
        "D": "Below average",
        "F": "Critically underperforming",
    }

    return {
        "variant_id": variant.get("variant_id"),
        "variant_name": variant.get("name", "Unknown Variant"),
        "channel": variant.get("channel", "Unknown"),
        "industry": industry,
        "benchmark_category": variant.get("benchmark_category"),
        "performance_index": performance_index,
        "grade": grade,
        "grade_label": grade_labels[grade],
        "actual_ctr": round(actual_ctr, 2),
        "actual_cvr": round(actual_cvr, 2),
        "actual_cpc": round(actual_cpc, 2),
        "actual_cpl": round(actual_cpl, 2),
        "spend": round(actual_spend, 2),
        "conversions": actual_conv,
        "clicks": actual_clicks,
        "impressions": actual_impressions,
        "bench_ctr": round(benchmark["ctr"], 2),
        "bench_cvr": round(benchmark["cvr"], 2),
        "bench_cpc": round(benchmark["cpc"], 2),
        "bench_cpl": round(benchmark["cpl"], 2),
        "ctr_delta": round(ctr_delta, 1),
        "cvr_delta": round(cvr_delta, 1),
        "cpc_delta": round(cpc_delta, 1),
        "cpl_delta": round(cpl_delta, 1),
        "ctr_score": round(ctr_score, 1),
        "cvr_score": round(cvr_score, 1),
        "cpc_score": round(cpc_score, 1),
        "cpl_score": round(cpl_score, 1),
    }


def score_all_variants(variants: list[dict[str, Any]], manual_industry: str | None = None) -> list[dict[str, Any]]:
    """Score all variants and sort them by descending performance index."""

    scored = [compute_performance_index(variant, manual_industry) for variant in variants]
    return sorted(scored, key=lambda item: item["performance_index"], reverse=True)

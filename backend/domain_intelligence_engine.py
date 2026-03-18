"""Main orchestration layer for the Domain Intelligence Engine."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from benchmark_scorer import score_all_variants
from recommendation_engine import generate_executive_summary, generate_recommendations
from replay import match_domain_strategy
from signal_detector import detect_all_signals

FALLBACK_PLATFORM_MIX = [
    "Instagram",
    "Facebook",
    "YouTube",
    "Google Search",
    "LinkedIn",
    "Email",
]


def _variant_to_payload(variant: Any) -> dict[str, Any]:
    """Normalize VariantMetrics or dict payloads into the intelligence format."""

    if hasattr(variant, "model_dump"):
        payload = variant.model_dump()
    else:
        payload = dict(variant)

    clicks = int(payload.get("clicks", 0) or 0)
    conversions = int(payload.get("conversions", 0) or 0)
    spend = float(payload.get("spend", 0.0) or 0.0)
    cpc = spend / max(clicks, 1)
    cpl = spend / max(conversions, 1)

    return {
        "variant_id": payload.get("variant_id"),
        "name": payload.get("name", "Unknown Variant"),
        "channel": payload.get("channel", "Unknown"),
        "benchmark_category": payload.get("benchmark_category"),
        "keywords": f"{payload.get('name', '')} {payload.get('channel', '')} {payload.get('benchmark_category', '')}",
        "ctr": float(payload.get("ctr", 0.0) or 0.0),
        "cvr": float(payload.get("conversion_rate", 0.0) or 0.0),
        "cpc": round(cpc, 2),
        "cpl": round(cpl, 2),
        "spend": round(spend, 2),
        "conversions": conversions,
        "impressions": int(payload.get("impressions", 0) or 0),
        "clicks": clicks,
    }


def _apply_domain_platform_mix(variants: list[dict[str, Any]], manual_industry: str | None) -> list[dict[str, Any]]:
    """Use the selected domain strategy to produce a visible platform mix for intelligence views."""

    if not manual_industry:
        return variants

    strategy = match_domain_strategy(manual_industry)
    recommended = strategy.get("recommended_platforms", []) if strategy else []
    platforms = [
        str(item.get("platform")).strip()
        for item in recommended
        if isinstance(item, dict) and item.get("platform")
    ]
    unique_platforms = list(dict.fromkeys(platforms))
    if not unique_platforms:
        unique_platforms = list(FALLBACK_PLATFORM_MIX)

    remapped: list[dict[str, Any]] = []
    for index, variant in enumerate(variants):
        updated = dict(variant)
        updated["source_channel"] = variant.get("channel")
        updated["channel"] = unique_platforms[index % len(unique_platforms)]
        remapped.append(updated)
    return remapped


def run_domain_intelligence(variants: list[Any], manual_industry: str | None = None) -> dict[str, Any]:
    """Run the full DIE flow against the current live variants."""

    normalized_variants = [_variant_to_payload(variant) for variant in variants]
    normalized_variants = _apply_domain_platform_mix(normalized_variants, manual_industry)
    scored_variants = score_all_variants(normalized_variants, manual_industry=manual_industry)
    signals = detect_all_signals(scored_variants)
    recommendations = generate_recommendations(scored_variants, signals)
    executive_summary = generate_executive_summary(scored_variants)

    top_signals: list[dict[str, Any]] = []
    for scored in scored_variants:
        signal_list = signals.get(str(scored.get("variant_id") or scored["variant_name"]), [])
        if signal_list:
            top_signals.append(
                {
                    "variant_id": scored.get("variant_id"),
                    "variant_name": scored["variant_name"],
                    "channel": scored["channel"],
                    "industry": scored["industry"],
                    **signal_list[0],
                }
            )

    top_signals.sort(key=lambda item: item["severity"], reverse=True)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "variant_count": len(normalized_variants),
        "selected_industry": manual_industry,
        "executive_summary": executive_summary,
        "scored_variants": scored_variants,
        "signals": signals,
        "top_signals": top_signals,
        "recommendations": recommendations,
    }

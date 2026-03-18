"""Build dataset-backed runtime artifacts for CampaignPilot."""

from __future__ import annotations

import json
import logging
import math
from collections import defaultdict
from pathlib import Path
from typing import Any

import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s [%(name)s] %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "raw"
LEGACY_RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
TOTAL_BUDGET = 1_000_000.0
VARIANT_IDS = [f"variant_{suffix}" for suffix in ("a", "b", "c", "d", "e", "f")]
MAX_CYCLES = 10
CHUNKSIZE = 200_000
UID_SAMPLE_MODULUS = 97
ARTIFACT_SCHEMA_VERSION = 5
PLATFORMS = [
    "Google Search",
    "Instagram",
    "YouTube",
    "Facebook",
    "LinkedIn",
    "Email",
]


def _application_name(category: str, index: int) -> str:
    category_root = category.split("-")[0].split("&")[0].strip()
    words = [word for word in category_root.replace("/", " ").split() if word]
    if not words:
        words = [f"Campaign {index + 1}"]
    primary = words[0].title()
    secondary = words[1].title() if len(words) > 1 else "Pilot"
    suffixes = ["Flow", "Pulse", "Forge", "Studio", "Scale", "Beacon"]
    return f"{primary} {secondary} {suffixes[index % len(suffixes)]}"


def _ensure_dirs() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def _raw_path(filename: str) -> Path:
    direct = RAW_DIR / filename
    if direct.exists():
        return direct
    return LEGACY_RAW_DIR / filename


def _write_json(filename: str, payload: Any) -> None:
    destination = PROCESSED_DIR / filename
    destination.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    logger.info("Wrote %s", destination)


def _load_json(filename: str) -> Any | None:
    source = PROCESSED_DIR / filename
    if not source.exists():
        return None
    return json.loads(source.read_text(encoding="utf-8"))


def _artifact_is_fresh(filename: str, sources: list[Path]) -> bool:
    destination = PROCESSED_DIR / filename
    version_file = PROCESSED_DIR / "artifact_version.json"
    if not destination.exists():
        return False
    if not version_file.exists():
        return False
    version_payload = json.loads(version_file.read_text(encoding="utf-8"))
    if version_payload.get("version") != ARTIFACT_SCHEMA_VERSION:
        return False
    destination_mtime = destination.stat().st_mtime
    return all(source.exists() and destination_mtime >= source.stat().st_mtime for source in sources)


def load_benchmark_table() -> pd.DataFrame:
    source = _raw_path("wordstream_benchmarks.csv")
    if not source.exists():
        raise FileNotFoundError(f"Missing benchmark file: {source}")

    frame = pd.read_csv(source)
    rename_map = {
        "Business category": "business_category",
        "CTR": "ctr_percent",
        "CVR": "conversion_rate_percent",
    }
    frame = frame.rename(columns=rename_map)
    required_columns = {"business_category", "ctr_percent", "conversion_rate_percent"}
    missing = required_columns.difference(frame.columns)
    if missing:
        raise ValueError(f"wordstream_benchmarks.csv missing columns: {sorted(missing)}")

    frame = frame.dropna(subset=["business_category", "ctr_percent", "conversion_rate_percent"]).copy()
    frame["business_category"] = (
        frame["business_category"]
        .astype(str)
        .str.replace("—", "-", regex=False)
        .str.replace("â€”", "-", regex=False)
        .str.replace("Ã¢â‚¬â€", "-", regex=False)
        .str.strip()
    )
    frame["ctr_percent"] = pd.to_numeric(frame["ctr_percent"], errors="coerce")
    frame["conversion_rate_percent"] = pd.to_numeric(frame["conversion_rate_percent"], errors="coerce")
    frame = frame.dropna(subset=["ctr_percent", "conversion_rate_percent"])
    frame = frame[frame["ctr_percent"] > 0]
    return frame


def _benchmark_summary(frame: pd.DataFrame) -> dict[str, Any]:
    scored = frame.copy()
    scored["score"] = scored["ctr_percent"] * scored["conversion_rate_percent"]
    top_categories = [
        {
            "business_category": row["business_category"],
            "ctr_percent": round(float(row["ctr_percent"]), 4),
            "conversion_rate_percent": round(float(row["conversion_rate_percent"]), 4),
            "score": round(float(row["score"]), 4),
        }
        for _, row in scored.sort_values("score", ascending=False).head(6).iterrows()
    ]
    return {
        "median_ctr_percent": round(float(scored["ctr_percent"].median()), 4),
        "median_conversion_rate_percent": round(float(scored["conversion_rate_percent"].median()), 4),
        "top_categories": top_categories,
    }


def _domain_keyword_boosts(domain: str) -> dict[str, float]:
    lowered = domain.lower()
    boosts = {platform: 1.0 for platform in PLATFORMS}

    if any(keyword in lowered for keyword in ("furniture", "fashion", "beauty", "pets", "home", "real estate")):
        boosts["Instagram"] += 0.35
        boosts["YouTube"] += 0.25
        boosts["Facebook"] += 0.2
    if any(keyword in lowered for keyword in ("software", "business", "legal", "finance", "education", "industrial")):
        boosts["Google Search"] += 0.25
        boosts["LinkedIn"] += 0.45
        boosts["Email"] += 0.2
        boosts["Facebook"] += 0.05
    if any(keyword in lowered for keyword in ("health", "fitness", "dentists", "physicians")):
        boosts["Google Search"] += 0.25
        boosts["Facebook"] += 0.2
        boosts["Email"] += 0.15
        boosts["YouTube"] += 0.1

    return boosts


def _domain_rationale(domain: str, platform: str, ctr_percent: float, conversion_rate_percent: float) -> str:
    lowered = domain.lower()
    if platform == "Google Search":
        return f"High-intent demand capture suits {domain} and converts well at {conversion_rate_percent:.2f}% CVR."
    if platform == "Instagram":
        return f"Visual discovery is strong for {domain}, helped by benchmark engagement near {ctr_percent:.2f}% CTR."
    if platform == "YouTube":
        return f"Video storytelling works well when {domain} benefits from demos, comparisons, and product education."
    if platform == "Facebook":
        return f"Facebook supports broad retargeting and social proof for {domain} campaigns."
    if platform == "LinkedIn":
        return f"LinkedIn is effective for trust-heavy and professional audiences in {domain}, especially for higher-intent leads."
    if platform == "Email":
        return f"Email is valuable for nurturing returning users in {domain} when conversion quality matters."
    return f"{platform} is a strong fit for {domain} based on benchmark performance patterns."


def _recommended_platform_mix(
    domain: str,
    ctr_percent: float,
    conversion_rate_percent: float,
    median_ctr: float,
    median_cvr: float,
) -> list[dict[str, Any]]:
    ctr_signal = ctr_percent / max(median_ctr, 0.0001)
    cvr_signal = conversion_rate_percent / max(median_cvr, 0.0001)
    keyword_boosts = _domain_keyword_boosts(domain)

    raw_scores = {
        "Google Search": (1.1 + (0.55 * cvr_signal) + (0.15 * ctr_signal)) * keyword_boosts["Google Search"],
        "Instagram": (0.95 + (0.5 * ctr_signal) + (0.08 * cvr_signal)) * keyword_boosts["Instagram"],
        "YouTube": (0.9 + (0.42 * ctr_signal) + (0.1 * cvr_signal)) * keyword_boosts["YouTube"],
        "Facebook": (0.92 + (0.28 * ctr_signal) + (0.24 * cvr_signal)) * keyword_boosts["Facebook"],
        "LinkedIn": (0.84 + (0.18 * ctr_signal) + (0.4 * cvr_signal)) * keyword_boosts["LinkedIn"],
        "Email": (0.82 + (0.45 * cvr_signal) + (0.05 * ctr_signal)) * keyword_boosts["Email"],
    }
    total_score = sum(raw_scores.values()) or 1.0
    return [
        {
            "platform": platform,
            "recommended_budget_percent": round((score / total_score) * 100.0, 2),
            "rationale": _domain_rationale(domain, platform, ctr_percent, conversion_rate_percent),
        }
        for platform, score in sorted(raw_scores.items(), key=lambda item: item[1], reverse=True)
    ]


def _domain_strategies(frame: pd.DataFrame, benchmark_summary: dict[str, Any]) -> dict[str, Any]:
    median_ctr = float(benchmark_summary["median_ctr_percent"])
    median_cvr = float(benchmark_summary["median_conversion_rate_percent"])
    strategies: dict[str, Any] = {}

    for _, row in frame.iterrows():
        domain = str(row["business_category"]).strip()
        ctr_percent = float(row["ctr_percent"])
        conversion_rate_percent = float(row["conversion_rate_percent"])
        recommendations = _recommended_platform_mix(domain, ctr_percent, conversion_rate_percent, median_ctr, median_cvr)
        strategies[domain.lower()] = {
            "domain": domain,
            "benchmark_ctr_percent": round(ctr_percent, 4),
            "benchmark_conversion_rate_percent": round(conversion_rate_percent, 4),
            "recommended_platforms": recommendations,
        }

    return strategies


def _aggregate_campaigns(tsv_source: Path) -> tuple[dict[int, dict[str, float]], int, int]:
    campaign_stats: dict[int, dict[str, float]] = defaultdict(
        lambda: {"impressions": 0.0, "clicks": 0.0, "conversions": 0.0, "spend": 0.0}
    )
    min_timestamp: int | None = None
    max_timestamp: int | None = None

    for chunk in pd.read_csv(
        tsv_source,
        sep="\t",
        usecols=["timestamp", "campaign", "conversion", "click", "cost"],
        chunksize=CHUNKSIZE,
    ):
        chunk = chunk.dropna(subset=["timestamp", "campaign"])
        chunk["timestamp"] = pd.to_numeric(chunk["timestamp"], errors="coerce")
        chunk["campaign"] = pd.to_numeric(chunk["campaign"], errors="coerce")
        chunk["conversion"] = pd.to_numeric(chunk["conversion"], errors="coerce").fillna(0.0)
        chunk["click"] = pd.to_numeric(chunk["click"], errors="coerce").fillna(0.0)
        chunk["cost"] = pd.to_numeric(chunk["cost"], errors="coerce").fillna(0.0)
        chunk = chunk.dropna(subset=["timestamp", "campaign"])
        if chunk.empty:
            continue

        current_min = int(chunk["timestamp"].min())
        current_max = int(chunk["timestamp"].max())
        min_timestamp = current_min if min_timestamp is None else min(min_timestamp, current_min)
        max_timestamp = current_max if max_timestamp is None else max(max_timestamp, current_max)

        grouped = chunk.groupby("campaign").agg(
            impressions=("campaign", "size"),
            clicks=("click", "sum"),
            conversions=("conversion", "sum"),
            spend=("cost", "sum"),
        )
        for campaign, row in grouped.iterrows():
            campaign_id = int(campaign)
            campaign_stats[campaign_id]["impressions"] += float(row["impressions"])
            campaign_stats[campaign_id]["clicks"] += float(row["clicks"])
            campaign_stats[campaign_id]["conversions"] += float(row["conversions"])
            campaign_stats[campaign_id]["spend"] += float(row["spend"])

    if min_timestamp is None or max_timestamp is None:
        raise ValueError("pcb_dataset_final.tsv did not contain any usable rows")

    return campaign_stats, min_timestamp, max_timestamp


def _select_campaigns(campaign_stats: dict[int, dict[str, float]]) -> list[int]:
    ranked = sorted(
        campaign_stats.items(),
        key=lambda item: (
            item[1]["conversions"],
            item[1]["clicks"],
            item[1]["impressions"],
            item[1]["spend"],
        ),
        reverse=True,
    )
    selected = [campaign_id for campaign_id, _ in ranked[: len(VARIANT_IDS)]]
    if len(selected) < len(VARIANT_IDS):
        raise ValueError("Not enough campaigns in pcb_dataset_final.tsv to build six variants")
    return selected


def _variant_metadata(
    selected_campaigns: list[int],
    campaign_stats: dict[int, dict[str, float]],
    benchmark_summary: dict[str, Any],
    domain_strategies: dict[str, Any],
) -> dict[str, dict[str, Any]]:
    median_ctr = float(benchmark_summary["median_ctr_percent"])
    median_cvr = float(benchmark_summary["median_conversion_rate_percent"])
    top_categories = benchmark_summary["top_categories"]
    total_spend = sum(campaign_stats[campaign]["spend"] for campaign in selected_campaigns) or 1.0

    metadata: dict[str, dict[str, Any]] = {}
    for index, (variant_id, campaign_id) in enumerate(zip(VARIANT_IDS, selected_campaigns, strict=True)):
        stats = campaign_stats[campaign_id]
        category = top_categories[index % len(top_categories)]["business_category"] if top_categories else f"Segment {index + 1}"
        strategy = domain_strategies.get(category.lower(), {})
        platform_mix = strategy.get("recommended_platforms", [])
        primary_platform = (
            str(platform_mix[0].get("platform"))
            if platform_mix and isinstance(platform_mix[0], dict) and platform_mix[0].get("platform")
            else PLATFORMS[index % len(PLATFORMS)]
        )

        ctr_from_campaign = (stats["clicks"] / stats["impressions"] * 100.0) if stats["impressions"] else median_ctr
        cvr_from_campaign = (stats["conversions"] / max(stats["clicks"], 1.0) * 100.0) if stats["clicks"] else median_cvr
        baseline_ctr = round((ctr_from_campaign * 0.7) + (median_ctr * 0.3), 4)
        conversion_rate = round((cvr_from_campaign * 0.7) + (median_cvr * 0.3), 4)
        baseline_budget = round((stats["spend"] / total_spend) * TOTAL_BUDGET, 2)
        alpha = max(int(round(baseline_ctr * 100)), 1)
        beta = max(10_000 - alpha, 1)

        metadata[variant_id] = {
            "variant_id": variant_id,
            "name": _application_name(category, index),
            "channel": primary_platform,
            "campaign_id": campaign_id,
            "benchmark_category": category,
            "alpha": float(alpha),
            "beta": float(beta),
            "baseline_ctr": baseline_ctr,
            "conversion_rate": conversion_rate,
            "baseline_budget_inr": baseline_budget,
        }

    return metadata


def _build_replay_artifacts(
    tsv_source: Path,
    selected_campaigns: list[int],
    min_timestamp: int,
    max_timestamp: int,
    metadata: dict[str, dict[str, Any]],
) -> tuple[list[list[dict[str, Any]]], list[dict[str, Any]], dict[str, Any]]:
    variant_by_campaign = {
        item["campaign_id"]: {
            "variant_id": variant_id,
            "name": item["name"],
            "channel": item["channel"],
        }
        for variant_id, item in metadata.items()
    }
    campaign_to_variant_id = {campaign_id: item["variant_id"] for campaign_id, item in variant_by_campaign.items()}

    bucket_size = max(1, math.ceil((max_timestamp - min_timestamp + 1) / MAX_CYCLES))
    cycle_aggregates: list[dict[str, dict[str, float]]] = [
        {
            variant_id: {"impressions": 0.0, "clicks": 0.0, "conversions": 0.0, "spend": 0.0}
            for variant_id in metadata
        }
        for _ in range(MAX_CYCLES)
    ]
    journey_store: dict[int, dict[str, Any]] = {}

    for chunk in pd.read_csv(
        tsv_source,
        sep="\t",
        usecols=["timestamp", "uid", "campaign", "conversion", "click", "cost"],
        chunksize=CHUNKSIZE,
    ):
        chunk = chunk.dropna(subset=["timestamp", "campaign"])
        chunk["timestamp"] = pd.to_numeric(chunk["timestamp"], errors="coerce")
        chunk["uid"] = pd.to_numeric(chunk["uid"], errors="coerce")
        chunk["campaign"] = pd.to_numeric(chunk["campaign"], errors="coerce")
        chunk["conversion"] = pd.to_numeric(chunk["conversion"], errors="coerce").fillna(0.0)
        chunk["click"] = pd.to_numeric(chunk["click"], errors="coerce").fillna(0.0)
        chunk["cost"] = pd.to_numeric(chunk["cost"], errors="coerce").fillna(0.0)
        chunk = chunk.dropna(subset=["timestamp", "campaign"])
        if chunk.empty:
            continue

        filtered = chunk[chunk["campaign"].astype(int).isin(selected_campaigns)].copy()
        if filtered.empty:
            continue

        filtered["campaign"] = filtered["campaign"].astype(int)
        filtered["bucket"] = ((filtered["timestamp"] - min_timestamp) // bucket_size).clip(0, MAX_CYCLES - 1).astype(int)

        grouped = filtered.groupby(["bucket", "campaign"]).agg(
            impressions=("campaign", "size"),
            clicks=("click", "sum"),
            conversions=("conversion", "sum"),
            spend=("cost", "sum"),
        )
        for (bucket, campaign_id), row in grouped.iterrows():
            variant_id = campaign_to_variant_id[int(campaign_id)]
            bucket_stats = cycle_aggregates[int(bucket)][variant_id]
            bucket_stats["impressions"] += float(row["impressions"])
            bucket_stats["clicks"] += float(row["clicks"])
            bucket_stats["conversions"] += float(row["conversions"])
            bucket_stats["spend"] += float(row["spend"])

        sampled = filtered[filtered["uid"].notna()].copy()
        if not sampled.empty:
            sampled["uid"] = sampled["uid"].astype(int)
            sampled = sampled[sampled["uid"].mod(UID_SAMPLE_MODULUS) == 0]
            sampled = sampled.sort_values(["uid", "timestamp"])
            for _, row in sampled.iterrows():
                uid = int(row["uid"])
                variant_info = variant_by_campaign[int(row["campaign"])]
                record = journey_store.setdefault(
                    uid,
                    {"path": [], "conversion": 0},
                )
                if len(record["path"]) < 8:
                    record["path"].append(variant_info["channel"])
                if int(row["conversion"]) > 0:
                    record["conversion"] = 1

    replay_cycles: list[list[dict[str, Any]]] = []
    ctr_slopes: list[float] = []
    segment_payloads: list[dict[str, Any]] = []

    for bucket_index, aggregate in enumerate(cycle_aggregates):
        raw_total_spend = sum(item["spend"] for item in aggregate.values())
        replay_cycle: list[dict[str, Any]] = []
        for variant_id in metadata:
            stats = aggregate[variant_id]
            impressions = int(round(stats["impressions"]))
            clicks = int(round(stats["clicks"]))
            conversions = int(round(stats["conversions"]))
            spend = (
                round((stats["spend"] / raw_total_spend) * TOTAL_BUDGET, 2)
                if raw_total_spend > 0
                else round(metadata[variant_id]["baseline_budget_inr"], 2)
            )
            ctr = round((clicks / impressions) * 100.0, 4) if impressions else 0.0
            conversion_rate = round((conversions / clicks) * 100.0, 4) if clicks else 0.0
            replay_cycle.append(
                {
                    "variant_id": variant_id,
                    "name": metadata[variant_id]["name"],
                    "channel": metadata[variant_id]["channel"],
                    "benchmark_category": metadata[variant_id]["benchmark_category"],
                    "impressions": impressions,
                    "clicks": clicks,
                    "ctr": ctr,
                    "conversions": conversions,
                    "spend": spend,
                    "conversion_rate": conversion_rate,
                    "timestamp": f"cycle-{bucket_index + 1}",
                }
            )
        replay_cycles.append(replay_cycle)

    for variant_id in metadata:
        history = [cycle_item["ctr"] for cycle in replay_cycles for cycle_item in cycle if cycle_item["variant_id"] == variant_id]
        if len(history) < 2:
            slope = 0.0
        else:
            deltas = [history[index] - history[index - 1] for index in range(1, len(history))]
            slope = float(pd.Series(deltas).median())
        ctr_slopes.append(slope)
        segment_payloads.append(
            {
                "variant_id": variant_id,
                "campaign_id": metadata[variant_id]["campaign_id"],
                "benchmark_category": metadata[variant_id]["benchmark_category"],
                "median_ctr_percent": round(float(pd.Series(history).median()) if history else 0.0, 4),
                "decay_slope": round(slope, 4),
            }
        )

    median_decay = float(pd.Series(ctr_slopes).median()) if ctr_slopes else -0.05
    journeys = [value for value in journey_store.values() if value["path"]]
    fatigue_payload = {
        "segments": segment_payloads,
        "median_decay_signal": round(median_decay, 4),
        "watch_threshold": round(median_decay * 0.75 if median_decay < 0 else -0.03, 4),
        "fatigued_threshold": round(median_decay * 1.25 if median_decay < 0 else -0.08, 4),
    }
    return replay_cycles, journeys, fatigue_payload


def build_artifacts(force: bool = False) -> dict[str, Any]:
    """Build all processed artifacts from the raw benchmark and clickstream files."""

    _ensure_dirs()
    benchmark_source = _raw_path("wordstream_benchmarks.csv")
    pcb_source = _raw_path("pcb_dataset_final.tsv")
    if not benchmark_source.exists():
        raise FileNotFoundError(f"Missing benchmark file: {benchmark_source}")
    if not pcb_source.exists():
        raise FileNotFoundError(f"Missing clickstream file: {pcb_source}")

    sources = [benchmark_source, pcb_source]
    artifact_names = [
        "benchmark_summary.json",
        "benchmark_priors.json",
        "domain_strategies.json",
        "replay_cycles.json",
        "criteo_journeys.json",
        "avazu_decay.json",
    ]
    if not force and all(_artifact_is_fresh(name, sources) for name in artifact_names):
        logger.info("Processed artifacts are up to date")
        return {
            "benchmark_summary": _load_json("benchmark_summary.json"),
            "benchmark_priors": _load_json("benchmark_priors.json"),
            "domain_strategies": _load_json("domain_strategies.json"),
            "replay_cycles": _load_json("replay_cycles.json"),
            "journeys": _load_json("criteo_journeys.json"),
            "fatigue": _load_json("avazu_decay.json"),
        }

    benchmark_frame = load_benchmark_table()
    benchmark_summary = _benchmark_summary(benchmark_frame)
    domain_strategies = _domain_strategies(benchmark_frame, benchmark_summary)
    campaign_stats, min_timestamp, max_timestamp = _aggregate_campaigns(pcb_source)
    selected_campaigns = _select_campaigns(campaign_stats)
    priors = _variant_metadata(selected_campaigns, campaign_stats, benchmark_summary, domain_strategies)
    replay_cycles, journeys, fatigue_payload = _build_replay_artifacts(
        pcb_source,
        selected_campaigns,
        min_timestamp,
        max_timestamp,
        priors,
    )

    _write_json("benchmark_summary.json", benchmark_summary)
    _write_json("benchmark_priors.json", priors)
    _write_json("domain_strategies.json", domain_strategies)
    _write_json("replay_cycles.json", replay_cycles)
    _write_json("criteo_journeys.json", journeys)
    _write_json("avazu_decay.json", fatigue_payload)
    _write_json("artifact_version.json", {"version": ARTIFACT_SCHEMA_VERSION})

    return {
        "benchmark_summary": benchmark_summary,
        "benchmark_priors": priors,
        "domain_strategies": domain_strategies,
        "replay_cycles": replay_cycles,
        "journeys": journeys,
        "fatigue": fatigue_payload,
    }


def main() -> None:
    build_artifacts(force=True)


if __name__ == "__main__":
    main()

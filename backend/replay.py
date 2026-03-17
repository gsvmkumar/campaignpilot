"""Replay dataset-backed campaign cycles for the live API."""

from __future__ import annotations

import json
import logging
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

from models import VariantMetrics

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
MAX_HISTORY = 10
_history: list[list[VariantMetrics]] = []
_cycle_pointer = 0


def _load_json(filename: str) -> Any | None:
    source = PROCESSED_DIR / filename
    if not source.exists():
        return None
    return json.loads(source.read_text(encoding="utf-8"))


def has_real_artifacts() -> bool:
    """Return whether replay cycles have been generated from raw datasets."""

    return (PROCESSED_DIR / "replay_cycles.json").exists() and (PROCESSED_DIR / "benchmark_priors.json").exists()


def load_benchmark_priors() -> dict[str, dict[str, Any]]:
    payload = _load_json("benchmark_priors.json")
    return payload if isinstance(payload, dict) else {}


def load_benchmark_summary() -> dict[str, Any]:
    payload = _load_json("benchmark_summary.json")
    return payload if isinstance(payload, dict) else {}


def load_domain_strategies() -> dict[str, dict[str, Any]]:
    payload = _load_json("domain_strategies.json")
    return payload if isinstance(payload, dict) else {}


def load_criteo_journeys() -> list[dict[str, Any]]:
    payload = _load_json("criteo_journeys.json")
    return payload if isinstance(payload, list) else []


def load_avazu_decay() -> dict[str, Any]:
    payload = _load_json("avazu_decay.json")
    return payload if isinstance(payload, dict) else {}


def load_replay_cycles() -> list[list[dict[str, Any]]]:
    payload = _load_json("replay_cycles.json")
    if not isinstance(payload, list):
        return []
    return [cycle for cycle in payload if isinstance(cycle, list)]


def match_domain_strategy(domain: str) -> dict[str, Any] | None:
    strategies = load_domain_strategies()
    if not strategies:
        return None

    normalized = domain.strip().lower()
    if not normalized:
        return None

    alias_map = {
        "software": "business services",
        "saas": "business services",
        "tech": "business services",
        "furniture": "furniture",
        "home": "home & home improvement",
        "real estate": "real estate",
        "beauty": "beauty & personal care",
        "fashion": "apparel / fashion & jewelry",
        "legal": "attorneys & legal services",
        "finance": "finance & insurance",
        "medical": "physicians & surgeons",
        "healthcare": "physicians & surgeons",
    }
    lookup_key = alias_map.get(normalized, normalized)

    if lookup_key in strategies:
        payload = dict(strategies[lookup_key])
        payload["matched_domain"] = payload.get("domain", lookup_key)
        payload["confidence"] = 1.0 if lookup_key == normalized else 0.82
        return payload

    scored_matches = sorted(
        (
            SequenceMatcher(None, lookup_key, candidate).ratio(),
            candidate,
        )
        for candidate in strategies
    )
    best_score, best_match = scored_matches[-1]
    payload = dict(strategies[best_match])
    payload["matched_domain"] = payload.get("domain", best_match)
    payload["confidence"] = round(float(best_score), 4)
    return payload


def reset_history() -> None:
    """Clear in-memory replay state so the next call restarts from cycle 1."""

    global _history, _cycle_pointer
    _history = []
    _cycle_pointer = 0


def _next_cycle_payload() -> list[dict[str, Any]]:
    global _cycle_pointer

    cycles = load_replay_cycles()
    if not cycles:
        raise RuntimeError("Replay cycles are unavailable; generate processed artifacts first")

    payload = cycles[_cycle_pointer % len(cycles)]
    _cycle_pointer += 1
    return payload


def generate_cycle() -> list[VariantMetrics]:
    """Append the next dataset-backed cycle to in-memory history."""

    payload = _next_cycle_payload()
    cycle = [VariantMetrics.model_validate(item) for item in payload]
    _history.append(cycle)
    if len(_history) > MAX_HISTORY:
        del _history[0]

    logger.info("Generated replay cycle %s with %s variants", _cycle_pointer, len(cycle))
    return list(cycle)


def get_history() -> list[list[VariantMetrics]]:
    return [list(cycle) for cycle in _history]


def get_latest() -> list[VariantMetrics]:
    if not _history:
        return generate_cycle()
    return list(_history[-1])

# Frontend API calls needed:
# - GET /api/dashboard -> for main dashboard page (poll every 30s or use Firebase onSnapshot)
# - GET /api/metrics?history=true -> for analytics page charts
# - GET /api/attribution -> for attribution page
# - GET /api/fatigue -> for campaigns page creative health
# - POST /api/trigger-cycle -> for demo "force rebalance" button
# - GET /api/analytics -> for analytics page historical charts
#
# Firebase Realtime DB path for live budget bars:
# - React should subscribe to /budget_state
# - This updates in real time without polling

"""FastAPI application for CampaignPilot backend services."""

from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any

from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from engines import attribution as attribution_engine
from engines import fatigue as fatigue_engine
from engines import thompson as thompson_engine
from firebase import client as firebase_client
from models import (
    AttributionResult,
    BudgetAllocation,
    DashboardData,
    FatigueStatus,
    VariantMetrics,
)
from simulator import generate_cycle, get_history, get_latest

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)

REBALANCE_INTERVAL_MINUTES = int(os.getenv("REBALANCE_INTERVAL_MINUTES", "30"))

app = FastAPI(title="CampaignPilot Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_scheduler = BackgroundScheduler(timezone="UTC")
_last_rebalanced_at: datetime | None = None
_last_allocations: list[dict[str, Any]] = []
_last_attribution: list[dict[str, Any]] = []
_last_fatigue: list[dict[str, Any]] = []
_rebalance_history: list[dict[str, Any]] = []


def _iso_now() -> str:
    """Return the current UTC timestamp as an ISO string."""

    return datetime.now(timezone.utc).isoformat()


def _best_performer(metrics: list[VariantMetrics]) -> VariantMetrics:
    """Return the current best-performing variant."""

    return max(metrics, key=lambda item: (item.conversions, item.ctr))


def _build_dashboard_summary(metrics: list[VariantMetrics], fatigue_statuses: list[dict[str, Any]]) -> dict[str, Any]:
    """Build dashboard summary fields from current engine outputs."""

    best_variant = _best_performer(metrics)
    return {
        "total_budget": round(sum(metric.spend for metric in metrics), 2),
        "total_conversions": sum(metric.conversions for metric in metrics),
        "best_performer": best_variant.name,
        "fatigue_alert_count": sum(1 for item in fatigue_statuses if item["status"] == "FATIGUED"),
        "last_rebalanced": _last_rebalanced_at.isoformat() if _last_rebalanced_at else _iso_now(),
    }


def _next_rebalance_minutes() -> int:
    """Return the approximate minutes remaining until the next rebalance."""

    if _last_rebalanced_at is None:
        return REBALANCE_INTERVAL_MINUTES

    next_run = _last_rebalanced_at + timedelta(minutes=REBALANCE_INTERVAL_MINUTES)
    remaining = next_run - datetime.now(timezone.utc)
    return max(0, int(remaining.total_seconds() // 60))


def _chart_history() -> dict[str, Any]:
    """Build analytics payloads from simulator history."""

    history = get_history()[-7:]
    variant_ctr_history: list[dict[str, Any]] = []
    daily_spend: list[dict[str, Any]] = []
    daily_conversions: list[dict[str, Any]] = []

    for index, cycle in enumerate(history, start=1):
        ctr_row: dict[str, Any] = {"cycle": f"Cycle {index}"}
        for metric in cycle:
            ctr_row[metric.variant_id] = metric.ctr
        variant_ctr_history.append(ctr_row)
        daily_spend.append(
            {"cycle": f"Cycle {index}", "spend": round(sum(metric.spend for metric in cycle), 2)}
        )
        daily_conversions.append(
            {"cycle": f"Cycle {index}", "conversions": sum(metric.conversions for metric in cycle)}
        )

    return {
        "variant_ctr_history": variant_ctr_history,
        "daily_spend": daily_spend,
        "daily_conversions": daily_conversions,
        "rebalance_history": _rebalance_history[-8:],
    }


def run_full_cycle() -> dict[str, Any]:
    """Run one complete optimization cycle and persist the latest outputs."""

    global _last_rebalanced_at, _last_allocations, _last_attribution, _last_fatigue

    metrics = generate_cycle()
    thompson_engine.update(metrics)
    allocations = thompson_engine.allocate()
    attribution_results = attribution_engine.compute(metrics)
    fatigue_statuses = fatigue_engine.detect_all(get_history())

    _last_rebalanced_at = datetime.now(timezone.utc)
    _last_allocations = [item.model_dump() for item in allocations]
    _last_attribution = [item.model_dump() for item in attribution_results]
    _last_fatigue = [item.model_dump() for item in fatigue_statuses]

    summary = _build_dashboard_summary(metrics, _last_fatigue)

    firebase_client.write_metrics(metrics)
    firebase_client.write_budget_state(allocations)
    firebase_client.write_attribution(attribution_results)
    firebase_client.write_fatigue(fatigue_statuses)
    firebase_client.write_dashboard_summary(summary)

    previous_allocations = _rebalance_history[-1]["allocations"] if _rebalance_history else {}
    current_allocations = {
        item["variant_id"]: item["budget_percentage"] for item in _last_allocations
    }
    changes = {
        variant_id: round(current_allocations[variant_id] - previous_allocations.get(variant_id, 0.0), 4)
        for variant_id in current_allocations
    }
    _rebalance_history.append(
        {
            "timestamp": _last_rebalanced_at.isoformat(),
            "allocations": current_allocations,
            "changes": changes,
        }
    )

    best_variant = _best_performer(metrics)
    logger.info("Cycle complete at %s - best: %s", _last_rebalanced_at.isoformat(), best_variant.name)
    return {
        "metrics": [metric.model_dump() for metric in metrics],
        "allocations": _last_allocations,
        "attribution": _last_attribution,
        "fatigue": _last_fatigue,
        "summary": summary,
    }


def _ensure_initialized() -> None:
    """Ensure at least one optimization cycle has been executed."""

    if _last_rebalanced_at is None:
        run_full_cycle()


@app.on_event("startup")
def startup_event() -> None:
    """Run an initial cycle and start the background scheduler."""

    _ensure_initialized()
    if not _scheduler.running:
        _scheduler.add_job(run_full_cycle, "interval", minutes=REBALANCE_INTERVAL_MINUTES, id="full_cycle", replace_existing=True)
        _scheduler.start()
        logger.info("Background scheduler started with %s-minute interval", REBALANCE_INTERVAL_MINUTES)


@app.on_event("shutdown")
def shutdown_event() -> None:
    """Stop the background scheduler cleanly."""

    if _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Background scheduler stopped")


@app.get("/health")
def health() -> dict[str, Any]:
    """Return health information for the backend service."""

    return {
        "status": "ok",
        "timestamp": _iso_now(),
        "engines": ["thompson", "attribution", "fatigue"],
    }


@app.get("/api/dashboard", response_model=DashboardData)
def get_dashboard() -> DashboardData:
    """Return the main dashboard payload for the frontend."""

    _ensure_initialized()
    latest_metrics = get_latest()
    summary = _build_dashboard_summary(latest_metrics, _last_fatigue)
    return DashboardData(
        total_budget=summary["total_budget"],
        total_conversions=summary["total_conversions"],
        best_performer=summary["best_performer"],
        fatigue_alert_count=summary["fatigue_alert_count"],
        last_rebalanced=summary["last_rebalanced"],
        next_rebalance_in_minutes=_next_rebalance_minutes(),
        variants=latest_metrics,
        budget_allocations=[BudgetAllocation.model_validate(item) for item in _last_allocations],
        attribution=[AttributionResult.model_validate(item) for item in _last_attribution],
        fatigue_statuses=[FatigueStatus.model_validate(item) for item in _last_fatigue],
    )


@app.get("/api/metrics")
def get_metrics(history: bool = Query(False)) -> dict[str, Any]:
    """Return current metrics or the retained metric history."""

    _ensure_initialized()
    if history:
        return {"history": [[metric.model_dump() for metric in cycle] for cycle in get_history()]}
    return {"metrics": [metric.model_dump() for metric in get_latest()]}


@app.get("/api/budget")
def get_budget() -> dict[str, Any]:
    """Return current budget allocations and schedule timing details."""

    _ensure_initialized()
    return {
        "allocations": _last_allocations,
        "state": thompson_engine.get_state(),
        "last_rebalanced": _last_rebalanced_at.isoformat() if _last_rebalanced_at else _iso_now(),
        "next_rebalance_in_minutes": _next_rebalance_minutes(),
    }


@app.get("/api/attribution")
def get_attribution() -> dict[str, Any]:
    """Return attribution breakdown plus summary discrepancy metrics."""

    _ensure_initialized()
    biggest = max(_last_attribution, key=lambda item: abs(item["difference"]))
    total_misallocated = round(sum(item["budget_change_inr"] for item in _last_attribution), 2)
    return {
        "results": _last_attribution,
        "biggest_discrepancy": biggest["channel"],
        "total_misallocated_inr": total_misallocated,
    }


@app.get("/api/fatigue")
def get_fatigue() -> dict[str, Any]:
    """Return fatigue statuses and aggregate counts."""

    _ensure_initialized()
    return {
        "results": _last_fatigue,
        "fatigued_count": sum(1 for item in _last_fatigue if item["status"] == "FATIGUED"),
        "watch_count": sum(1 for item in _last_fatigue if item["status"] == "WATCH"),
        "healthy_count": sum(1 for item in _last_fatigue if item["status"] == "HEALTHY"),
    }


@app.post("/api/trigger-cycle")
def trigger_cycle() -> dict[str, Any]:
    """Trigger a manual optimization cycle immediately."""

    cycle = run_full_cycle()
    return {"message": "Cycle triggered", "new_allocations": cycle["allocations"]}


@app.get("/api/analytics")
def get_analytics() -> dict[str, Any]:
    """Return chart-ready analytics data from retained simulator history."""

    _ensure_initialized()
    return _chart_history()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)

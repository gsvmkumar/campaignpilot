"""Firebase Admin SDK helpers with safe local fallbacks."""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv

from models import AttributionResult, BudgetAllocation, FatigueStatus, VariantMetrics

logger = logging.getLogger(__name__)

load_dotenv()

_firestore_client: Any | None = None
_realtime_root: Any | None = None
_initialized = False
_latest_metrics_cache: list[dict[str, Any]] = []
_budget_state_cache: dict[str, float] = {}
_dashboard_summary_cache: dict[str, Any] = {}


def _initialize() -> None:
    """Initialize Firebase clients if credentials are available."""

    global _firestore_client, _realtime_root, _initialized

    if _initialized:
        return

    try:
        import firebase_admin
        from firebase_admin import credentials, db, firestore
    except Exception as exc:
        logger.warning("Firebase SDK unavailable; running in local-only mode: %s", exc)
        _initialized = True
        return

    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    database_url = os.getenv("FIREBASE_DATABASE_URL")
    if not service_account_path or not database_url or not os.path.exists(service_account_path):
        logger.warning("Firebase credentials missing or invalid; running in local-only mode")
        _initialized = True
        return

    try:
        if not firebase_admin._apps:
            firebase_admin.initialize_app(
                credentials.Certificate(service_account_path),
                {"databaseURL": database_url},
            )
        _firestore_client = firestore.client()
        _realtime_root = db.reference("/")
        logger.info("Firebase initialized successfully")
    except Exception as exc:
        logger.exception("Failed to initialize Firebase; using local-only mode: %s", exc)
    finally:
        _initialized = True


def write_metrics(metrics: list[VariantMetrics]) -> None:
    """Write per-variant metrics to Firestore and keep a local cache."""

    global _latest_metrics_cache
    _initialize()
    _latest_metrics_cache = [metric.model_dump() for metric in metrics]

    if _firestore_client is None:
        logger.info("Skipping Firebase metric write; local-only mode active")
        return

    for metric in metrics:
        try:
            document_id = f"{metric.variant_id}_{metric.timestamp}"
            _firestore_client.collection("variant_metrics").document(document_id).set(metric.model_dump())
        except Exception as exc:
            logger.exception("Failed to write metric %s to Firebase: %s", metric.variant_id, exc)


def write_budget_state(allocations: list[BudgetAllocation]) -> None:
    """Write live budget allocation percentages to Realtime Database and cache them."""

    global _budget_state_cache
    _initialize()
    _budget_state_cache = {
        allocation.variant_id: allocation.budget_percentage for allocation in allocations
    }

    if _realtime_root is None:
        logger.info("Skipping Firebase budget state write; local-only mode active")
        return

    try:
        _realtime_root.child("budget_state").set(_budget_state_cache)
    except Exception as exc:
        logger.exception("Failed to write budget state to Firebase: %s", exc)


def write_attribution(results: list[AttributionResult]) -> None:
    """Write attribution results to Firestore."""

    _initialize()
    if _firestore_client is None:
        logger.info("Skipping Firebase attribution write; local-only mode active")
        return

    if not results:
        return

    timestamp = datetime.now(timezone.utc).isoformat()
    for result in results:
        try:
            document_id = f"attribution_{timestamp}_{result.channel.lower()}"
            _firestore_client.collection("attribution").document(document_id).set(result.model_dump())
        except Exception as exc:
            logger.exception("Failed to write attribution for %s: %s", result.channel, exc)


def write_fatigue(statuses: list[FatigueStatus]) -> None:
    """Write latest fatigue statuses to Firestore."""

    _initialize()
    if _firestore_client is None:
        logger.info("Skipping Firebase fatigue write; local-only mode active")
        return

    for status in statuses:
        try:
            _firestore_client.collection("fatigue_alerts").document(status.variant_id).set(
                status.model_dump(),
                merge=False,
            )
        except Exception as exc:
            logger.exception("Failed to write fatigue status for %s: %s", status.variant_id, exc)


def write_dashboard_summary(data: dict[str, Any]) -> None:
    """Write dashboard summary data to Realtime Database and cache it."""

    global _dashboard_summary_cache
    _initialize()
    _dashboard_summary_cache = dict(data)

    if _realtime_root is None:
        logger.info("Skipping Firebase dashboard summary write; local-only mode active")
        return

    try:
        _realtime_root.child("dashboard_summary").set(data)
    except Exception as exc:
        logger.exception("Failed to write dashboard summary to Firebase: %s", exc)


def read_budget_state() -> dict[str, float]:
    """Read the latest budget state from Firebase or local cache."""

    _initialize()
    if _realtime_root is None:
        return dict(_budget_state_cache)

    try:
        payload = _realtime_root.child("budget_state").get()
        return payload or dict(_budget_state_cache)
    except Exception as exc:
        logger.exception("Failed to read budget state from Firebase: %s", exc)
        return dict(_budget_state_cache)


def read_latest_metrics() -> list[dict[str, Any]]:
    """Read latest metric documents from local cache."""

    return list(_latest_metrics_cache)

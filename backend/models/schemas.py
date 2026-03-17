"""Shared Pydantic models for CampaignPilot backend services."""

from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional


class VariantMetrics(BaseModel):
    """Performance metrics for a single campaign variant in one cycle."""

    variant_id: str = Field(description='Variant identifier, e.g. "variant_a".')
    name: str = Field(description='Display name, e.g. "Instagram Video".')
    channel: str = Field(description='Marketing channel, e.g. "Instagram".')
    benchmark_category: str | None = Field(
        default=None,
        description='Source benchmark category, e.g. "Animals & Pets".',
    )
    impressions: int = Field(ge=0)
    clicks: int = Field(ge=0)
    ctr: float = Field(ge=0.0, le=100.0, description="Clicks / impressions as a percentage.")
    conversions: int = Field(ge=0)
    spend: float = Field(ge=0.0, description="Spend in INR for the cycle.")
    conversion_rate: float = Field(
        ge=0.0,
        le=100.0,
        description="Conversions / clicks as a percentage.",
    )
    timestamp: str = Field(description="ISO formatted timestamp.")


class BudgetAllocation(BaseModel):
    """Budget recommendation emitted by the Thompson Sampling engine."""

    variant_id: str
    name: str
    budget_percentage: float = Field(ge=0.0, le=100.0)
    alpha: float = Field(ge=0.0, description="Thompson Sampling alpha parameter.")
    beta: float = Field(ge=0.0, description="Thompson Sampling beta parameter.")
    updated_at: str = Field(description="ISO formatted timestamp.")


class AttributionResult(BaseModel):
    """Channel-level attribution comparison between last-click and Shapley credit."""

    channel: str
    last_click_credit: float = Field(ge=0.0, le=100.0)
    shapley_credit: float = Field(ge=0.0, le=100.0)
    difference: float = Field(description="Shapley credit minus last-click credit.")
    recommendation: str = Field(description='One of "increase", "decrease", or "maintain".')
    budget_change_inr: float = Field(ge=0.0, description="Suggested budget change in INR.")


class FatigueStatus(BaseModel):
    """Creative fatigue analysis for a single variant."""

    variant_id: str
    name: str
    channel: str
    ctr_history: list[float] = Field(
        default_factory=list,
        description="Last seven CTR readings as percentages.",
    )
    decay_slope: float = Field(description="Regression slope across recent CTR readings.")
    status: str = Field(description='One of "HEALTHY", "WATCH", or "FATIGUED".')
    alert_message: str


class PlatformRecommendation(BaseModel):
    """Recommended platform mix for a user-provided business domain."""

    platform: str
    recommended_budget_percent: float = Field(ge=0.0, le=100.0)
    rationale: str


class DomainStrategy(BaseModel):
    """Domain-specific strategy inferred from benchmark signals."""

    requested_domain: str
    matched_domain: str
    confidence: float = Field(ge=0.0, le=1.0)
    benchmark_ctr_percent: float = Field(ge=0.0)
    benchmark_conversion_rate_percent: float = Field(ge=0.0)
    recommended_platforms: list[PlatformRecommendation] = Field(default_factory=list)


class DashboardData(BaseModel):
    """Aggregated payload for the main dashboard screen."""

    total_budget: float = Field(ge=0.0)
    total_conversions: int = Field(ge=0)
    best_performer: str
    fatigue_alert_count: int = Field(ge=0)
    last_rebalanced: str = Field(description="ISO formatted timestamp.")
    next_rebalance_in_minutes: int = Field(ge=0)
    variants: list[VariantMetrics] = Field(default_factory=list)
    budget_allocations: list[BudgetAllocation] = Field(default_factory=list)
    attribution: list[AttributionResult] = Field(default_factory=list)
    fatigue_statuses: list[FatigueStatus] = Field(default_factory=list)
    domain_strategy: Optional[DomainStrategy] = None

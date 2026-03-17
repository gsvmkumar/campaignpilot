"use client"

import { differenceInSeconds, formatDistanceToNow, parseISO } from "date-fns"

export interface BackendVariantMetrics {
  variant_id: string
  name: string
  channel: string
  benchmark_category?: string | null
  impressions: number
  clicks: number
  ctr: number
  conversions: number
  spend: number
  conversion_rate: number
  timestamp: string
}

export interface BackendBudgetAllocation {
  variant_id: string
  name: string
  budget_percentage: number
  alpha: number
  beta: number
  updated_at: string
}

export interface BackendFatigueStatus {
  variant_id: string
  name: string
  channel: string
  ctr_history: number[]
  decay_slope: number
  status: "HEALTHY" | "WATCH" | "FATIGUED"
  alert_message: string
}

export interface DashboardResponse {
  total_budget: number
  total_conversions: number
  best_performer: string
  fatigue_alert_count: number
  last_rebalanced: string
  next_rebalance_in_minutes: number
  variants: BackendVariantMetrics[]
  budget_allocations: BackendBudgetAllocation[]
  attribution: Array<{
    channel: string
    last_click_credit: number
    shapley_credit: number
    difference: number
    recommendation: string
    budget_change_inr: number
  }>
  fatigue_statuses: BackendFatigueStatus[]
  domain_strategy?: {
    requested_domain: string
    matched_domain: string
    confidence: number
    benchmark_ctr_percent: number
    benchmark_conversion_rate_percent: number
    recommended_platforms: Array<{
      platform: string
      recommended_budget_percent: number
      rationale: string
    }>
  } | null
}

export interface AnalyticsResponse {
  variant_ctr_history: Array<Record<string, string | number>>
  daily_spend: Array<{ cycle: string; spend: number }>
  daily_conversions: Array<{ cycle: string; conversions: number }>
  rebalance_history: Array<{
    timestamp: string
    allocations: Record<string, number>
    changes: Record<string, number>
  }>
}

export interface DomainsResponse {
  domains: string[]
}

export interface AttributionResponse {
  results: Array<{
    channel: string
    last_click_credit: number
    shapley_credit: number
    difference: number
    recommendation: string
    budget_change_inr: number
  }>
  biggest_discrepancy: string
  total_misallocated_inr: number
}

export interface FatigueResponse {
  results: BackendFatigueStatus[]
  fatigued_count: number
  watch_count: number
  healthy_count: number
}

export interface DataSummaryResponse {
  data_source: string
  benchmark_medians: {
    ctr_percent: number | null
    conversion_rate_percent: number | null
  }
  top_benchmark_categories: Array<{
    business_category: string
    ctr_percent: number
    conversion_rate_percent: number
    score: number
  }>
  variant_count: number
  variants: Array<Record<string, unknown>>
  journey_count: number
  fatigue_segments: Array<Record<string, unknown>>
}

export interface IntelligenceSignal {
  type: string
  metric: string
  severity: number
  color: string
  title: string
  message: string
  action: string
  actual: number
  benchmark: number
  delta: number
  timestamp: string
  potential_conversions?: number
}

export interface ScoredVariant {
  variant_id?: string | null
  variant_name: string
  channel: string
  industry: string
  benchmark_category?: string | null
  performance_index: number
  grade: string
  grade_label: string
  actual_ctr: number
  actual_cvr: number
  actual_cpc: number
  actual_cpl: number
  spend: number
  conversions: number
  clicks: number
  impressions: number
  bench_ctr: number
  bench_cvr: number
  bench_cpc: number
  bench_cpl: number
  ctr_delta: number
  cvr_delta: number
  cpc_delta: number
  cpl_delta: number
  ctr_score: number
  cvr_score: number
  cpc_score: number
  cpl_score: number
}

export interface IntelligenceRecommendation {
  priority: number
  category: string
  impact: string
  color: string
  title: string
  body: string
  metric: string
  value: string
  variant: string
  realloc_detail?: Record<string, number>
}

export interface IntelligenceResponse {
  generated_at: string
  variant_count: number
  selected_industry?: string | null
  executive_summary: {
    average_performance_index: number
    outperforming_count: number
    underperforming_count: number
    grade_distribution: Record<string, number>
    summary_text: string
    top_variant?: {
      variant_name: string
      channel: string
      performance_index: number
      grade: string
    } | null
  }
  scored_variants: ScoredVariant[]
  signals: Record<string, IntelligenceSignal[]>
  top_signals: Array<
    IntelligenceSignal & {
      variant_id?: string | null
      variant_name: string
      channel: string
      industry: string
    }
  >
  recommendations: IntelligenceRecommendation[]
}

export interface DashboardVariant {
  id: string
  variantId: string
  name: string
  platform: string
  benchmarkCategory?: string
  iconPath: string
  budget: number
  ctr: number
  conversions: number
  spend: number
  status: "healthy" | "watch" | "fatigued"
  fatigueScore: number
  color: string
}

export interface DashboardMetricCard {
  label: string
  value: number | string
  format: "currency" | "number" | "text"
  subValue?: string
  change?: string
  trend?: "up" | "down"
  alertLevel?: "warning"
}

export interface ActivityItem {
  id: number
  time: string
  event: string
  type: "budget" | "alert" | "positive" | "system" | "warning"
}

const COLOR_MAP: Record<DashboardVariant["status"], string> = {
  healthy: "#22c55e",
  watch: "#f59e0b",
  fatigued: "#ef4444",
}

function getApiBaseUrl(): string {
  return "/backend-api"
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    const responseText = await response.text()
    throw new Error(`Failed to fetch ${path}: ${response.status}${responseText ? ` - ${responseText}` : ""}`)
  }

  return response.json() as Promise<T>
}

export async function fetchDashboard(domain?: string): Promise<DashboardResponse> {
  const params = new URLSearchParams()
  if (domain) {
    params.set("domain", domain)
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : ""
  return fetchJson<DashboardResponse>(`/api/dashboard${suffix}`)
}

export async function fetchAnalytics(): Promise<AnalyticsResponse> {
  return fetchJson<AnalyticsResponse>("/api/analytics")
}

export async function fetchDomains(): Promise<DomainsResponse> {
  return fetchJson<DomainsResponse>("/api/domains")
}

export async function fetchAttribution(): Promise<AttributionResponse> {
  return fetchJson<AttributionResponse>("/api/attribution")
}

export async function fetchFatigue(): Promise<FatigueResponse> {
  return fetchJson<FatigueResponse>("/api/fatigue")
}

export async function fetchDataSummary(): Promise<DataSummaryResponse> {
  return fetchJson<DataSummaryResponse>("/api/data-summary")
}

export async function fetchIntelligence(domain?: string): Promise<IntelligenceResponse> {
  const params = new URLSearchParams()
  if (domain) {
    params.set("domain", domain)
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : ""
  return fetchJson<IntelligenceResponse>(`/api/intelligence${suffix}`)
}

function variantLetter(variantId: string): string {
  const suffix = variantId.split("_").pop()
  return suffix ? suffix.toUpperCase() : variantId
}

function fatigueScore(status: BackendFatigueStatus | undefined): number {
  if (!status) {
    return 20
  }

  if (status.status === "FATIGUED") {
    return Math.min(100, Math.round(75 + Math.abs(status.decay_slope) * 100))
  }
  if (status.status === "WATCH") {
    return Math.min(100, Math.round(50 + Math.abs(status.decay_slope) * 100))
  }
  return Math.max(10, Math.round(20 + Math.abs(status.decay_slope) * 40))
}

function statusToUi(status: BackendFatigueStatus["status"] | undefined): DashboardVariant["status"] {
  if (status === "FATIGUED") {
    return "fatigued"
  }
  if (status === "WATCH") {
    return "watch"
  }
  return "healthy"
}

export function adaptVariants(data: DashboardResponse): DashboardVariant[] {
  const fatigueById = new Map(data.fatigue_statuses.map((item) => [item.variant_id, item]))
  const budgetById = new Map(data.budget_allocations.map((item) => [item.variant_id, item.budget_percentage]))

  return data.variants.map((variant) => {
    const fatigue = fatigueById.get(variant.variant_id)
    const status = statusToUi(fatigue?.status)
    return {
      id: variantLetter(variant.variant_id),
      variantId: variant.variant_id,
      name: variant.name,
      platform: variant.channel,
      benchmarkCategory: variant.benchmark_category ?? undefined,
      iconPath: getVariantIconPath(variant.variant_id),
      budget: Number((budgetById.get(variant.variant_id) ?? 0).toFixed(1)),
      ctr: Number(variant.ctr.toFixed(2)),
      conversions: variant.conversions,
      spend: Number(variant.spend.toFixed(2)),
      status,
      fatigueScore: fatigueScore(fatigue),
      color: COLOR_MAP[status],
    }
  })
}

export function getVariantIconPath(variantId: string): string {
  return `/apps/${variantId}.svg`
}

export function getPlatformIcon(platform: string): string {
  const normalized = platform.trim().toLowerCase()

  if (normalized.includes("instagram")) {
    return "IG"
  }
  if (normalized.includes("facebook")) {
    return "FB"
  }
  if (normalized.includes("youtube")) {
    return "YT"
  }
  if (normalized.includes("search")) {
    return "GS"
  }
  if (normalized.includes("display")) {
    return "GD"
  }
  if (normalized.includes("email")) {
    return "EM"
  }

  return platform
    .split(" ")
    .map((word) => word[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function buildMetricCards(data: DashboardResponse): DashboardMetricCard[] {
  const bestVariant = data.variants.find((item) => item.name === data.best_performer)

  return [
    {
      label: "Total Budget Spent",
      value: data.total_budget,
      format: "currency",
      change: `${data.next_rebalance_in_minutes} min to rebalance`,
      trend: "up",
    },
    {
      label: "Total Conversions",
      value: data.total_conversions,
      format: "number",
      change: `${data.variants.length} active variants`,
      trend: "up",
    },
    {
      label: "Best Performing",
      value: data.best_performer,
      subValue: bestVariant ? `${bestVariant.ctr.toFixed(2)}% CTR` : undefined,
      format: "text",
    },
    {
      label: "Active Fatigue Alerts",
      value: data.fatigue_alert_count,
      format: "number",
      alertLevel: data.fatigue_alert_count > 0 ? "warning" : undefined,
    },
  ]
}

export function buildActivityFeed(data: DashboardResponse, analytics: AnalyticsResponse): ActivityItem[] {
  const items: ActivityItem[] = []
  const latestChange = analytics.rebalance_history.at(-1)

  if (latestChange) {
    const biggestShift = Object.entries(latestChange.changes).sort(
      (a, b) => Math.abs(b[1]) - Math.abs(a[1]),
    )[0]
    if (biggestShift) {
      items.push({
        id: items.length + 1,
        time: formatDistanceToNow(parseISO(latestChange.timestamp), { addSuffix: true }),
        event: `${biggestShift[0]} rebalanced ${biggestShift[1] > 0 ? "+" : ""}${biggestShift[1].toFixed(1)}%`,
        type: "budget",
      })
    }
  }

  data.fatigue_statuses
    .filter((item) => item.status !== "HEALTHY")
    .slice(0, 2)
    .forEach((item) => {
      items.push({
        id: items.length + 1,
        time: "Current cycle",
        event: `${item.name}: ${item.alert_message}`,
        type: item.status === "FATIGUED" ? "alert" : "warning",
      })
    })

  const bestVariant = data.variants.reduce((best, current) =>
    current.conversions > best.conversions ? current : best,
  )
  items.push({
    id: items.length + 1,
    time: "Current cycle",
    event: `${bestVariant.name} is leading with ${bestVariant.conversions} conversions`,
    type: "positive",
  })
  items.push({
    id: items.length + 1,
    time: formatDistanceToNow(parseISO(data.last_rebalanced), { addSuffix: true }),
    event: "Thompson Sampling rebalance complete",
    type: "system",
  })

  return items
}

export function buildCtrTrendData(
  variants: DashboardVariant[],
  analytics: AnalyticsResponse,
): Array<Record<string, string | number>> {
  return analytics.variant_ctr_history.map((row, index) => {
    const mapped: Record<string, string | number> = {
      hour: typeof row.cycle === "string" ? row.cycle : `Cycle ${index + 1}`,
    }
    variants.forEach((variant) => {
      const value = row[variant.variantId]
      mapped[variant.id] = typeof value === "number" ? value : variant.ctr
    })
    return mapped
  })
}

export function buildBudgetHistory(
  variants: DashboardVariant[],
  analytics: AnalyticsResponse,
): Array<Record<string, string | number>> {
  return analytics.rebalance_history.map((row, index) => {
    const mapped: Record<string, string | number> = {
      cycle: `Cycle ${index + 1}`,
    }
    variants.forEach((variant) => {
      mapped[variant.id] = Number((row.allocations[variant.variantId] ?? variant.budget).toFixed(2))
    })
    return mapped
  })
}

export function secondsToNextRebalance(lastRebalanced: string, nextMinutes: number): number {
  const elapsed = differenceInSeconds(new Date(), parseISO(lastRebalanced))
  return Math.max(0, nextMinutes * 60 - Math.max(0, elapsed))
}

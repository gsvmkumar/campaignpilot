"use client"

import { differenceInSeconds, formatDistanceToNow, parseISO } from "date-fns"

export interface BackendVariantMetrics {
  variant_id: string
  name: string
  channel: string
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

export interface DashboardVariant {
  id: string
  variantId: string
  name: string
  platform: string
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
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080"
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  return fetchJson<DashboardResponse>("/api/dashboard")
}

export async function fetchAnalytics(): Promise<AnalyticsResponse> {
  return fetchJson<AnalyticsResponse>("/api/analytics")
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

export function secondsToNextRebalance(lastRebalanced: string, nextMinutes: number): number {
  const elapsed = differenceInSeconds(new Date(), parseISO(lastRebalanced))
  return Math.max(0, nextMinutes * 60 - Math.max(0, elapsed))
}

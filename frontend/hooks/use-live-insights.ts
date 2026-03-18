"use client"

import { startTransition, useEffect, useState } from "react"

import {
  AnalyticsResponse,
  AttributionResponse,
  DashboardResponse,
  DataSummaryResponse,
  FatigueResponse,
  fetchAnalytics,
  fetchAttribution,
  fetchDashboard,
  fetchDataSummary,
  fetchFatigue,
} from "@/lib/campaignpilot"

interface LiveInsightsState {
  dashboard: DashboardResponse | null
  analytics: AnalyticsResponse | null
  attribution: AttributionResponse | null
  fatigue: FatigueResponse | null
  dataSummary: DataSummaryResponse | null
  error: string | null
  lastUpdatedAt: string | null
}

export function useLiveInsights(domain?: string, intervalMs = 30_000): LiveInsightsState {
  const [state, setState] = useState<LiveInsightsState>({
    dashboard: null,
    analytics: null,
    attribution: null,
    fatigue: null,
    dataSummary: null,
    error: null,
    lastUpdatedAt: null,
  })

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [dashboard, analytics, attribution, fatigue, dataSummary] = await Promise.all([
          fetchDashboard(domain),
          fetchAnalytics(),
          fetchAttribution(domain),
          fetchFatigue(),
          fetchDataSummary(),
        ])

        if (!active) {
          return
        }

        startTransition(() => {
          setState({
            dashboard,
            analytics,
            attribution,
            fatigue,
            dataSummary,
            error: null,
            lastUpdatedAt: new Date().toISOString(),
          })
        })
      } catch (error) {
        if (!active) {
          return
        }
        setState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : "Failed to load live insights",
        }))
      }
    }

    load()
    const timer = setInterval(load, intervalMs)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [domain, intervalMs])

  return state
}

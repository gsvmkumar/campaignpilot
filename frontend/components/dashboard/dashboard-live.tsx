"use client"

import { startTransition, useEffect, useState } from "react"

import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { BudgetAllocationChart } from "@/components/dashboard/budget-allocation-chart"
import { BudgetSankey } from "@/components/dashboard/budget-sankey"
import { CountdownTimer } from "@/components/dashboard/countdown-timer"
import { CTRSparklines } from "@/components/dashboard/ctr-sparklines"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  AnalyticsResponse,
  DashboardResponse,
  adaptVariants,
  buildActivityFeed,
  buildCtrTrendData,
  buildMetricCards,
  fetchAnalytics,
  fetchDashboard,
} from "@/lib/campaignpilot"

export function DashboardLive() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [dashboardData, analyticsData] = await Promise.all([
          fetchDashboard(),
          fetchAnalytics(),
        ])

        if (!active) {
          return
        }

        startTransition(() => {
          setDashboard(dashboardData)
          setAnalytics(analyticsData)
          setError(null)
        })
      } catch (loadError) {
        if (!active) {
          return
        }
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard data")
      }
    }

    load()
    const interval = setInterval(load, 30_000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time campaign optimization with Thompson Sampling
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {!dashboard || !analytics ? (
          <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            Loading live dashboard data from the backend...
          </div>
        ) : (
          (() => {
            const variants = adaptVariants(dashboard)
            const metricCards = buildMetricCards(dashboard)
            const activityFeed = buildActivityFeed(dashboard, analytics)
            const ctrTrendData = buildCtrTrendData(variants, analytics)

            return (
              <>
                <MetricCards metrics={metricCards} />
                <CountdownTimer
                  lastRebalanced={dashboard.last_rebalanced}
                  nextRebalanceInMinutes={dashboard.next_rebalance_in_minutes}
                />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <BudgetAllocationChart variants={variants} />
                    <BudgetSankey variants={variants} totalBudget={dashboard.total_budget} />
                  </div>
                  <div className="lg:col-span-1">
                    <ActivityFeed activityEvents={activityFeed} />
                  </div>
                </div>
                <CTRSparklines variants={variants} ctrTrendData={ctrTrendData} />
              </>
            )
          })()
        )}
      </div>
    </DashboardLayout>
  )
}

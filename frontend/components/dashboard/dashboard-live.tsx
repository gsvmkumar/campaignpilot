"use client"

import { startTransition, useEffect, useState } from "react"

import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { BudgetAllocationChart } from "@/components/dashboard/budget-allocation-chart"
import { BudgetSankey } from "@/components/dashboard/budget-sankey"
import { CountdownTimer } from "@/components/dashboard/countdown-timer"
import { CTRSparklines } from "@/components/dashboard/ctr-sparklines"
import { DomainStrategyCard } from "@/components/dashboard/domain-strategy-card"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  AnalyticsResponse,
  DashboardResponse,
  adaptVariants,
  buildActivityFeed,
  buildCtrTrendData,
  buildMetricCards,
  fetchDomains,
  fetchAnalytics,
  fetchDashboard,
} from "@/lib/campaignpilot"
import { getDefaultDomain, loadSelectedDomain, saveSelectedDomain } from "@/lib/domain-selection"

export function DashboardLive() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [domain, setDomain] = useState(getDefaultDomain)
  const [domainInput, setDomainInput] = useState(getDefaultDomain)
  const [suggestedDomains, setSuggestedDomains] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedDomain = loadSelectedDomain()
    setDomain(storedDomain)
    setDomainInput(storedDomain)
  }, [])

  useEffect(() => {
    saveSelectedDomain(domain)
  }, [domain])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [dashboardData, analyticsData] = await Promise.all([
          fetchDashboard(domain),
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

    async function loadSuggestedDomains() {
      try {
        const payload = await fetchDomains()
        if (!active) {
          return
        }
        setSuggestedDomains(payload.domains)
      } catch {
        if (!active) {
          return
        }
        setSuggestedDomains(["Furniture", "Business Services", "Finance & Insurance", "Beauty & Personal Care"])
      }
    }

    loadSuggestedDomains()
    load()
    const interval = setInterval(load, 30_000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [domain])

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
                <DomainStrategyCard
                  domain={domain}
                  domainInput={domainInput}
                  suggestedDomains={suggestedDomains}
                  strategy={dashboard.domain_strategy}
                  onDomainInputChange={setDomainInput}
                  onApplyDomain={() => {
                    const nextDomain = domainInput.trim()
                    if (nextDomain) {
                      setDomain(nextDomain)
                      saveSelectedDomain(nextDomain)
                    }
                  }}
                  onSelectSuggestedDomain={(value) => {
                    setDomainInput(value)
                    setDomain(value)
                    saveSelectedDomain(value)
                  }}
                />
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

"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Activity, ArrowUpRight, Flame, Gauge, RefreshCcw } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adaptVariants, buildBudgetHistory, buildCtrTrendData, DashboardVariant, getPlatformIcon } from "@/lib/campaignpilot"
import { getDefaultDomain, loadSelectedDomain } from "@/lib/domain-selection"
import { useLiveInsights } from "@/hooks/use-live-insights"

const lineColors = ["#22c55e", "#38bdf8", "#f59e0b", "#ef4444", "#a855f7", "#f97316"]

export default function CampaignsPage() {
  const [sortBy, setSortBy] = useState("best")
  const [domain, setDomain] = useState(getDefaultDomain)
  const { dashboard, analytics, error, lastUpdatedAt } = useLiveInsights(domain, 20_000)

  useEffect(() => {
    setDomain(loadSelectedDomain())
  }, [])

  const variants = useMemo(() => {
    if (!dashboard) {
      return []
    }

    const adapted = adaptVariants(dashboard)
    const maxConversions = Math.max(...adapted.map((item) => item.conversions), 1)
    return [...adapted].sort((left, right) => {
      const leftScore = (left.ctr * 0.45) + ((left.conversions / maxConversions) * 35) + ((100 - left.fatigueScore) * 0.2)
      const rightScore = (right.ctr * 0.45) + ((right.conversions / maxConversions) * 35) + ((100 - right.fatigueScore) * 0.2)

      switch (sortBy) {
        case "best":
          return rightScore - leftScore
        case "fatigue_high":
          return right.fatigueScore - left.fatigueScore
        case "ctr":
          return right.ctr - left.ctr
        case "conversions":
          return right.conversions - left.conversions
        case "spend":
          return right.spend - left.spend
        case "fatigue_low":
          return left.fatigueScore - right.fatigueScore
        default:
          return rightScore - leftScore
      }
    })
  }, [dashboard, sortBy])

  const platformRankings = useMemo(() => {
    if (!dashboard) {
      return []
    }

    const recommendedPlatforms = dashboard.domain_strategy?.recommended_platforms ?? []
    if (recommendedPlatforms.length === 0) {
      return variants
    }

    return variants.map((variant, index) => {
      const recommended = recommendedPlatforms[index % recommendedPlatforms.length]
      return {
        ...variant,
        platform: recommended.platform,
        benchmarkCategory: dashboard.domain_strategy?.matched_domain ?? variant.benchmarkCategory,
        recommendedBudgetPercent: recommended.recommended_budget_percent,
        platformRationale: recommended.rationale,
      }
    })
  }, [dashboard, variants])

  const ctrTrendData = dashboard && analytics ? buildCtrTrendData(platformRankings as DashboardVariant[], analytics) : []
  const budgetHistory = dashboard && analytics ? buildBudgetHistory(platformRankings as DashboardVariant[], analytics) : []

  const performanceChartData = platformRankings.map((variant) => ({
    name: variant.platform,
    ctr: variant.ctr,
    conversions: variant.conversions,
    fatigue: variant.fatigueScore,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">
              Live platform ranking for the selected domain, ordered by real-time performance, fatigue, and conversion quality.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              Domain: {domain}
            </div>
            <div className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs text-success">
              {lastUpdatedAt ? `Live sync ${new Date(lastUpdatedAt).toLocaleTimeString()}` : "Connecting..."}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[220px] border-border bg-secondary">
                <SelectValue placeholder="Sort campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best">Best platform first</SelectItem>
                <SelectItem value="fatigue_low">Lowest fatigue first</SelectItem>
                <SelectItem value="fatigue_high">Highest fatigue first</SelectItem>
                <SelectItem value="ctr">Highest CTR</SelectItem>
                <SelectItem value="conversions">Highest conversions</SelectItem>
                <SelectItem value="spend">Highest spend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {platformRankings.map((variant, index) => (
            <Card key={variant.variantId} className="border-border bg-card">
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                      {getPlatformIcon(variant.platform)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{variant.platform}</p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="truncate text-xs text-muted-foreground">
                          Creative: {variant.name}
                        </span>
                        {variant.benchmarkCategory ? (
                          <span className="truncate text-xs text-muted-foreground">
                            Domain: {variant.benchmarkCategory}
                          </span>
                        ) : null}
                        {"recommendedBudgetPercent" in variant ? (
                          <span className="truncate text-xs text-primary">
                            Recommended mix: {Number(variant.recommendedBudgetPercent).toFixed(1)}%
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`rounded-full px-2 py-1 text-xs ${
                      variant.status === "healthy"
                        ? "bg-success/10 text-success"
                        : variant.status === "watch"
                          ? "bg-warning/10 text-warning"
                          : "bg-danger/10 text-danger"
                    }`}>
                      {variant.status}
                    </div>
                    <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                      index === 0
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {index === 0 ? "Best now" : `Rank #${index + 1}`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Budget</p>
                    <p className="mt-1 text-lg font-semibold">{variant.budget.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">CTR</p>
                    <p className="mt-1 text-lg font-semibold">{variant.ctr.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Conversions</p>
                    <p className="mt-1 text-lg font-semibold">{variant.conversions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Fatigue</p>
                    <p className={`mt-1 text-lg font-semibold ${
                      variant.fatigueScore >= 70 ? "text-danger" : variant.fatigueScore >= 50 ? "text-warning" : "text-success"
                    }`}>
                      {variant.fatigueScore}/100
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>User interest health</span>
                    <span>{variant.fatigueScore >= 70 ? "Dropping fast" : variant.fatigueScore >= 50 ? "Watch closely" : "Stable"}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${
                        variant.fatigueScore >= 70 ? "bg-danger" : variant.fatigueScore >= 50 ? "bg-warning" : "bg-success"
                      }`}
                      style={{ width: `${variant.fatigueScore}%` }}
                    />
                  </div>
                  {"platformRationale" in variant ? (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {String(variant.platformRationale)}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <Gauge className="h-4 w-4 text-primary" />
                Performance vs Fatigue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceChartData}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 12 }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ctr" name="CTR %" fill="#22c55e" radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="right" dataKey="fatigue" name="Fatigue Score" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <RefreshCcw className="h-4 w-4 text-primary" />
                Live CTR Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ctrTrendData}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 12 }} />
                    <Legend />
                    {platformRankings.map((variant, index) => (
                      <Area
                        key={variant.variantId}
                        type="monotone"
                        dataKey={variant.id}
                        name={variant.platform}
                        stroke={lineColors[index % lineColors.length]}
                        fill={lineColors[index % lineColors.length]}
                        fillOpacity={0.08}
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Activity className="h-4 w-4 text-primary" />
              Real-Time Budget Evolution
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-success" />
              Updated from optimizer history
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={budgetHistory}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="cycle" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 12 }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, "Budget"]}
                  />
                  <Legend />
                  {platformRankings.map((variant, index) => (
                    <Area
                      key={variant.variantId}
                      type="monotone"
                      dataKey={variant.id}
                      name={variant.platform}
                      stackId="1"
                      stroke={lineColors[index % lineColors.length]}
                      fill={lineColors[index % lineColors.length]}
                      fillOpacity={0.32}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {platformRankings.slice(0, 3).map((variant) => (
                <div key={variant.variantId} className="rounded-xl border border-border bg-secondary/20 p-3">
                  <div className="flex items-center gap-2">
                    <Flame className={`h-4 w-4 ${variant.fatigueScore >= 70 ? "text-danger" : variant.fatigueScore >= 50 ? "text-warning" : "text-success"}`} />
                    <p className="font-medium">{variant.platform}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {variant.fatigueScore >= 70
                      ? "Most users are losing interest rapidly."
                      : variant.fatigueScore >= 50
                        ? "Interest is softening and needs monitoring."
                        : "User response is still strong and stable."}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

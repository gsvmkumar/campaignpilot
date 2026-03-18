"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AlertTriangle, BrainCircuit, Gauge, Lightbulb, ShieldAlert, TrendingUp } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchDomains, fetchIntelligence, IntelligenceResponse } from "@/lib/campaignpilot"
import { getDefaultDomain, loadSelectedDomain, saveSelectedDomain } from "@/lib/domain-selection"

const gradeColors: Record<string, string> = {
  A: "#22c55e",
  B: "#84cc16",
  C: "#f59e0b",
  D: "#f97316",
  F: "#ef4444",
}

export default function IntelligencePage() {
  const [domain, setDomain] = useState(getDefaultDomain)
  const [domains, setDomains] = useState<string[]>([])
  const [payload, setPayload] = useState<IntelligenceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = loadSelectedDomain()
    setDomain(stored)
  }, [])

  useEffect(() => {
    let active = true

    async function loadDomains() {
      try {
        const response = await fetchDomains()
        if (active) {
          setDomains(response.domains)
        }
      } catch {
        if (active) {
          setDomains(["Furniture", "Health & Fitness", "Shopping & Retail", "Finance & Insurance"])
        }
      }
    }

    async function loadIntelligence() {
      try {
        const response = await fetchIntelligence(domain)
        if (!active) {
          return
        }
        setPayload(response)
        setError(null)
      } catch (loadError) {
        if (!active) {
          return
        }
        setError(loadError instanceof Error ? loadError.message : "Failed to load domain intelligence")
      }
    }

    loadDomains()
    loadIntelligence()
    const timer = setInterval(loadIntelligence, 30_000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [domain])

  const performanceChartData = useMemo(
    () =>
      (payload?.scored_variants ?? []).map((variant) => ({
        name: variant.channel,
        performance_index: variant.performance_index,
        grade: variant.grade,
      })),
    [payload],
  )

  const ctrComparisonData = useMemo(
    () =>
      (payload?.scored_variants ?? []).slice(0, 6).map((variant) => ({
        name: variant.channel,
        actual: variant.actual_ctr,
        benchmark: variant.bench_ctr,
      })),
    [payload],
  )

  const summary = payload?.executive_summary

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Domain Intelligence</h1>
            <p className="text-muted-foreground">
              Benchmark every live metric against WordStream industry standards and turn raw performance into competitive signals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              Benchmark: {domain}
            </div>
            <Select
              value={domain}
              onValueChange={(value) => {
                setDomain(value)
                saveSelectedDomain(value)
              }}
            >
              <SelectTrigger className="w-[240px] border-border bg-secondary">
                <SelectValue placeholder="Choose industry benchmark" />
              </SelectTrigger>
              <SelectContent>
                {(domains.length > 0 ? domains : [domain]).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {!payload || !summary ? (
          <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            Loading benchmark intelligence from the backend...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <Gauge className="h-4 w-4" />
                    <p className="text-sm font-medium">Avg Performance Index</p>
                  </div>
                  <p className="mt-3 text-3xl font-bold">{summary.average_performance_index}/100</p>
                  <p className="mt-2 text-sm text-muted-foreground">vs industry benchmarks</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    <p className="text-sm font-medium">Outperforming</p>
                  </div>
                  <p className="mt-3 text-3xl font-bold">{summary.outperforming_count}</p>
                  <p className="mt-2 text-sm text-muted-foreground">variants above benchmark</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-danger">
                    <ShieldAlert className="h-4 w-4" />
                    <p className="text-sm font-medium">Need Attention</p>
                  </div>
                  <p className="mt-3 text-3xl font-bold">{summary.underperforming_count}</p>
                  <p className="mt-2 text-sm text-muted-foreground">variants at grade D or F</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <BrainCircuit className="h-4 w-4" />
                    <p className="text-sm font-medium">Top Performer</p>
                  </div>
                  <p className="mt-3 text-xl font-bold">{summary.top_variant?.channel ?? "Unknown"}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    PI {summary.top_variant?.performance_index ?? 0} - Grade {summary.top_variant?.grade ?? "-"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{summary.summary_text}</p>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Performance Index by Variant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceChartData} layout="vertical">
                        <CartesianGrid stroke="rgba(148,163,184,0.12)" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 12 }} />
                        <Bar dataKey="performance_index" radius={[0, 8, 8, 0]}>
                          {performanceChartData.map((entry) => (
                            <Cell key={entry.name} fill={gradeColors[entry.grade] ?? "#38bdf8"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">CTR vs Industry Benchmark</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ctrComparisonData}>
                        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 12 }} />
                        <Legend />
                        <Bar dataKey="actual" name="Actual CTR" fill="#22c55e" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="benchmark" name="Benchmark CTR" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    Intelligence Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {payload.top_signals.length > 0 ? (
                    payload.top_signals.slice(0, 6).map((signal) => (
                      <div key={`${signal.variant_name}-${signal.title}`} className="rounded-xl border border-border bg-secondary/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{signal.channel}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{signal.title}</p>
                          </div>
                          <div className="rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: `${signal.color}20`, color: signal.color }}>
                            Severity {signal.severity}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{signal.message}</p>
                        <p className="mt-2 text-xs uppercase tracking-wide text-primary">Action: {signal.action}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                      No intelligence signals fired yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Prioritized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {payload.recommendations.length > 0 ? (
                    payload.recommendations.map((recommendation) => (
                      <div
                        key={`${recommendation.priority}-${recommendation.title}`}
                        className="rounded-xl border border-border bg-secondary/20 p-4"
                        style={{ borderLeftWidth: 4, borderLeftColor: recommendation.color }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{recommendation.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {recommendation.impact} impact - Priority {recommendation.priority}
                            </p>
                          </div>
                          <div className="rounded-full bg-background px-2 py-1 text-xs text-muted-foreground">
                            {recommendation.metric}: {recommendation.value}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{recommendation.body}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                      Recommendations will appear after the engine scores live variants.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

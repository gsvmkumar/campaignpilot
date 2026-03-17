"use client"

import Image from "next/image"
import { useMemo } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AlertTriangle, HeartPulse, ShieldAlert, Sparkles } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adaptVariants, buildCtrTrendData } from "@/lib/campaignpilot"
import { useLiveInsights } from "@/hooks/use-live-insights"

const palette = ["#22c55e", "#38bdf8", "#f59e0b", "#ef4444", "#a855f7", "#f97316"]

export default function FatigueMonitorPage() {
  const { dashboard, analytics, fatigue, error, lastUpdatedAt } = useLiveInsights("Furniture", 20_000)

  const variants = dashboard ? adaptVariants(dashboard) : []
  const ranked = [...variants].sort((left, right) => right.fatigueScore - left.fatigueScore)
  const trendData = dashboard && analytics ? buildCtrTrendData(adaptVariants(dashboard), analytics) : []

  const fatigueInsights = useMemo(
    () =>
      (fatigue?.results ?? []).map((item) => ({
        ...item,
        ctrFloor: Math.min(...item.ctr_history, 0),
        ctrPeak: Math.max(...item.ctr_history, 0),
      })),
    [fatigue],
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fatigue Monitor</h1>
            <p className="text-muted-foreground">
              Real-time creative health scoring with live CTR decay tracking and refresh prioritization.
            </p>
          </div>
          <div className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs text-success">
            {lastUpdatedAt ? `Live tracking ${new Date(lastUpdatedAt).toLocaleTimeString()}` : "Connecting..."}
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Fatigued Applications</p>
              <p className="mt-2 text-3xl font-bold">{fatigue?.fatigued_count ?? 0}</p>
              <p className="mt-2 text-sm text-muted-foreground">Need immediate creative refresh.</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Watch List</p>
              <p className="mt-2 text-3xl font-bold">{fatigue?.watch_count ?? 0}</p>
              <p className="mt-2 text-sm text-muted-foreground">Starting to lose audience attention.</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Healthy Applications</p>
              <p className="mt-2 text-3xl font-bold">{fatigue?.healthy_count ?? 0}</p>
              <p className="mt-2 text-sm text-muted-foreground">Still attracting strong user interest.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Risk Priority Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ranked.map((variant) => (
                <div key={variant.variantId} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex items-center gap-3">
                    <Image src={variant.iconPath} alt={variant.name} width={44} height={44} className="rounded-xl" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{variant.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{variant.platform}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Fatigue score</p>
                      <p className={`text-3xl font-bold ${
                        variant.fatigueScore >= 70 ? "text-danger" : variant.fatigueScore >= 50 ? "text-warning" : "text-success"
                      }`}>
                        {variant.fatigueScore}
                      </p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs ${
                      variant.status === "fatigued"
                        ? "bg-danger/10 text-danger"
                        : variant.status === "watch"
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"
                    }`}>
                      {variant.status}
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${
                        variant.fatigueScore >= 70 ? "bg-danger" : variant.fatigueScore >= 50 ? "bg-warning" : "bg-success"
                      }`}
                      style={{ width: `${variant.fatigueScore}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {variant.fatigueScore >= 70
                      ? "Most users are no longer engaging. Refresh assets immediately."
                      : variant.fatigueScore >= 50
                        ? "Interest is fading. Queue a creative refresh and tighten frequency."
                        : "Healthy engagement. Keep monitoring and scale gradually."}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <HeartPulse className="h-4 w-4 text-primary" />
                Live CTR Decay Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 12 }} />
                    <Legend />
                    {variants.map((variant, index) => (
                      <Line
                        key={variant.variantId}
                        type="monotone"
                        dataKey={variant.id}
                        name={variant.name}
                        stroke={palette[index % palette.length]}
                        strokeWidth={2.4}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Refresh Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fatigueInsights.map((item) => (
                <div key={item.variant_id} className="rounded-2xl border border-border bg-secondary/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.channel}</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 text-xs ${
                      item.status === "FATIGUED"
                        ? "bg-danger/10 text-danger"
                        : item.status === "WATCH"
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"
                    }`}>
                      {item.status}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{item.alert_message}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Peak CTR</p>
                      <p className="mt-1 font-medium">{item.ctrPeak.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Recent floor</p>
                      <p className="mt-1 font-medium">{item.ctrFloor.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <AlertTriangle className="h-4 w-4 text-primary" />
              High-Level Operational Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              Prioritize fatigued applications for creative refresh, message rotation, and frequency cap review.
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              Shift budget toward healthy applications with stable CTR while watch-list campaigns are reworked.
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              Use live decay tracking to justify proactive changes before conversions collapse.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

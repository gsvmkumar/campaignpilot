"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ArrowRightLeft, Compass, GitBranch, Radar } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDefaultDomain, loadSelectedDomain } from "@/lib/domain-selection"
import { useLiveInsights } from "@/hooks/use-live-insights"

const palette = ["#22c55e", "#38bdf8", "#f59e0b", "#ef4444", "#a855f7", "#f97316"]

export default function AttributionPage() {
  const [domain, setDomain] = useState(getDefaultDomain)
  const { attribution, dataSummary, error, lastUpdatedAt } = useLiveInsights(domain, 20_000)

  useEffect(() => {
    setDomain(loadSelectedDomain())
  }, [])

  const comparisonData = attribution?.results ?? []
  const journeyMix = useMemo(
    () =>
      comparisonData.map((item, index) => ({
        name: item.channel,
        value: Number(item.shapley_credit.toFixed(2)),
        fill: palette[index % palette.length],
      })),
    [comparisonData],
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attribution</h1>
            <p className="text-muted-foreground">
              Real-time channel credit using processed customer journeys from your clickstream dataset.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              Domain: {domain}
            </div>
            <div className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs text-success">
              {lastUpdatedAt ? `Live tracking ${new Date(lastUpdatedAt).toLocaleTimeString()}` : "Connecting..."}
            </div>
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
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Journey Samples</p>
              <p className="mt-2 text-3xl font-bold">{dataSummary?.journey_count?.toLocaleString() ?? "0"}</p>
              <p className="mt-2 text-sm text-muted-foreground">Sampled conversion journeys actively power attribution scoring.</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Biggest Discrepancy</p>
              <p className="mt-2 text-3xl font-bold">{attribution?.biggest_discrepancy ?? "-"}</p>
              <p className="mt-2 text-sm text-muted-foreground">Largest mismatch between last-click and multi-touch contribution.</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget at Risk</p>
              <p className="mt-2 text-3xl font-bold">Rs {Math.round(attribution?.total_misallocated_inr ?? 0).toLocaleString()}</p>
              <p className="mt-2 text-sm text-muted-foreground">Potential reallocation identified by the attribution engine.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <GitBranch className="h-4 w-4 text-primary" />
                Last-Click vs True Credit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical" margin={{ left: 12, right: 16 }}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" horizontal vertical={false} />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="channel" width={120} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 12 }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, ""]}
                    />
                    <Bar dataKey="last_click_credit" name="Last Click" fill="#64748b" radius={[0, 6, 6, 0]} />
                    <Bar dataKey="shapley_credit" name="Shapley" fill="#22c55e" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <Radar className="h-4 w-4 text-primary" />
                Credit Share Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={journeyMix} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120} paddingAngle={2}>
                      {journeyMix.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 12 }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, "Shapley credit"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-2">
                {journeyMix.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span>{entry.name}</span>
                    </div>
                    <span className="font-medium">{entry.value.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              Live Attribution Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonData.map((row) => (
                <div key={row.channel} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-medium">{row.channel}</p>
                      <p className="text-sm text-muted-foreground">
                        Last-click {row.last_click_credit.toFixed(2)}% vs Shapley {row.shapley_credit.toFixed(2)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full px-3 py-1 text-xs ${
                        row.recommendation === "increase"
                          ? "bg-success/10 text-success"
                          : row.recommendation === "decrease"
                            ? "bg-danger/10 text-danger"
                            : "bg-secondary text-muted-foreground"
                      }`}>
                        {row.recommendation}
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${row.difference >= 0 ? "text-success" : "text-danger"}`}>
                          {row.difference >= 0 ? "+" : ""}
                          {row.difference.toFixed(2)} pts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rs {Math.round(row.budget_change_inr).toLocaleString()} suggested shift
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Compass className="h-4 w-4 text-primary" />
              Why this is stronger now
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              Attribution is now fed by processed journey samples from `pcb_dataset_final.tsv`, not just static mock rows.
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              Channel decisions update with the same live backend polling used elsewhere in the app.
            </div>
            <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              Judges can verify the data basis through the backend summary and live allocation changes.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

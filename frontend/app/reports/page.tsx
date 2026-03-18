"use client"

import { useEffect, useState } from "react"
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3, FileSpreadsheet, TrendingUp } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ExportButtons } from "@/components/reports/export-buttons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adaptVariants } from "@/lib/campaignpilot"
import { getDefaultDomain, loadSelectedDomain } from "@/lib/domain-selection"
import { useLiveInsights } from "@/hooks/use-live-insights"

export default function ReportsPage() {
  const [domain, setDomain] = useState(getDefaultDomain)
  const { dashboard, analytics, dataSummary, error, lastUpdatedAt } = useLiveInsights(domain, 20_000)

  useEffect(() => {
    setDomain(loadSelectedDomain())
  }, [])

  const variants = dashboard ? adaptVariants(dashboard) : []
  const efficiencyData = variants.map((variant) => ({
    name: variant.platform,
    creative: variant.name,
    spend: variant.spend,
    conversions: variant.conversions,
    ctr: variant.ctr,
    status: variant.status,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6 print:space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              Live campaign reporting with downloadable summaries and dataset-backed evidence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              Domain: {domain}
            </div>
            <div className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs text-success">
              {lastUpdatedAt ? `Snapshot ${new Date(lastUpdatedAt).toLocaleTimeString()}` : "Preparing report..."}
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {dashboard && analytics ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <BarChart3 className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Spend</p>
                  </div>
                  <p className="mt-3 text-3xl font-bold">Rs {Math.round(dashboard.total_budget).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Conversions</p>
                  </div>
                  <p className="mt-3 text-3xl font-bold">{dashboard.total_conversions.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <FileSpreadsheet className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Journey Samples</p>
                  </div>
                  <p className="mt-3 text-3xl font-bold">{dataSummary?.journey_count?.toLocaleString() ?? "0"}</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Best Performer</p>
                  </div>
                  <p className="mt-3 text-2xl font-bold">{dashboard.best_performer}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left text-sm text-muted-foreground">
                        <th className="px-4 py-3">Platform</th>
                        <th className="px-4 py-3">Creative</th>
                        <th className="px-4 py-3">CTR</th>
                        <th className="px-4 py-3">Conversions</th>
                        <th className="px-4 py-3">Budget</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <tr key={variant.variantId} className="border-b border-border/50">
                          <td className="px-4 py-3 font-medium">{variant.platform}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{variant.name}</td>
                          <td className="px-4 py-3">{variant.ctr.toFixed(2)}%</td>
                          <td className="px-4 py-3">{variant.conversions.toLocaleString()}</td>
                          <td className="px-4 py-3">{variant.budget.toFixed(1)}%</td>
                          <td className="px-4 py-3 capitalize">{variant.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Budget Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid stroke="rgba(148,163,184,0.12)" />
                      <XAxis type="number" dataKey="spend" name="Spend" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="number" dataKey="conversions" name="Conversions" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 12 }}
                        formatter={(value: number, name: string) => [name === "Spend" ? `Rs ${Math.round(value).toLocaleString()}` : value, name]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ""}
                      />
                      <Scatter data={efficiencyData} fill="#22c55e" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Optimization History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.rebalance_history.map((entry, index) => (
                  <div key={entry.timestamp} className="rounded-xl border border-border bg-secondary/20 p-4">
                    <p className="font-medium">Cycle {index + 1}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()} - {Object.keys(entry.changes).length} allocation changes tracked
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <ExportButtons dashboard={dashboard} analytics={analytics} dataSummary={dataSummary} />
          </>
        ) : (
          <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            Loading live report data from the backend...
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

"use client"

import Image from "next/image"
import { ArrowDownRight, ArrowUpRight, Activity } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { DashboardVariant } from "@/lib/campaignpilot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function getSparklineData(ctrTrendData: Array<Record<string, string | number>>, variantId: string) {
  return ctrTrendData.map((entry) => ({
    cycle: String(entry.hour ?? ""),
    value: Number(entry[variantId] ?? 0),
  }))
}

interface CTRSparklinesProps {
  variants: DashboardVariant[]
  ctrTrendData: Array<Record<string, string | number>>
}

export function CTRSparklines({ variants, ctrTrendData }: CTRSparklinesProps) {
  const ranked = variants
    .map((variant) => {
      const trend = getSparklineData(ctrTrendData, variant.id)
      const first = trend[0]?.value ?? variant.ctr
      const last = trend[trend.length - 1]?.value ?? variant.ctr
      const delta = Number((last - first).toFixed(2))
      return {
        variant,
        trend,
        delta,
        improving: delta >= 0,
      }
    })
    .sort((a, b) => b.variant.ctr - a.variant.ctr)

  const headline = ranked[0]

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle className="text-lg font-medium">CTR Trends</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Live cycle-by-cycle engagement view ranked by current CTR and momentum.
          </p>
        </div>
        {headline ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-primary">Top Momentum</p>
            <p className="mt-1 font-medium">{headline.variant.name}</p>
            <p className="text-muted-foreground">
              {headline.variant.ctr.toFixed(2)}% CTR with {headline.delta >= 0 ? "+" : ""}
              {headline.delta.toFixed(2)} cycle change
            </p>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-border bg-secondary/20 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4 text-primary" />
              Engagement leaderboard
            </div>
            <div className="space-y-3">
              {ranked.map(({ variant, delta }) => (
                <div key={variant.variantId} className="rounded-xl border border-border/70 bg-background/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Image src={variant.iconPath} alt={variant.name} width={40} height={40} className="rounded-xl" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{variant.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{variant.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{variant.ctr.toFixed(2)}%</p>
                      <p className={`text-xs ${delta >= 0 ? "text-success" : "text-danger"}`}>
                        {delta >= 0 ? "+" : ""}
                        {delta.toFixed(2)} trend
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4">
            {headline ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image src={headline.variant.iconPath} alt={headline.variant.name} width={40} height={40} className="rounded-xl" />
                    <div>
                      <p className="font-medium">{headline.variant.name}</p>
                      <p className="text-xs text-muted-foreground">{headline.variant.platform}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${headline.improving ? "text-success" : "text-danger"}`}>
                    {headline.improving ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {headline.delta >= 0 ? "+" : ""}
                    {headline.delta.toFixed(2)}
                  </div>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={headline.trend}>
                      <defs>
                        <linearGradient id="headlineCtr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                      <XAxis dataKey="cycle" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#09090b",
                          border: "1px solid rgba(148,163,184,0.18)",
                          borderRadius: "12px",
                          color: "#f8fafc",
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)}%`, "CTR"]}
                      />
                      <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2.5} fill="url(#headlineCtr)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

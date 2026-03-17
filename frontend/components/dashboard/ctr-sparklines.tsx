"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

import { DashboardVariant } from "@/lib/campaignpilot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function getSparklineData(ctrTrendData: Array<Record<string, string | number>>, variantId: string) {
  return ctrTrendData.map((entry) => ({
    value: Number(entry[variantId] ?? 0),
  }))
}

function getTrend(ctrTrendData: Array<Record<string, string | number>>, variantId: string) {
  const data = getSparklineData(ctrTrendData, variantId)
  const first = data[0]?.value ?? 0
  const last = data[data.length - 1]?.value ?? 0
  return last >= first ? "up" : "down"
}

interface CTRSparklinesProps {
  variants: DashboardVariant[]
  ctrTrendData: Array<Record<string, string | number>>
}

export function CTRSparklines({ variants, ctrTrendData }: CTRSparklinesProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">CTR Trends (recent cycles)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {variants.map((variant) => {
            const trend = getTrend(ctrTrendData, variant.id)
            const sparkData = getSparklineData(ctrTrendData, variant.id)
            const isUp = trend === "up"

            return (
              <div key={variant.id} className="space-y-2 rounded-lg bg-secondary/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{variant.name}</span>
                  <div className={`flex items-center gap-1 text-xs ${isUp ? "text-success" : "text-danger"}`}>
                    {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {variant.ctr}%
                  </div>
                </div>
                <div className="h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                      <defs>
                        <linearGradient id={`gradient-${variant.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={isUp ? "#22c55e" : "#ef4444"}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor={isUp ? "#22c55e" : "#ef4444"}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={isUp ? "#22c55e" : "#ef4444"}
                        strokeWidth={2}
                        fill={`url(#gradient-${variant.id})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

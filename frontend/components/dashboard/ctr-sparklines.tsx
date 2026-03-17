"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { variants, ctrTrendData } from "@/lib/mock-data"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

function getSparklineData(variantId: string) {
  return ctrTrendData.map((d) => ({
    value: d[variantId as keyof typeof d] as number,
  }))
}

function getTrend(variantId: string) {
  const data = getSparklineData(variantId)
  const first = data[0].value
  const last = data[data.length - 1].value
  return last >= first ? "up" : "down"
}

export function CTRSparklines() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">CTR Trends (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {variants.map((variant) => {
            const trend = getTrend(variant.id)
            const sparkData = getSparklineData(variant.id)
            const isUp = trend === "up"

            return (
              <div
                key={variant.id}
                className="p-3 bg-secondary/50 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{variant.name}</span>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isUp ? "text-success" : "text-danger"
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {variant.ctr}%
                  </div>
                </div>
                <div className="h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                      <defs>
                        <linearGradient
                          id={`gradient-${variant.id}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
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

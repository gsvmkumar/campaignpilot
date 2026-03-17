"use client"

import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { chartAxisLine, chartAxisTick, chartColors, chartGrid, chartTooltipStyle } from "@/lib/chart-theme"
import { variants } from "@/lib/mock-data"

const data = variants.map((variant) => ({
  name: variant.name,
  spend: variant.spend / 1000,
  conversions: variant.conversions,
  ctr: variant.ctr,
  status: variant.status,
}))

const colors: Record<string, string> = {
  healthy: "#22c55e",
  watch: "#f59e0b",
  fatigued: "#ef4444",
}

export function EfficiencyChart() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Budget Efficiency</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid {...chartGrid} />
              <XAxis
                type="number"
                dataKey="spend"
                name="Spend"
                tick={chartAxisTick}
                axisLine={chartAxisLine}
                label={{
                  value: "Spend (Rs K)",
                  position: "insideBottom",
                  offset: -10,
                  fill: chartColors.mutedForeground,
                }}
              />
              <YAxis
                type="number"
                dataKey="conversions"
                name="Conversions"
                tick={chartAxisTick}
                axisLine={chartAxisLine}
                label={{
                  value: "Conversions",
                  angle: -90,
                  position: "insideLeft",
                  fill: chartColors.mutedForeground,
                }}
              />
              <ZAxis type="number" dataKey="ctr" range={[100, 400]} name="CTR" />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value: number, name: string) => {
                  if (name === "Spend") return [`Rs ${value}K`, name]
                  if (name === "CTR") return [`${value}%`, name]
                  return [value, name]
                }}
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.name
                  }

                  return ""
                }}
              />
              <Scatter name="Variants" data={data}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={colors[entry.status]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Watch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-danger" />
            <span className="text-sm text-muted-foreground">Fatigued</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

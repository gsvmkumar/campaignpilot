"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { journeyLengthData } from "@/lib/mock-data"
import { chartAxisLine, chartAxisTick, chartTooltipStyle } from "@/lib/chart-theme"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"]

export function JourneyDistribution() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Journey Length Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={journeyLengthData}>
              <XAxis
                dataKey="touches"
                tick={chartAxisTick}
                axisLine={chartAxisLine}
              />
              <YAxis
                tick={chartAxisTick}
                axisLine={chartAxisLine}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value: number, name: string, props: { payload: { percentage: number } }) => [
                  `${value.toLocaleString()} (${props.payload.percentage}%)`,
                  "Customers",
                ]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {journeyLengthData.map((_, index) => (
                  <Cell key={index} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          <span className="text-foreground font-semibold">76%</span> of customers need 2+ touchpoints before converting.
          This is why multi-touch attribution matters.
        </p>
      </CardContent>
    </Card>
  )
}

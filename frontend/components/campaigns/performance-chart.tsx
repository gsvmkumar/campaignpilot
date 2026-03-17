"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { variants } from "@/lib/mock-data"
import { chartAxisLine, chartAxisTick, chartColors, chartGrid, chartLegendStyle, chartTooltipStyle } from "@/lib/chart-theme"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"

const chartData = variants.map((v) => ({
  name: v.name,
  CTR: v.ctr,
  "Conversion Rate": ((v.conversions / (v.spend / 100)) * 100).toFixed(2),
  "Spend Efficiency": ((v.conversions / v.spend) * 10000).toFixed(1),
}))

export function PerformanceComparisonChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid {...chartGrid} />
              <XAxis
                dataKey="name"
                tick={chartAxisTick}
                axisLine={chartAxisLine}
              />
              <YAxis
                tick={chartAxisTick}
                axisLine={chartAxisLine}
              />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={chartLegendStyle} />
              <Bar dataKey="CTR" fill={chartColors.chart1} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Conversion Rate" fill={chartColors.chart2} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Spend Efficiency" fill={chartColors.chart3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

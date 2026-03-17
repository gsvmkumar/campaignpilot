"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { attributionData } from "@/lib/mock-data"
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
  Cell,
} from "recharts"

export function AttributionComparisonChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Last-Click vs Shapley Attribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attributionData} layout="vertical" barGap={2}>
              <CartesianGrid {...chartGrid} horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tick={chartAxisTick}
                axisLine={chartAxisLine}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="channel"
                tick={chartAxisTick}
                axisLine={chartAxisLine}
                width={100}
              />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => [`${value}%`, ""]} />
              <Legend wrapperStyle={chartLegendStyle} />
              <Bar
                dataKey="lastClick"
                name="Last-Click Credit"
                fill={chartColors.chart2}
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="shapley"
                name="True Shapley Value"
                fill={chartColors.primary}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

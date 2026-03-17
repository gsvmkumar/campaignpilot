"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { budgetHistoryData } from "@/lib/mock-data"
import { chartAxisLine, chartAxisTick, chartGrid, chartLegendStyle, chartTooltipStyle } from "@/lib/chart-theme"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"

const colors = {
  A: "#22c55e",
  B: "#ef4444",
  C: "#3b82f6",
  D: "#f59e0b",
  E: "#8b5cf6",
  F: "#ec4899",
}

export function TimeSeriesChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">CTR Over Time (7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={budgetHistoryData}>
              <CartesianGrid {...chartGrid} />
              <XAxis
                dataKey="day"
                tick={chartAxisTick}
                axisLine={chartAxisLine}
              />
              <YAxis
                tick={chartAxisTick}
                axisLine={chartAxisLine}
                domain={[0, 30]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value: number) => [`${value}%`, ""]}
              />
              <Legend wrapperStyle={chartLegendStyle} />
              {Object.entries(colors).map(([key, color]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  name={`Variant ${key}`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ctrDecayData } from "@/lib/mock-data"
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
  ReferenceLine,
} from "recharts"

const colors = {
  A: "#22c55e",
  B: "#ef4444",
  C: "#3b82f6",
  D: "#f59e0b",
  E: "#8b5cf6",
  F: "#ec4899",
}

export function CTRDecayChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">CTR Decay Over 14 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ctrDecayData}>
              <CartesianGrid {...chartGrid} />
              <XAxis
                dataKey="day"
                tick={chartAxisTick}
                axisLine={chartAxisLine}
                tickFormatter={(v) => `Day ${v}`}
              />
              <YAxis
                tick={chartAxisTick}
                axisLine={chartAxisLine}
                domain={[0, 5]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => [`${value}%`, ""]} />
              <Legend wrapperStyle={chartLegendStyle} />
              <ReferenceLine
                y={2.5}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{
                  value: "Fatigue Threshold",
                  fill: "#ef4444",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
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

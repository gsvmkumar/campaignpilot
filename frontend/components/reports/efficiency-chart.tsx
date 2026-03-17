"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { variants } from "@/lib/mock-data"
import {
  Scatter,
  ScatterChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ZAxis,
  Cell,
} from "recharts"

const data = variants.map((v) => ({
  name: v.name,
  spend: v.spend / 1000,
  conversions: v.conversions,
  ctr: v.ctr,
  status: v.status,
}))

const colors: Record<string, string> = {
  healthy: "#22c55e",
  watch: "#f59e0b",
  fatigued: "#ef4444",
}

export function EfficiencyChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Budget Efficiency</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="spend"
                name="Spend"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                label={{
                  value: "Spend (₹K)",
                  position: "insideBottom",
                  offset: -10,
                  fill: "hsl(var(--muted-foreground))",
                }}
              />
              <YAxis
                type="number"
                dataKey="conversions"
                name="Conversions"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                label={{
                  value: "Conversions",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                }}
              />
              <ZAxis type="number" dataKey="ctr" range={[100, 400]} name="CTR" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "Spend") return [`₹${value}K`, name]
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
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Watch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-sm text-muted-foreground">Fatigued</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { variants } from "@/lib/mock-data"
import { DollarSign, Target, TrendingUp, Percent } from "lucide-react"

export function PerformanceSummary() {
  const totalSpend = variants.reduce((sum, v) => sum + v.spend, 0)
  const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0)
  const roas = ((totalConversions * 150) / totalSpend * 100).toFixed(1) // Assuming ₹150 per conversion value
  const avgCtr = (variants.reduce((sum, v) => sum + v.ctr, 0) / variants.length).toFixed(2)

  const metrics = [
    {
      label: "Total Spend",
      value: `₹${totalSpend.toLocaleString()}`,
      icon: DollarSign,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      label: "Total Conversions",
      value: totalConversions.toLocaleString(),
      icon: Target,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "ROAS",
      value: `${roas}%`,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Average CTR",
      value: `${avgCtr}%`,
      icon: Percent,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Campaign Performance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-4 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${metric.bg}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

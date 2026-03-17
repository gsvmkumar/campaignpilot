"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Target, TrendingUp, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

const metrics = [
  {
    label: "Total Budget Spent",
    value: 200000,
    format: "currency",
    change: "+12.4%",
    trend: "up",
    icon: DollarSign,
  },
  {
    label: "Total Conversions",
    value: 5850,
    format: "number",
    change: "+8.2%",
    trend: "up",
    icon: Target,
  },
  {
    label: "Best Performing",
    value: "Variant C",
    subValue: "4.1% CTR",
    format: "text",
    icon: TrendingUp,
  },
  {
    label: "Active Fatigue Alerts",
    value: 2,
    format: "number",
    alertLevel: "warning",
    icon: AlertTriangle,
  },
]

function formatValue(value: number | string, format: string) {
  if (format === "currency" && typeof value === "number") {
    return `₹${value.toLocaleString()}`
  }
  if (format === "number" && typeof value === "number") {
    return value.toLocaleString()
  }
  return value
}

export function MetricCards() {
  const [animatedValues, setAnimatedValues] = useState<(number | string)[]>(
    metrics.map((m) => (typeof m.value === "number" ? 0 : m.value))
  )

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = Math.min(step / steps, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      setAnimatedValues(
        metrics.map((m) => {
          if (typeof m.value === "number") {
            return Math.round(m.value * easeOut)
          }
          return m.value
        })
      )

      if (step >= steps) {
        clearInterval(timer)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card
          key={metric.label}
          className={`bg-card border-border ${
            metric.alertLevel === "warning" ? "border-warning/50" : ""
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold">
                  {formatValue(animatedValues[index], metric.format)}
                </p>
                {metric.subValue && (
                  <p className="text-sm text-success">{metric.subValue}</p>
                )}
                {metric.change && (
                  <p
                    className={`text-sm ${
                      metric.trend === "up" ? "text-success" : "text-danger"
                    }`}
                  >
                    {metric.change} vs last week
                  </p>
                )}
              </div>
              <div
                className={`p-3 rounded-lg ${
                  metric.alertLevel === "warning"
                    ? "bg-warning/10 text-warning"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, DollarSign, Target, TrendingUp } from "lucide-react"

import { DashboardMetricCard } from "@/lib/campaignpilot"
import { Card, CardContent } from "@/components/ui/card"

const metricIcons = [DollarSign, Target, TrendingUp, AlertTriangle] as const

function formatValue(value: number | string, format: string) {
  if (format === "currency" && typeof value === "number") {
    return `Rs ${value.toLocaleString()}`
  }
  if (format === "number" && typeof value === "number") {
    return value.toLocaleString()
  }
  return value
}

interface MetricCardsProps {
  metrics: DashboardMetricCard[]
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const [animatedValues, setAnimatedValues] = useState<(number | string)[]>(
    metrics.map((metric) => (typeof metric.value === "number" ? 0 : metric.value)),
  )

  useEffect(() => {
    setAnimatedValues(metrics.map((metric) => (typeof metric.value === "number" ? 0 : metric.value)))
  }, [metrics])

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step += 1
      const progress = Math.min(step / steps, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      setAnimatedValues(
        metrics.map((metric) => {
          if (typeof metric.value === "number") {
            return Math.round(metric.value * easeOut)
          }
          return metric.value
        }),
      )

      if (step >= steps) {
        clearInterval(timer)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [metrics])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metricIcons[index] ?? TrendingUp

        return (
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
                  {metric.subValue ? (
                    <p className="text-sm text-success">{metric.subValue}</p>
                  ) : null}
                  {metric.change ? (
                    <p className={`text-sm ${metric.trend === "down" ? "text-danger" : "text-success"}`}>
                      {metric.change}
                    </p>
                  ) : null}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    metric.alertLevel === "warning"
                      ? "bg-warning/10 text-warning"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

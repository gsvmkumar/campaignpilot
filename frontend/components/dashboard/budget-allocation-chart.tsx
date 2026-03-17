"use client"

import { useEffect, useState } from "react"

import { DashboardVariant } from "@/lib/campaignpilot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function getStatusColor(status: string) {
  switch (status) {
    case "healthy":
      return "bg-success"
    case "watch":
      return "bg-warning"
    case "fatigued":
      return "bg-danger"
    default:
      return "bg-muted"
  }
}

function getStatusTextColor(status: string) {
  switch (status) {
    case "healthy":
      return "text-success"
    case "watch":
      return "text-warning"
    case "fatigued":
      return "text-danger"
    default:
      return "text-muted-foreground"
  }
}

interface BudgetAllocationChartProps {
  variants: DashboardVariant[]
}

export function BudgetAllocationChart({ variants }: BudgetAllocationChartProps) {
  const [animatedWidths, setAnimatedWidths] = useState<number[]>(variants.map(() => 0))

  useEffect(() => {
    setAnimatedWidths(variants.map(() => 0))
    const timer = setTimeout(() => {
      setAnimatedWidths(variants.map((variant) => variant.budget))
    }, 100)
    return () => clearTimeout(timer)
  }, [variants])

  const sortedVariants = [...variants].sort((a, b) => b.budget - a.budget)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium">Budget Allocation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedVariants.map((variant) => (
          <div key={variant.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{variant.name}</span>
                <span className="text-xs text-muted-foreground">{variant.platform}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(variant.status)}/10 ${getStatusTextColor(variant.status)}`}
                >
                  {variant.status}
                </span>
                <span className="w-12 text-right font-mono font-medium">{variant.budget}%</span>
              </div>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getStatusColor(variant.status)}`}
                style={{
                  width: `${animatedWidths[variants.findIndex((item) => item.id === variant.id)]}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

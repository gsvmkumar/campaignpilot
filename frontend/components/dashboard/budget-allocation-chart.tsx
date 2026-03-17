"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { variants } from "@/lib/mock-data"
import { useEffect, useState } from "react"

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

export function BudgetAllocationChart() {
  const [animatedWidths, setAnimatedWidths] = useState<number[]>(variants.map(() => 0))

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidths(variants.map((v) => v.budget))
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const sortedVariants = [...variants].sort((a, b) => b.budget - a.budget)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium">Budget Allocation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedVariants.map((variant, index) => (
          <div key={variant.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{variant.name}</span>
                <span className="text-muted-foreground text-xs">
                  {variant.platform}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(variant.status)}/10 ${getStatusTextColor(variant.status)}`}>
                  {variant.status}
                </span>
                <span className="font-mono font-medium w-12 text-right">
                  {variant.budget}%
                </span>
              </div>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getStatusColor(variant.status)}`}
                style={{
                  width: `${(animatedWidths[variants.findIndex((v) => v.id === variant.id)] / 30) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

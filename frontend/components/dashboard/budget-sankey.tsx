"use client"

import { useEffect, useState } from "react"

import { DashboardVariant } from "@/lib/campaignpilot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BudgetSankeyProps {
  variants: DashboardVariant[]
  totalBudget: number
}

export function BudgetSankey({ variants, totalBudget }: BudgetSankeyProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(false)
    const timer = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(timer)
  }, [variants])

  const totalConversions = variants.reduce((sum, variant) => sum + variant.conversions, 0)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Budget Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px]">
          <div className="absolute left-0 top-1/2 w-28 -translate-y-1/2">
            <div className="rounded-lg border border-primary/30 bg-primary/20 p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Budget</p>
              <p className="text-lg font-bold">Rs {(totalBudget / 1000).toFixed(0)}K</p>
            </div>
          </div>

          <div className="absolute left-1/2 top-0 flex h-full -translate-x-1/2 flex-col justify-around py-2">
            {variants.map((variant, index) => {
              const colorClass =
                variant.status === "healthy"
                  ? "bg-success/20 border-success/30"
                  : variant.status === "watch"
                    ? "bg-warning/20 border-warning/30"
                    : "bg-danger/20 border-danger/30"

              return (
                <div
                  key={variant.id}
                  className={`${colorClass} rounded-lg border px-3 py-1.5 text-center transition-all duration-500`}
                  style={{
                    opacity: animated ? 1 : 0,
                    transform: animated ? "translateX(0)" : "translateX(-20px)",
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <p className="text-xs font-medium">{variant.name}</p>
                  <p className="text-xs text-muted-foreground">Rs {(variant.spend / 1000).toFixed(0)}K</p>
                </div>
              )
            })}
          </div>

          <div className="absolute right-0 top-1/2 w-28 -translate-y-1/2">
            <div className="rounded-lg border border-success/30 bg-success/20 p-3 text-center">
              <p className="text-xs text-muted-foreground">Conversions</p>
              <p className="text-lg font-bold">{totalConversions.toLocaleString()}</p>
            </div>
          </div>

          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {variants.map((variant, index) => {
              const yOffset = (index / Math.max(variants.length - 1, 1)) * 240 + 30
              const strokeColor =
                variant.status === "healthy"
                  ? "#22c55e"
                  : variant.status === "watch"
                    ? "#f59e0b"
                    : "#ef4444"

              return (
                <g key={variant.id}>
                  <path
                    d={`M 112 150 Q 180 150 220 ${yOffset}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={Math.max(variant.budget / 5, 2)}
                    opacity={animated ? 0.4 : 0}
                    className="transition-opacity duration-1000"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  />
                  <path
                    d={`M 280 ${yOffset} Q 340 ${yOffset} 380 150`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={Math.max(variant.conversions / 500, 2)}
                    opacity={animated ? 0.4 : 0}
                    className="transition-opacity duration-1000"
                    style={{ transitionDelay: `${index * 100 + 300}ms` }}
                  />
                </g>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { variants } from "@/lib/mock-data"
import { useEffect, useState } from "react"

// Simplified Sankey visualization using CSS
export function BudgetSankey() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const totalBudget = 200000
  const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Budget Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px]">
          {/* Total Budget Node */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-28">
            <div className="bg-primary/20 border border-primary/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Budget</p>
              <p className="text-lg font-bold">₹{(totalBudget / 1000).toFixed(0)}K</p>
            </div>
          </div>

          {/* Variant Nodes */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full flex flex-col justify-around py-2">
            {variants.map((variant, index) => {
              const getColorClass = () => {
                switch (variant.status) {
                  case "healthy":
                    return "bg-success/20 border-success/30"
                  case "watch":
                    return "bg-warning/20 border-warning/30"
                  case "fatigued":
                    return "bg-danger/20 border-danger/30"
                  default:
                    return "bg-secondary border-border"
                }
              }

              return (
                <div
                  key={variant.id}
                  className={`${getColorClass()} border rounded-lg px-3 py-1.5 text-center transition-all duration-500`}
                  style={{
                    opacity: animated ? 1 : 0,
                    transform: animated ? "translateX(0)" : "translateX(-20px)",
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <p className="text-xs font-medium">{variant.name}</p>
                  <p className="text-xs text-muted-foreground">₹{(variant.spend / 1000).toFixed(0)}K</p>
                </div>
              )
            })}
          </div>

          {/* Conversions Node */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-28">
            <div className="bg-success/20 border border-success/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Conversions</p>
              <p className="text-lg font-bold">{totalConversions.toLocaleString()}</p>
            </div>
          </div>

          {/* Flow Lines (simplified) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {variants.map((variant, index) => {
              const yOffset = (index / (variants.length - 1)) * 240 + 30
              const strokeColor =
                variant.status === "healthy"
                  ? "#22c55e"
                  : variant.status === "watch"
                  ? "#f59e0b"
                  : "#ef4444"

              return (
                <g key={variant.id}>
                  {/* Left to middle */}
                  <path
                    d={`M 112 150 Q 180 150 220 ${yOffset}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={Math.max(variant.budget / 5, 2)}
                    opacity={animated ? 0.4 : 0}
                    className="transition-opacity duration-1000"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  />
                  {/* Middle to right */}
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

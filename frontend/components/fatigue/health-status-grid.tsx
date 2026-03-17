"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { variants } from "@/lib/mock-data"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

function getStatusIcon(status: string) {
  switch (status) {
    case "healthy":
      return CheckCircle
    case "watch":
      return AlertTriangle
    case "fatigued":
      return XCircle
    default:
      return CheckCircle
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "healthy":
      return {
        card: "border-success/30 bg-success/5",
        badge: "bg-success text-success-foreground",
        icon: "text-success",
      }
    case "watch":
      return {
        card: "border-warning/30 bg-warning/5",
        badge: "bg-warning text-warning-foreground",
        icon: "text-warning",
      }
    case "fatigued":
      return {
        card: "border-danger/30 bg-danger/5",
        badge: "bg-danger text-white",
        icon: "text-danger",
      }
    default:
      return {
        card: "border-border",
        badge: "bg-secondary",
        icon: "text-muted-foreground",
      }
  }
}

export function HealthStatusGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {variants.map((variant) => {
        const styles = getStatusStyles(variant.status)
        const StatusIcon = getStatusIcon(variant.status)

        return (
          <Card key={variant.id} className={`bg-card ${styles.card}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{variant.name}</h3>
                  <p className="text-sm text-muted-foreground">{variant.platform}</p>
                </div>
                <Badge className={styles.badge}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {variant.status.toUpperCase()}
                </Badge>
              </div>

              {/* Fatigue Gauge */}
              <div className="relative flex items-center justify-center my-6">
                <svg className="w-32 h-16" viewBox="0 0 120 60">
                  {/* Background arc */}
                  <path
                    d="M 10 55 A 50 50 0 0 1 110 55"
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Progress arc */}
                  <path
                    d="M 10 55 A 50 50 0 0 1 110 55"
                    fill="none"
                    stroke={
                      variant.fatigueScore >= 70
                        ? "#ef4444"
                        : variant.fatigueScore >= 50
                        ? "#f59e0b"
                        : "#22c55e"
                    }
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(variant.fatigueScore / 100) * 157} 157`}
                  />
                  {/* Needle */}
                  <line
                    x1="60"
                    y1="55"
                    x2={60 + 35 * Math.cos((Math.PI * (180 - variant.fatigueScore * 1.8)) / 180)}
                    y2={55 - 35 * Math.sin((Math.PI * (180 - variant.fatigueScore * 1.8)) / 180)}
                    stroke="hsl(var(--foreground))"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="60" cy="55" r="4" fill="hsl(var(--foreground))" />
                </svg>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold tabular-nums">{variant.fatigueScore}</p>
                <p className="text-sm text-muted-foreground">Fatigue Score</p>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground mt-4">
                <span>0</span>
                <span className="text-warning">50</span>
                <span className="text-danger">70</span>
                <span>100</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

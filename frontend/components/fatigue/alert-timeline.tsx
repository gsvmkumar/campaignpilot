"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fatigueTimeline } from "@/lib/mock-data"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"

function getSeverityStyles(severity: string) {
  switch (severity) {
    case "high":
      return {
        bg: "bg-danger/10",
        border: "border-danger",
        icon: AlertCircle,
        iconColor: "text-danger",
      }
    case "medium":
      return {
        bg: "bg-warning/10",
        border: "border-warning",
        icon: AlertTriangle,
        iconColor: "text-warning",
      }
    case "low":
      return {
        bg: "bg-success/10",
        border: "border-success",
        icon: CheckCircle,
        iconColor: "text-success",
      }
    default:
      return {
        bg: "bg-secondary",
        border: "border-border",
        icon: AlertCircle,
        iconColor: "text-muted-foreground",
      }
  }
}

export function AlertTimeline() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Fatigue Alert History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-6">
            {fatigueTimeline.map((event) => {
              const styles = getSeverityStyles(event.severity)
              const Icon = styles.icon

              return (
                <div key={event.id} className="relative flex gap-4 pl-10">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 w-8 h-8 rounded-full ${styles.bg} border-2 ${styles.border} flex items-center justify-center`}
                  >
                    <Icon className={`h-4 w-4 ${styles.iconColor}`} />
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Variant {event.variant}</span>
                      <span className="text-xs text-muted-foreground">
                        {event.date} at {event.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.event}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

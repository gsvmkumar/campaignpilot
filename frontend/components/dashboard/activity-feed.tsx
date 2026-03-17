"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { activityEvents } from "@/lib/mock-data"
import { ArrowRightLeft, AlertCircle, TrendingUp, Settings, AlertTriangle } from "lucide-react"

function getEventIcon(type: string) {
  switch (type) {
    case "budget":
      return ArrowRightLeft
    case "alert":
      return AlertCircle
    case "positive":
      return TrendingUp
    case "system":
      return Settings
    case "warning":
      return AlertTriangle
    default:
      return Settings
  }
}

function getEventColor(type: string) {
  switch (type) {
    case "budget":
      return "text-chart-2 bg-chart-2/10"
    case "alert":
      return "text-danger bg-danger/10"
    case "positive":
      return "text-success bg-success/10"
    case "system":
      return "text-muted-foreground bg-secondary"
    case "warning":
      return "text-warning bg-warning/10"
    default:
      return "text-muted-foreground bg-secondary"
  }
}

export function ActivityFeed() {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          Live Activity
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6 pb-6">
          <div className="space-y-4">
            {activityEvents.map((event, index) => {
              const Icon = getEventIcon(event.type)
              const colorClass = getEventColor(event.type)
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 animate-in slide-in-from-right-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{event.event}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

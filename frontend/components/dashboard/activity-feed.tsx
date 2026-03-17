"use client"

import { AlertCircle, AlertTriangle, ArrowRightLeft, Settings, TrendingUp } from "lucide-react"

import { ActivityItem } from "@/lib/campaignpilot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

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

interface ActivityFeedProps {
  activityEvents: ActivityItem[]
}

export function ActivityFeed({ activityEvents }: ActivityFeedProps) {
  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          Live Activity
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
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
                  className="animate-in slide-in-from-right-2 flex items-start gap-3"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`rounded-lg p-2 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{event.event}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{event.time}</p>
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

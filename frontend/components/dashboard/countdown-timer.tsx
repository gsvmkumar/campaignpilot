"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Timer } from "lucide-react"

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(872) // 14:32 in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 900 // Reset to 15 minutes
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Next Optimisation</p>
            <p className="text-xs text-muted-foreground">Thompson Sampling</p>
          </div>
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-primary" />
            <div className="font-mono text-3xl font-bold tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${((900 - timeLeft) / 900) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

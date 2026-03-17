"use client"

import { useEffect, useState } from "react"
import { Timer } from "lucide-react"

import { secondsToNextRebalance } from "@/lib/campaignpilot"
import { Card, CardContent } from "@/components/ui/card"

interface CountdownTimerProps {
  lastRebalanced: string
  nextRebalanceInMinutes: number
}

export function CountdownTimer({
  lastRebalanced,
  nextRebalanceInMinutes,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() =>
    secondsToNextRebalance(lastRebalanced, nextRebalanceInMinutes),
  )

  useEffect(() => {
    setTimeLeft(secondsToNextRebalance(lastRebalanced, nextRebalanceInMinutes))
  }, [lastRebalanced, nextRebalanceInMinutes])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 0) {
          return nextRebalanceInMinutes * 60
        }
        return previous - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [nextRebalanceInMinutes])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalSeconds = Math.max(nextRebalanceInMinutes * 60, 1)
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100

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
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

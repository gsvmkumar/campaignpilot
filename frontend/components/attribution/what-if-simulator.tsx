"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, TrendingUp } from "lucide-react"

export function WhatIfSimulator() {
  const [budgetShift, setBudgetShift] = useState([20])

  const projectedLift = (budgetShift[0] * 0.12).toFixed(1)
  const additionalConversions = Math.round(budgetShift[0] * 4.2)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">What-If Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Move budget from Google Ads to Instagram
            </p>
            <span className="font-mono font-semibold">{budgetShift[0]}%</span>
          </div>
          <Slider
            value={budgetShift}
            onValueChange={setBudgetShift}
            max={50}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
          <div className="flex-1 text-center">
            <p className="text-sm text-muted-foreground">Google Ads</p>
            <p className="text-xl font-bold">{55 - budgetShift[0]}%</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 text-center">
            <p className="text-sm text-muted-foreground">Instagram</p>
            <p className="text-xl font-bold text-primary">{15 + budgetShift[0]}%</p>
          </div>
        </div>

        <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projected Conversion Lift</p>
              <p className="text-2xl font-bold text-success">+{projectedLift}%</p>
              <p className="text-xs text-muted-foreground">
                ~{additionalConversions} additional conversions/month
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

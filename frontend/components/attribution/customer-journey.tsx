"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Mail, Globe, ShoppingCart, ArrowRight } from "lucide-react"

const journeySteps = [
  { channel: "Instagram", icon: Instagram, credit: "15%", color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { channel: "Email", icon: Mail, credit: "25%", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { channel: "Google", icon: Globe, credit: "35%", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { channel: "Purchase", icon: ShoppingCart, credit: "25%", color: "bg-success/10 text-success border-success/20" },
]

export function CustomerJourney() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Example Customer Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {journeySteps.map((step, index) => (
            <div key={step.channel} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${step.color}`}>
                <step.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{step.channel}</span>
                <span className="text-xs text-muted-foreground">
                  Shapley: {step.credit}
                </span>
              </div>
              {index < journeySteps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Each touchpoint receives credit based on its marginal contribution to the conversion, not just the last click.
        </p>
      </CardContent>
    </Card>
  )
}

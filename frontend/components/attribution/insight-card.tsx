"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function InsightCard() {
  return (
    <Card className="bg-warning/5 border-warning/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-warning/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">You may be misled</h3>
            <p className="text-muted-foreground">
              <span className="text-foreground font-semibold">Google Ads</span> receives{" "}
              <span className="text-foreground font-semibold">55%</span> last-click credit but only{" "}
              <span className="text-primary font-semibold">29%</span> true influence.
            </p>
            <p className="text-warning font-medium">
              You may be over-investing by approximately ₹52,000/month
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

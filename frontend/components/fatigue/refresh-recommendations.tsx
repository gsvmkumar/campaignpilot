"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { variants } from "@/lib/mock-data"
import { RefreshCw, TrendingUp, Percent } from "lucide-react"

export function RefreshRecommendations() {
  const variantsNeedingRefresh = variants.filter(
    (v) => v.status === "fatigued" || v.status === "watch"
  )

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Refresh Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {variantsNeedingRefresh.map((variant) => {
          const isUrgent = variant.status === "fatigued"
          const estimatedRecovery = isUrgent ? 1.4 : 0.8
          const suggestedBudget = isUrgent ? variant.budget + 5 : variant.budget + 2

          return (
            <div
              key={variant.id}
              className={`p-4 rounded-lg border ${
                isUrgent ? "border-danger/30 bg-danger/5" : "border-warning/30 bg-warning/5"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{variant.name}</h4>
                  <p className="text-sm text-muted-foreground">{variant.platform}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    isUrgent ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
                  }`}
                >
                  {isUrgent ? "Urgent" : "Recommended"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground">Est. CTR Recovery</p>
                    <p className="font-semibold text-success">+{estimatedRecovery}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Suggested Budget</p>
                    <p className="font-semibold">{suggestedBudget}%</p>
                  </div>
                </div>
              </div>

              <Button
                className={`w-full ${
                  isUrgent
                    ? "bg-danger hover:bg-danger/90 text-white"
                    : "bg-warning hover:bg-warning/90 text-black"
                }`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isUrgent ? "Replace Creative Now" : "Schedule Refresh"}
              </Button>
            </div>
          )
        })}

        {variantsNeedingRefresh.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>All creatives are performing well!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

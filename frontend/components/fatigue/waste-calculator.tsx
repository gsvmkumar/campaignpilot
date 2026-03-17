"use client"

import { Card, CardContent } from "@/components/ui/card"
import { variants } from "@/lib/mock-data"
import { AlertTriangle, IndianRupee } from "lucide-react"

export function WasteCalculator() {
  const fatiguedVariants = variants.filter((v) => v.status === "fatigued")
  const totalWaste = fatiguedVariants.reduce((sum, v) => sum + v.spend * 0.15, 0)

  return (
    <Card className="bg-danger/5 border-danger/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-danger/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Estimated Wasted Spend</h3>
            {fatiguedVariants.length > 0 ? (
              <div className="space-y-3">
                {fatiguedVariants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {variant.name} has been fatigued for 2 days
                    </span>
                    <span className="font-mono font-semibold text-danger">
                      ₹{(variant.spend * 0.15).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-danger/20 flex items-center justify-between">
                  <span className="font-semibold">Total Estimated Waste</span>
                  <div className="flex items-center gap-1 text-xl font-bold text-danger">
                    <IndianRupee className="h-5 w-5" />
                    {totalWaste.toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-success">No fatigued variants - all creatives performing well!</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

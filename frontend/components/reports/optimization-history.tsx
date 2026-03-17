"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { optimizationHistory } from "@/lib/mock-data"
import { ArrowRight } from "lucide-react"

export function OptimizationHistory() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Optimization History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Variant
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                  Budget Change
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Reason
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Impact
                </th>
              </tr>
            </thead>
            <tbody>
              {optimizationHistory.map((row) => {
                const isIncrease = row.toPct > row.fromPct

                return (
                  <tr
                    key={row.id}
                    className="border-b border-border/50 hover:bg-secondary/30"
                  >
                    <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                      {row.timestamp}
                    </td>
                    <td className="py-3 px-4 font-medium">{row.variant}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono">{row.fromPct}%</span>
                        <ArrowRight
                          className={`h-4 w-4 ${
                            isIncrease ? "text-success" : "text-danger"
                          }`}
                        />
                        <span
                          className={`font-mono font-semibold ${
                            isIncrease ? "text-success" : "text-danger"
                          }`}
                        >
                          {row.toPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {row.reason}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm ${
                          row.impact.includes("+") ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        {row.impact}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { attributionData } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

export function CreditTable() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Channel Credit Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Channel
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Last-Click %
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Shapley %
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Difference
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {attributionData.map((row) => {
                const isOverInvested = row.difference < -5
                const isUnderInvested = row.difference > 5
                const status = isOverInvested
                  ? "Over-invested"
                  : isUnderInvested
                  ? "Under-invested"
                  : "Balanced"

                return (
                  <tr key={row.channel} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-4 font-medium">{row.channel}</td>
                    <td className="py-3 px-4 text-right font-mono">{row.lastClick}%</td>
                    <td className="py-3 px-4 text-right font-mono text-primary">
                      {row.shapley}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`flex items-center justify-end gap-1 font-mono ${
                          row.difference > 0
                            ? "text-success"
                            : row.difference < 0
                            ? "text-danger"
                            : "text-muted-foreground"
                        }`}
                      >
                        {row.difference > 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : row.difference < 0 ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        {row.difference > 0 ? "+" : ""}
                        {row.difference}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant="outline"
                        className={
                          isOverInvested
                            ? "bg-danger/10 text-danger border-danger/20"
                            : isUnderInvested
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-secondary text-muted-foreground"
                        }
                      >
                        {status}
                      </Badge>
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

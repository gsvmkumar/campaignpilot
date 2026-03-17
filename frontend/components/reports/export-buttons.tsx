"use client"

import { useState } from "react"
import { Download, FileText, Share2, Table } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsResponse, DashboardResponse, DataSummaryResponse } from "@/lib/campaignpilot"

interface ExportButtonsProps {
  dashboard: DashboardResponse
  analytics: AnalyticsResponse
  dataSummary: DataSummaryResponse | null
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function toCsv(dashboard: DashboardResponse): string {
  const rows = [
    ["Application", "Domain", "CTR", "Conversions", "Spend", "BudgetPercent", "FatigueStatus"],
    ...dashboard.variants.map((variant) => {
      const allocation = dashboard.budget_allocations.find((item) => item.variant_id === variant.variant_id)
      const fatigue = dashboard.fatigue_statuses.find((item) => item.variant_id === variant.variant_id)
      return [
        variant.name,
        variant.channel,
        variant.ctr.toString(),
        variant.conversions.toString(),
        variant.spend.toString(),
        (allocation?.budget_percentage ?? 0).toString(),
        fatigue?.status ?? "UNKNOWN",
      ]
    }),
  ]
  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
}

export function ExportButtons({ dashboard, analytics, dataSummary }: ExportButtonsProps) {
  const [shareCopied, setShareCopied] = useState(false)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Export Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => window.print()}
          >
            <FileText className="h-5 w-5" />
            <span>PDF Report</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => downloadFile("campaignpilot-report.csv", toCsv(dashboard), "text/csv;charset=utf-8")}
          >
            <Table className="h-5 w-5" />
            <span>CSV Data</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() =>
              downloadFile(
                "campaignpilot-full-export.json",
                JSON.stringify({ dashboard, analytics, dataSummary }, null, 2),
                "application/json;charset=utf-8",
              )
            }
          >
            <Download className="h-5 w-5" />
            <span>Full Export</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={async () => {
              const summary = `CampaignPilot live snapshot\nBest performer: ${dashboard.best_performer}\nTotal conversions: ${dashboard.total_conversions}\nJourney samples: ${dataSummary?.journey_count ?? 0}`
              await navigator.clipboard.writeText(summary)
              setShareCopied(true)
              window.setTimeout(() => setShareCopied(false), 2000)
            }}
          >
            <Share2 className="h-5 w-5" />
            <span>{shareCopied ? "Copied" : "Share Link"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

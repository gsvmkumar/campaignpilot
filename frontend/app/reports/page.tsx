"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PerformanceSummary } from "@/components/reports/performance-summary"
import { EfficiencyChart } from "@/components/reports/efficiency-chart"
import { OptimizationHistory } from "@/components/reports/optimization-history"
import { ExportButtons } from "@/components/reports/export-buttons"
import { PeriodSelector } from "@/components/reports/period-selector"

export default function ReportsPage() {
  const [period, setPeriod] = useState("7d")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              Campaign summary and insights
            </p>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Performance Summary */}
        <PerformanceSummary />

        {/* Efficiency Chart */}
        <EfficiencyChart />

        {/* Optimization History */}
        <OptimizationHistory />

        {/* Export Buttons */}
        <ExportButtons />
      </div>
    </DashboardLayout>
  )
}

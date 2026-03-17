"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { VariantCards } from "@/components/campaigns/variant-cards"
import { PerformanceComparisonChart } from "@/components/campaigns/performance-chart"
import { TimeSeriesChart } from "@/components/campaigns/time-series-chart"
import { BudgetHistoryChart } from "@/components/campaigns/budget-history-chart"
import { VariantDrawer } from "@/components/campaigns/variant-drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CampaignsPage() {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("ctr")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">
              Deep dive into variant performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-secondary border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ctr">Best CTR</SelectItem>
                <SelectItem value="spend">Most Spend</SelectItem>
                <SelectItem value="conversions">Highest Conversions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Variant Cards */}
        <VariantCards
          onSelectVariant={setSelectedVariant}
          selectedVariant={selectedVariant}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceComparisonChart />
          <TimeSeriesChart />
        </div>

        {/* Budget History */}
        <BudgetHistoryChart />

        {/* Variant Drawer */}
        <VariantDrawer
          variantId={selectedVariant}
          open={!!selectedVariant}
          onClose={() => setSelectedVariant(null)}
        />
      </div>
    </DashboardLayout>
  )
}

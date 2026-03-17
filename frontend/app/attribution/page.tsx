import { DashboardLayout } from "@/components/dashboard-layout"
import { AttributionComparisonChart } from "@/components/attribution/attribution-comparison-chart"
import { InsightCard } from "@/components/attribution/insight-card"
import { CreditTable } from "@/components/attribution/credit-table"
import { WhatIfSimulator } from "@/components/attribution/what-if-simulator"
import { JourneyDistribution } from "@/components/attribution/journey-distribution"
import { CustomerJourney } from "@/components/attribution/customer-journey"

export default function AttributionPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Attribution</h1>
          <p className="text-muted-foreground">
            True channel value with Shapley attribution
          </p>
        </div>

        {/* Insight Card */}
        <InsightCard />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AttributionComparisonChart />
          </div>
          <div>
            <WhatIfSimulator />
          </div>
        </div>

        {/* Customer Journey */}
        <CustomerJourney />

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CreditTable />
          <JourneyDistribution />
        </div>
      </div>
    </DashboardLayout>
  )
}

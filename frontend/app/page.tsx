import { DashboardLayout } from "@/components/dashboard-layout"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { BudgetAllocationChart } from "@/components/dashboard/budget-allocation-chart"
import { BudgetSankey } from "@/components/dashboard/budget-sankey"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { CTRSparklines } from "@/components/dashboard/ctr-sparklines"
import { CountdownTimer } from "@/components/dashboard/countdown-timer"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time campaign optimization with Thompson Sampling
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <MetricCards />

        {/* Countdown Timer */}
        <CountdownTimer />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Charts */}
          <div className="lg:col-span-2 space-y-6">
            <BudgetAllocationChart />
            <BudgetSankey />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </div>

        {/* CTR Sparklines */}
        <CTRSparklines />
      </div>
    </DashboardLayout>
  )
}

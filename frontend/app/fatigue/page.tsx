import { DashboardLayout } from "@/components/dashboard-layout"
import { HealthStatusGrid } from "@/components/fatigue/health-status-grid"
import { CTRDecayChart } from "@/components/fatigue/ctr-decay-chart"
import { AlertTimeline } from "@/components/fatigue/alert-timeline"
import { WasteCalculator } from "@/components/fatigue/waste-calculator"
import { RefreshRecommendations } from "@/components/fatigue/refresh-recommendations"

export default function FatigueMonitorPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Fatigue Monitor</h1>
          <p className="text-muted-foreground">
            Creative health center - proactive fatigue detection
          </p>
        </div>

        {/* Waste Calculator Alert */}
        <WasteCalculator />

        {/* Health Status Grid */}
        <HealthStatusGrid />

        {/* Charts and Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CTRDecayChart />
          </div>
          <div>
            <RefreshRecommendations />
          </div>
        </div>

        {/* Alert Timeline */}
        <AlertTimeline />
      </div>
    </DashboardLayout>
  )
}

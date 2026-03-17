"use client"

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { chartColors, chartTooltipStyle } from "@/lib/chart-theme"
import { budgetHistoryData, variants } from "@/lib/mock-data"

interface VariantDrawerProps {
  variantId: string | null
  open: boolean
  onClose: () => void
}

function getStatusClass(status: string) {
  switch (status) {
    case "healthy":
      return "bg-success/10 text-success border-success/20"
    case "watch":
      return "bg-warning/10 text-warning border-warning/20"
    case "fatigued":
      return "bg-danger/10 text-danger border-danger/20"
    default:
      return ""
  }
}

export function VariantDrawer({ variantId, open, onClose }: VariantDrawerProps) {
  const variant = variants.find((entry) => entry.id === variantId)

  if (!variant) return null

  const budgetData = budgetHistoryData.map((day) => ({
    day: day.day,
    budget: day[variant.id as keyof typeof day] as number,
  }))

  const reasons = {
    healthy: [
      "Strong CTR above average",
      "Consistent conversion performance",
      "Low fatigue score indicates fresh creative",
    ],
    watch: [
      "CTR declining over past 3 days",
      "Fatigue score approaching threshold",
      "Consider preparing refresh creative",
    ],
    fatigued: [
      "CTR dropped 40% from peak",
      "Fatigue threshold exceeded",
      "Budget being automatically reduced",
      "Recommend immediate creative refresh",
    ],
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] border-border bg-background sm:w-[540px]">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">{variant.name}</SheetTitle>
            <Badge className={getStatusClass(variant.status)} variant="outline">
              {variant.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{variant.platform}</p>
        </SheetHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">Current Budget</p>
              <p className="text-2xl font-bold">{variant.budget}%</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">CTR</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{variant.ctr}%</p>
                {variant.status === "healthy" ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-danger" />
                )}
              </div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">Conversions</p>
              <p className="text-2xl font-bold">{variant.conversions.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">Total Spend</p>
              <p className="text-2xl font-bold">Rs {variant.spend.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium">Budget History</h4>
            <div className="h-[150px] rounded-lg bg-secondary/30 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={budgetData}>
                  <defs>
                    <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: chartColors.mutedForeground, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: chartColors.mutedForeground, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 30]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number) => [`${value}%`, "Budget"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="budget"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    fill="url(#budgetGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
              {variant.status === "healthy" ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
              Why is this variant {variant.status}?
            </h4>
            <ul className="space-y-2">
              {reasons[variant.status].map((reason, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Fatigue Score</span>
              <span
                className={
                  variant.fatigueScore >= 70
                    ? "text-danger"
                    : variant.fatigueScore >= 50
                      ? "text-warning"
                      : "text-success"
                }
              >
                {variant.fatigueScore}/100
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all ${
                  variant.fatigueScore >= 70
                    ? "bg-danger"
                    : variant.fatigueScore >= 50
                      ? "bg-warning"
                      : "bg-success"
                }`}
                style={{ width: `${variant.fatigueScore}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>Healthy</span>
              <span>Watch (50)</span>
              <span>Fatigued (70)</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

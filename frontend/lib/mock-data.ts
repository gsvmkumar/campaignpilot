// Ad Variants Data
export const variants = [
  {
    id: "A",
    name: "Variant A",
    platform: "Instagram",
    budget: 24,
    ctr: 3.2,
    conversions: 1420,
    spend: 48000,
    status: "healthy" as const,
    fatigueScore: 22,
    color: "#22c55e",
  },
  {
    id: "B",
    name: "Variant B",
    platform: "Facebook",
    budget: 18,
    ctr: 2.1,
    conversions: 890,
    spend: 36000,
    status: "fatigued" as const,
    fatigueScore: 78,
    color: "#ef4444",
  },
  {
    id: "C",
    name: "Variant C",
    platform: "Google Ads",
    budget: 28,
    ctr: 4.1,
    conversions: 2100,
    spend: 56000,
    status: "healthy" as const,
    fatigueScore: 15,
    color: "#22c55e",
  },
  {
    id: "D",
    name: "Variant D",
    platform: "TikTok",
    budget: 12,
    ctr: 2.8,
    conversions: 680,
    spend: 24000,
    status: "watch" as const,
    fatigueScore: 55,
    color: "#f59e0b",
  },
  {
    id: "E",
    name: "Variant E",
    platform: "YouTube",
    budget: 10,
    ctr: 1.9,
    conversions: 420,
    spend: 20000,
    status: "healthy" as const,
    fatigueScore: 30,
    color: "#22c55e",
  },
  {
    id: "F",
    name: "Variant F",
    platform: "LinkedIn",
    budget: 8,
    ctr: 2.4,
    conversions: 340,
    spend: 16000,
    status: "watch" as const,
    fatigueScore: 48,
    color: "#f59e0b",
  },
]

// CTR Trend Data (last 24 hours)
export const ctrTrendData = [
  { hour: "00:00", A: 3.1, B: 2.4, C: 3.9, D: 2.6, E: 1.8, F: 2.3 },
  { hour: "02:00", A: 3.0, B: 2.3, C: 4.0, D: 2.7, E: 1.9, F: 2.2 },
  { hour: "04:00", A: 3.2, B: 2.2, C: 4.1, D: 2.8, E: 1.8, F: 2.4 },
  { hour: "06:00", A: 3.1, B: 2.1, C: 4.0, D: 2.7, E: 1.9, F: 2.3 },
  { hour: "08:00", A: 3.3, B: 2.0, C: 4.2, D: 2.9, E: 2.0, F: 2.5 },
  { hour: "10:00", A: 3.2, B: 2.1, C: 4.1, D: 2.8, E: 1.9, F: 2.4 },
  { hour: "12:00", A: 3.4, B: 2.0, C: 4.3, D: 3.0, E: 2.1, F: 2.6 },
  { hour: "14:00", A: 3.3, B: 2.1, C: 4.2, D: 2.9, E: 2.0, F: 2.5 },
  { hour: "16:00", A: 3.2, B: 2.1, C: 4.1, D: 2.8, E: 1.9, F: 2.4 },
  { hour: "18:00", A: 3.1, B: 2.2, C: 4.0, D: 2.7, E: 1.8, F: 2.3 },
  { hour: "20:00", A: 3.2, B: 2.1, C: 4.1, D: 2.8, E: 1.9, F: 2.4 },
  { hour: "22:00", A: 3.2, B: 2.1, C: 4.1, D: 2.8, E: 1.9, F: 2.4 },
]

// Budget History Data (7 days)
export const budgetHistoryData = [
  { day: "Day 1", A: 20, B: 22, C: 20, D: 15, E: 13, F: 10 },
  { day: "Day 2", A: 21, B: 21, C: 22, D: 14, E: 12, F: 10 },
  { day: "Day 3", A: 22, B: 20, C: 24, D: 13, E: 12, F: 9 },
  { day: "Day 4", A: 23, B: 19, C: 26, D: 12, E: 11, F: 9 },
  { day: "Day 5", A: 24, B: 18, C: 27, D: 12, E: 11, F: 8 },
  { day: "Day 6", A: 24, B: 18, C: 28, D: 12, E: 10, F: 8 },
  { day: "Day 7", A: 24, B: 18, C: 28, D: 12, E: 10, F: 8 },
]

// Activity Feed Events
export const activityEvents = [
  { id: 1, time: "Just now", event: "Budget shifted to Variant C +8%", type: "budget" as const },
  { id: 2, time: "2 min ago", event: "Variant B marked as fatigued", type: "alert" as const },
  { id: 3, time: "5 min ago", event: "CTR spike detected on Variant A", type: "positive" as const },
  { id: 4, time: "12 min ago", event: "Thompson Sampling rebalance complete", type: "system" as const },
  { id: 5, time: "18 min ago", event: "Variant D moved to watch status", type: "warning" as const },
  { id: 6, time: "25 min ago", event: "New conversion recorded: Variant C", type: "positive" as const },
  { id: 7, time: "32 min ago", event: "Budget shifted from Variant B -5%", type: "budget" as const },
  { id: 8, time: "45 min ago", event: "Daily report generated", type: "system" as const },
  { id: 9, time: "1 hr ago", event: "Variant E performance improving", type: "positive" as const },
  { id: 10, time: "1.5 hrs ago", event: "Thompson Sampling rebalance complete", type: "system" as const },
]

// Attribution Data
export const attributionData = [
  { channel: "Google Ads", lastClick: 55, shapley: 29, difference: -26 },
  { channel: "Instagram", lastClick: 15, shapley: 28, difference: 13 },
  { channel: "Email", lastClick: 8, shapley: 18, difference: 10 },
  { channel: "Facebook", lastClick: 12, shapley: 14, difference: 2 },
  { channel: "TikTok", lastClick: 6, shapley: 8, difference: 2 },
  { channel: "Direct", lastClick: 4, shapley: 3, difference: -1 },
]

// Customer Journey Data for Sankey
export const journeyData = [
  { from: "Instagram", to: "Email", value: 2400 },
  { from: "Instagram", to: "Google", value: 1800 },
  { from: "Instagram", to: "Purchase", value: 600 },
  { from: "Email", to: "Google", value: 1200 },
  { from: "Email", to: "Purchase", value: 1000 },
  { from: "Google", to: "Purchase", value: 2800 },
  { from: "Facebook", to: "Instagram", value: 800 },
  { from: "Facebook", to: "Email", value: 600 },
  { from: "TikTok", to: "Instagram", value: 400 },
]

// Journey Length Distribution
export const journeyLengthData = [
  { touches: "1 Touch", count: 1200, percentage: 24 },
  { touches: "2 Touches", count: 1800, percentage: 36 },
  { touches: "3 Touches", count: 1400, percentage: 28 },
  { touches: "4+ Touches", count: 600, percentage: 12 },
]

// Fatigue Timeline Events
export const fatigueTimeline = [
  { id: 1, date: "Day 7", time: "14:32", variant: "B", event: "Crossed fatigue threshold (70)", severity: "high" as const },
  { id: 2, date: "Day 6", time: "09:15", variant: "D", event: "Entered watch zone (50)", severity: "medium" as const },
  { id: 3, date: "Day 5", time: "22:41", variant: "F", event: "Entered watch zone (45)", severity: "medium" as const },
  { id: 4, date: "Day 3", time: "16:20", variant: "B", event: "Entered watch zone (52)", severity: "medium" as const },
  { id: 5, date: "Day 2", time: "11:05", variant: "A", event: "Creative refreshed, score reset", severity: "low" as const },
]

// CTR Decay Data (14 days)
export const ctrDecayData = [
  { day: 1, A: 4.2, B: 3.8, C: 4.5, D: 3.2, E: 2.5, F: 2.8 },
  { day: 2, A: 4.1, B: 3.6, C: 4.4, D: 3.1, E: 2.4, F: 2.7 },
  { day: 3, A: 4.0, B: 3.4, C: 4.4, D: 3.0, E: 2.4, F: 2.6 },
  { day: 4, A: 3.9, B: 3.2, C: 4.3, D: 2.9, E: 2.3, F: 2.5 },
  { day: 5, A: 3.8, B: 3.0, C: 4.3, D: 2.9, E: 2.3, F: 2.5 },
  { day: 6, A: 3.6, B: 2.8, C: 4.2, D: 2.8, E: 2.2, F: 2.4 },
  { day: 7, A: 3.5, B: 2.6, C: 4.2, D: 2.8, E: 2.1, F: 2.4 },
  { day: 8, A: 3.4, B: 2.4, C: 4.1, D: 2.8, E: 2.0, F: 2.4 },
  { day: 9, A: 3.3, B: 2.3, C: 4.1, D: 2.8, E: 2.0, F: 2.4 },
  { day: 10, A: 3.3, B: 2.2, C: 4.1, D: 2.8, E: 1.9, F: 2.4 },
  { day: 11, A: 3.2, B: 2.2, C: 4.1, D: 2.8, E: 1.9, F: 2.4 },
  { day: 12, A: 3.2, B: 2.1, C: 4.1, D: 2.8, E: 1.9, F: 2.4 },
  { day: 13, A: 3.2, B: 2.1, C: 4.1, D: 2.8, E: 1.9, F: 2.4 },
  { day: 14, A: 3.2, B: 2.1, C: 4.1, D: 2.8, E: 1.9, F: 2.4 },
]

// Optimization History
export const optimizationHistory = [
  { id: 1, timestamp: "Mar 17, 14:32", variant: "C", fromPct: 24, toPct: 28, reason: "Highest posterior CTR", impact: "+12 conversions" },
  { id: 2, timestamp: "Mar 17, 12:15", variant: "B", fromPct: 22, toPct: 18, reason: "Fatigue detected", impact: "-8 wasted spend" },
  { id: 3, timestamp: "Mar 17, 10:00", variant: "A", fromPct: 22, toPct: 24, reason: "CTR improvement", impact: "+6 conversions" },
  { id: 4, timestamp: "Mar 16, 22:45", variant: "D", fromPct: 14, toPct: 12, reason: "Below average CTR", impact: "Budget saved" },
  { id: 5, timestamp: "Mar 16, 18:30", variant: "E", fromPct: 12, toPct: 10, reason: "Declining performance", impact: "Budget reallocated" },
]

// Sankey Flow Data for Budget
export const budgetFlowData = {
  nodes: [
    { id: "Total Budget" },
    { id: "Variant A" },
    { id: "Variant B" },
    { id: "Variant C" },
    { id: "Variant D" },
    { id: "Variant E" },
    { id: "Variant F" },
    { id: "Conversions" },
  ],
  links: [
    { source: "Total Budget", target: "Variant A", value: 48000 },
    { source: "Total Budget", target: "Variant B", value: 36000 },
    { source: "Total Budget", target: "Variant C", value: 56000 },
    { source: "Total Budget", target: "Variant D", value: 24000 },
    { source: "Total Budget", target: "Variant E", value: 20000 },
    { source: "Total Budget", target: "Variant F", value: 16000 },
    { source: "Variant A", target: "Conversions", value: 1420 },
    { source: "Variant B", target: "Conversions", value: 890 },
    { source: "Variant C", target: "Conversions", value: 2100 },
    { source: "Variant D", target: "Conversions", value: 680 },
    { source: "Variant E", target: "Conversions", value: 420 },
    { source: "Variant F", target: "Conversions", value: 340 },
  ],
}

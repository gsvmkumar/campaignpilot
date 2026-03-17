export const chartColors = {
  foreground: "var(--foreground)",
  mutedForeground: "var(--muted-foreground)",
  border: "var(--border)",
  card: "var(--card)",
  primary: "var(--primary)",
  chart1: "var(--chart-1)",
  chart2: "var(--chart-2)",
  chart3: "var(--chart-3)",
  secondary: "var(--secondary)",
} as const

export const chartAxisTick = {
  fill: chartColors.mutedForeground,
  fontSize: 12,
}

export const chartAxisLine = {
  stroke: chartColors.border,
}

export const chartGrid = {
  stroke: chartColors.border,
  strokeDasharray: "3 3",
}

export const chartLegendStyle = {
  color: chartColors.foreground,
  paddingTop: "20px",
}

export const chartTooltipStyle = {
  backgroundColor: chartColors.card,
  border: `1px solid ${chartColors.border}`,
  borderRadius: "8px",
  color: chartColors.foreground,
}

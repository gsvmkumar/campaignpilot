"use client"

import { Button } from "@/components/ui/button"

interface PeriodSelectorProps {
  value: string
  onChange: (value: string) => void
}

const periods = [
  { value: "7d", label: "7 Days" },
  { value: "14d", label: "14 Days" },
  { value: "30d", label: "30 Days" },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={value === period.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(period.value)}
          className={value === period.value ? "" : "text-muted-foreground"}
        >
          {period.label}
        </Button>
      ))}
    </div>
  )
}

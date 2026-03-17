"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { variants } from "@/lib/mock-data"
import { Instagram, Facebook, Globe, Video, Youtube, Linkedin } from "lucide-react"

function getPlatformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case "instagram":
      return Instagram
    case "facebook":
      return Facebook
    case "google ads":
      return Globe
    case "tiktok":
      return Video
    case "youtube":
      return Youtube
    case "linkedin":
      return Linkedin
    default:
      return Globe
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case "healthy":
      return "default"
    case "watch":
      return "secondary"
    case "fatigued":
      return "destructive"
    default:
      return "outline"
  }
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

interface VariantCardsProps {
  onSelectVariant: (id: string) => void
  selectedVariant: string | null
}

export function VariantCards({ onSelectVariant, selectedVariant }: VariantCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {variants.map((variant) => {
        const Icon = getPlatformIcon(variant.platform)
        const isSelected = selectedVariant === variant.id

        return (
          <Card
            key={variant.id}
            className={`bg-card border-border cursor-pointer transition-all hover:border-primary/50 ${
              isSelected ? "border-primary ring-1 ring-primary" : ""
            }`}
            onClick={() => onSelectVariant(variant.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{variant.name}</h3>
                    <p className="text-sm text-muted-foreground">{variant.platform}</p>
                  </div>
                </div>
                <Badge className={getStatusClass(variant.status)} variant="outline">
                  {variant.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-lg font-semibold">{variant.budget}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CTR</p>
                  <p className="text-lg font-semibold">{variant.ctr}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="text-lg font-semibold">{variant.conversions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spend</p>
                  <p className="text-lg font-semibold">₹{(variant.spend / 1000).toFixed(0)}K</p>
                </div>
              </div>

              {/* Progress bar for fatigue */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Fatigue Score</span>
                  <span className={variant.fatigueScore >= 70 ? "text-danger" : variant.fatigueScore >= 50 ? "text-warning" : "text-success"}>
                    {variant.fatigueScore}/100
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      variant.fatigueScore >= 70 ? "bg-danger" : variant.fatigueScore >= 50 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${variant.fatigueScore}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

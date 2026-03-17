"use client"

import { Compass, Search, Sparkles, Target } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DashboardResponse } from "@/lib/campaignpilot"

interface DomainStrategyCardProps {
  domain: string
  domainInput: string
  suggestedDomains: string[]
  strategy: DashboardResponse["domain_strategy"]
  onDomainInputChange: (value: string) => void
  onApplyDomain: () => void
  onSelectSuggestedDomain: (value: string) => void
}

export function DomainStrategyCard({
  domain,
  domainInput,
  suggestedDomains,
  strategy,
  onDomainInputChange,
  onApplyDomain,
  onSelectSuggestedDomain,
}: DomainStrategyCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Compass className="h-5 w-5 text-primary" />
              Domain Strategy
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the business domain and CampaignPilot will recommend the strongest platform mix before optimization kicks in.
            </p>
          </div>
          <div className="hidden rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary md:block">
            Dataset-backed
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={domainInput}
              onChange={(event) => onDomainInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onApplyDomain()
                }
              }}
              placeholder="Try furniture, software, finance, beauty..."
              className="pl-9"
            />
          </div>
          <Button onClick={onApplyDomain} className="md:w-auto">
            Apply Domain
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedDomains.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelectSuggestedDomain(item)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                item.toLowerCase() === domain.toLowerCase()
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {strategy ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Requested Domain</p>
                <p className="mt-2 text-base font-medium">{strategy.requested_domain}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Matched Benchmark</p>
                <p className="mt-2 text-base font-medium">{strategy.matched_domain}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Benchmark Signal</p>
                <p className="mt-2 text-base font-medium">
                  {strategy.benchmark_ctr_percent.toFixed(2)}% CTR / {strategy.benchmark_conversion_rate_percent.toFixed(2)}% CVR
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {strategy.recommended_platforms.slice(0, 3).map((platform, index) => {
                const Icon = index === 0 ? Sparkles : index === 1 ? Target : Compass
                return (
                  <div key={platform.platform} className="rounded-lg border border-border bg-background/60 p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="h-4 w-4" />
                      <p className="text-sm font-medium">{platform.platform}</p>
                    </div>
                    <p className="mt-3 text-2xl font-bold">{platform.recommended_budget_percent.toFixed(1)}%</p>
                    <p className="mt-2 text-sm text-muted-foreground">{platform.rationale}</p>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            Add a business domain to generate a dataset-backed platform recommendation mix, then use the existing budget allocation and monitoring views below to refine it.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

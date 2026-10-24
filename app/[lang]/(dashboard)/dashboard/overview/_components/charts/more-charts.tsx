"use client"

import dynamic from "next/dynamic"
import { useState } from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { QuickCheckComplete } from "@/lib/quick-check"
import { useDictionary } from "../../../_components/i18n-provider"
import { ChartSkeleton } from "../../../_components/charts"

/**
 * The on-click charts (PLAN-DASH-09 step 5): each card, its chart and Recharts are separate
 * chunks that load only when the button is pressed, so they are not in the overview's first load.
 */
const loading = () => <ChartSkeleton height={300} />
const CARDS = {
  demand: dynamic(() => import("./demand-card"), { ssr: false, loading }),
  supply: dynamic(() => import("./supply-card"), { ssr: false, loading }),
  cost: dynamic(() => import("./cost-card"), { ssr: false, loading }),
}

export type MoreChartId = keyof typeof CARDS
export const MORE_CHART_IDS = Object.keys(CARDS) as MoreChartId[]

export function MoreCharts({ result }: { result: QuickCheckComplete }) {
  const copy = useDictionary("overview").charts.more
  const [open, setOpen] = useState<MoreChartId | "">("")
  const Card = open ? CARDS[open] : null

  return (
    <div data-slot="more-charts" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{copy.title}</h3>
        <p className="text-sm text-muted-foreground">{copy.lead}</p>
      </div>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={2}
        value={open}
        onValueChange={(next) => setOpen(next as MoreChartId | "")}
        aria-label={copy.title}
        className="flex-wrap"
      >
        {MORE_CHART_IDS.map((id) => (
          <ToggleGroupItem key={id} value={id} className="min-h-11">
            {copy[id].tab}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {Card && <Card result={result} />}
    </div>
  )
}

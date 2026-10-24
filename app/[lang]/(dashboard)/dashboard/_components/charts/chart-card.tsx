"use client"

import { useId, useState, type ReactNode } from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { useDictionary } from "../i18n-provider"

export type ChartView = "chart" | "table"

/**
 * The frame every overview chart shares: title and lead, an optional info popover, a
 * Chart / Table switch and a body. The table is the same data as text, so every chart has a
 * WCAG-clean twin (dataviz). One switch per chart, not per filter: filters sit above charts.
 */
export function ChartCard({
  title,
  lead,
  info,
  tone = "cool",
  chart,
  table,
  summary,
  id,
  className,
}: {
  title: string
  lead?: string
  /** `CalcInfo` for the numbers the chart shows (D-33). */
  info?: ReactNode
  tone?: "cool" | "hot"
  chart: ReactNode
  table: ReactNode
  /** Key numbers above the plot, e.g. the two totals. */
  summary?: ReactNode
  id?: string
  className?: string
}) {
  const view = useDictionary("overview").charts.view
  const [mode, setMode] = useState<ChartView>("chart")
  const titleId = useId()

  return (
    <section
      id={id}
      data-slot="chart-card"
      data-view={mode}
      aria-labelledby={titleId}
      className={cn("relative flex flex-col gap-4 border bg-card p-5 before:absolute before:inset-x-0 before:-top-px before:h-0.5", tone === "cool" ? "before:bg-primary" : "before:bg-hot", className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-1 basis-56 flex-col gap-1">
          <div className="flex items-center gap-1">
            <h3 id={titleId} className="text-lg leading-tight font-[560] tracking-[-0.03em] [font-stretch:86%]">
              {title}
            </h3>
            {info}
          </div>
          {lead && <p className="text-sm leading-snug text-muted-foreground">{lead}</p>}
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          value={mode}
          onValueChange={(next) => next && setMode(next as ChartView)}
          aria-label={view.label}
          className="shrink-0"
        >
          <ToggleGroupItem value="chart" className="min-h-11 min-w-11">
            {view.chart}
          </ToggleGroupItem>
          <ToggleGroupItem value="table" className="min-h-11 min-w-11">
            {view.table}
          </ToggleGroupItem>
        </ToggleGroup>
      </header>
      {summary}
      {mode === "chart" ? chart : table}
    </section>
  )
}

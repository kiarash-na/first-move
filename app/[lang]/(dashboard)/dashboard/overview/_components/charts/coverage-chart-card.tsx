"use client"

import { FlameIcon, SnowflakeIcon } from "lucide-react"

import { formatIndicator } from "@/lib/dashboard/indicator-format"
import { coverageRows } from "@/lib/dashboard/overview"
import { indicatorEffect } from "@/lib/dashboard/indicator-effect"
import { formatEnergy, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { QuickCheckComplete } from "@/lib/quick-check"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BulletBar, ChartCard, ChartTable, type ChartTableRow } from "../../../_components/charts"
import { EffectMark } from "../../../_components/effect-mark"

const SCALE_MAX = 1.5
const DRIVER = { heating: "heating_coverage", cooling: "cooling_coverage" } as const

/**
 * Default chart 1 (PLAN-DASH-09): supply against demand for heating and cooling as SVG bullet
 * bars with the TBL-7 thresholds. No Recharts here, so it is part of the first paint.
 */
export function CoverageChartCard({ result, className }: { result: QuickCheckComplete; className?: string }) {
  const lang = useLocale()
  const overview = useDictionary("overview")
  const qc = useDictionary("quick-check")
  const copy = overview.charts.coverage
  const rows = coverageRows(result)
  const ticks = [
    { at: 0.7, label: formatPercent(0.7, lang) },
    { at: 0.9, label: "" },
    { at: 1, label: formatPercent(1, lang) },
  ]

  const chart = (
    <ul className="grid gap-x-10 gap-y-6 md:grid-cols-2" aria-label={copy.title}>
      {rows.map((row) => {
        const Icon = row.demand === "heating" ? FlameIcon : SnowflakeIcon
        const effect = indicatorEffect(result.drivers, DRIVER[row.demand])
        return (
          <li key={row.demand} data-demand={row.demand} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">
                <Icon className={cn("size-4", row.demand === "heating" ? "text-hot" : "text-primary")} strokeWidth={1.6} aria-hidden="true" />
                {qc.results.demands[row.demand].label}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="font-mono text-xl leading-none tabular-nums">{row.coverage === null ? copy.notRelevant : formatIndicator("coverage", row.coverage, lang)}</span>
                <EffectMark effect={effect} />
              </span>
            </div>
            {row.coverage !== null && <BulletBar value={row.coverage} max={SCALE_MAX} ticks={ticks} target={1} tone={effect === "limiting" ? "hot" : "cool"} />}
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              {copy.supply} {formatEnergy(row.supplyKwh, lang, { perYear: true })} · {copy.demand} {formatEnergy(row.demandKwh, lang, { perYear: true })}
            </p>
          </li>
        )
      })}
    </ul>
  )

  const tableRows: ChartTableRow[] = rows.map((row) => ({
    key: row.demand,
    label: qc.results.demands[row.demand].label,
    cells: [
      formatEnergy(row.supplyKwh, lang, { perYear: true }),
      formatEnergy(row.demandKwh, lang, { perYear: true }),
      row.coverage === null ? copy.notRelevant : formatIndicator("coverage", row.coverage, lang),
    ],
  }))

  return (
    <ChartCard
      id="chart-coverage"
      className={className}
      title={copy.title}
      lead={copy.lead}
      chart={chart}
      table={
        <ChartTable
          caption={interpolate(overview.charts.tableOf, { chart: copy.title })}
          heading={copy.type}
          columns={[copy.supply, copy.demand, copy.coverage]}
          rows={tableRows}
        />
      }
    />
  )
}

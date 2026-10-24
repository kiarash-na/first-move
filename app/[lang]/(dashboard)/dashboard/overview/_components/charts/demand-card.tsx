"use client"

import { demandByType } from "@/lib/dashboard/overview"
import { formatEnergy } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { CONSTRUCTION_PERIODS } from "@/lib/project/catalog/construction-periods"
import type { QuickCheckComplete } from "@/lib/quick-check"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { ChartCard, ChartTable, ramp, SeriesLegend } from "../../../_components/charts"
import DemandChart from "./demand-chart"

const DEMANDS = [
  { key: "heating", tone: "hot" },
  { key: "cooling", tone: "cool" },
] as const

/** On-click chart 1: demand by building type and construction period, heating and cooling side by side. */
export default function DemandCard({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const overview = useDictionary("overview")
  const qc = useDictionary("quick-check")
  const copy = overview.charts.more.demand
  const data = demandByType(result)
  const caption = (name: string) => interpolate(overview.charts.tableOf, { chart: `${copy.title}: ${name}` })

  return (
    <ChartCard
      id="chart-demand"
      title={copy.title}
      lead={copy.lead}
      chart={
        <div className="grid gap-8 lg:grid-cols-2">
          {DEMANDS.map(({ key, tone }) => {
            const shades = ramp(tone, CONSTRUCTION_PERIODS.length)
            return (
              <div key={key} data-demand={key} className="flex flex-col gap-2">
                <h4 className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{copy[key]}</h4>
                <DemandChart rows={data[key]} tone={tone} />
                <SeriesLegend items={CONSTRUCTION_PERIODS.map((period, index) => ({ id: period, label: qc.periods[period].label, color: shades[index] }))} />
              </div>
            )
          })}
        </div>
      }
      table={
        <div className="flex flex-col gap-6">
          {DEMANDS.map(({ key }) => (
            <ChartTable
              key={key}
              caption={caption(copy[key])}
              heading={`${copy[key]} · ${copy.type}`}
              columns={[...CONSTRUCTION_PERIODS.map((period) => qc.periods[period].label), overview.charts.total]}
              rows={data[key].map((row) => ({
                key: row.type,
                label: qc.buildingTypes[row.type].label,
                cells: [...CONSTRUCTION_PERIODS.map((period) => formatEnergy(row.periods[period], lang)), formatEnergy(row.total, lang, { perYear: true })],
              }))}
            />
          ))}
        </div>
      }
    />
  )
}


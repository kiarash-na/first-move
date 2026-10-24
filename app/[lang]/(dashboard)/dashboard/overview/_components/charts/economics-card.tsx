"use client"

import dynamic from "next/dynamic"

import { economicsData } from "@/lib/dashboard/overview"
import { formatEur } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { QuickCheckComplete } from "@/lib/quick-check"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { barChartHeight, ChartCard, ChartSkeleton, ChartTable, SeriesLegend, type ChartTableRow } from "../../../_components/charts"
import { ECONOMICS_SERIES } from "./economics-series"

const HEIGHT = barChartHeight(2, 64)

// Recharts stays out of the first-load bundle: this chunk is fetched after the page is interactive.
const EconomicsChart = dynamic(() => import("./economics-chart"), { ssr: false, loading: () => <ChartSkeleton height={HEIGHT} /> })

/** Default chart 2 (PLAN-DASH-09): revenues against annual costs, with their parts. */
export function EconomicsCard({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const overview = useDictionary("overview")
  const copy = overview.charts.economics
  const data = economicsData(result)
  const perYear = overview.kpi.perYear
  const money = (value: number) => `${formatEur(value, lang)}${perYear}`

  const legend = (group: "revenues" | "costs") =>
    ECONOMICS_SERIES.filter((series) => series.group === group).map((series) => ({
      id: series.id,
      label: group === "revenues" ? copy.revenue[series.part as "base"] : copy.cost[series.part as "annualized"],
      color: series.color,
      hatched: series.hatched,
    }))

  const rows: ChartTableRow[] = [
    ...data.revenues.map((part) => ({ key: `revenue-${part.id}`, label: `${copy.revenues}: ${copy.revenue[part.id]}`, cells: [money(part.value)] })),
    { key: "revenues", label: <strong className="font-semibold">{copy.revenues}</strong>, cells: [<strong key="v" className="font-semibold">{money(data.revenueTotal)}</strong>] },
    ...data.costs.map((part) => ({ key: `cost-${part.id}`, label: `${copy.costs}: ${copy.cost[part.id]}`, cells: [money(part.value)] })),
    { key: "costs", label: <strong className="font-semibold">{copy.costs}</strong>, cells: [<strong key="v" className="font-semibold">{money(data.costTotal)}</strong>] },
  ]

  return (
    <ChartCard
      id="chart-economics"
      title={copy.title}
      lead={copy.lead}
      summary={
        <dl className="grid grid-cols-2 gap-px border bg-border">
          {([["revenues", data.revenueTotal], ["costs", data.costTotal]] as const).map(([key, total]) => (
            <div key={key} className="flex flex-col gap-0.5 bg-card px-3 py-2">
              <dt className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{copy[key]}</dt>
              <dd className="font-mono text-base tabular-nums">{money(total)}</dd>
            </div>
          ))}
        </dl>
      }
      chart={
        <div className="flex flex-col gap-3">
          <EconomicsChart data={data} />
          <div className="flex flex-col gap-1.5">
            <SeriesLegend label={copy.revenues} items={legend("revenues")} />
            <SeriesLegend label={copy.costs} items={legend("costs")} />
          </div>
        </div>
      }
      table={
        <ChartTable
          caption={interpolate(overview.charts.tableOf, { chart: copy.title })}
          heading={copy.item}
          columns={[copy.amount]}
          rows={rows}
        />
      }
    />
  )
}

"use client"

import { costStructure } from "@/lib/dashboard/overview"
import { EMPTY_VALUE, formatEur, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { QuickCheckComplete } from "@/lib/quick-check"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { ChartCard, ChartTable } from "../../../_components/charts"
import CostChart from "./cost-chart"

/** On-click chart 3: the annual costs by component and the investment down to each source. */
export default function CostCard({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const overview = useDictionary("overview")
  const sources = useDictionary("quick-check").sources
  const copy = overview.charts.more.cost
  const data = costStructure(result)
  const caption = (name: string) => interpolate(overview.charts.tableOf, { chart: `${copy.title}: ${name}` })

  return (
    <ChartCard
      id="chart-cost"
      title={copy.title}
      lead={copy.lead}
      tone="hot"
      chart={<CostChart data={data} />}
      table={
        <div className="flex flex-col gap-6">
          <ChartTable
            caption={caption(copy.annual)}
            heading={copy.annual}
            columns={[`${overview.charts.economics.amount}`, copy.share]}
            rows={data.annual.map((part) => ({
              key: part.id,
              label: overview.charts.economics.cost[part.id],
              cells: [`${formatEur(part.value, lang)}${overview.kpi.perYear}`, formatPercent(part.share, lang)],
            }))}
          />
          <ChartTable
            caption={caption(copy.investment)}
            heading={copy.investment}
            columns={[overview.charts.investment.amount, copy.electricity]}
            rows={data.investment.map((item) => {
              const source = data.perSource.find((entry) => entry.source === item.id)
              const label = item.id === "heatPump" || item.id === "network" ? overview.charts.investment.parts[item.id] : sources[item.id].label
              return {
                key: item.id,
                label,
                cells: [formatEur(item.value, lang), source ? `${formatEur(source.electricity, lang)}${overview.kpi.perYear}` : EMPTY_VALUE],
              }
            })}
          />
        </div>
      }
    />
  )
}

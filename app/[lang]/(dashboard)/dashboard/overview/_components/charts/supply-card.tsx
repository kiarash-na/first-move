"use client"

import { supplyBySource } from "@/lib/dashboard/overview"
import { formatEnergy } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { QuickCheckComplete } from "@/lib/quick-check"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { ChartCard, ChartTable, SERIES, SeriesLegend } from "../../../_components/charts"
import SupplyChart from "./supply-chart"

/** On-click chart 2: what each selected source supplies against the two demands. */
export default function SupplyCard({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const overview = useDictionary("overview")
  const sources = useDictionary("quick-check").sources
  const copy = overview.charts.more.supply
  const data = supplyBySource(result)
  const energy = (kwh: number) => formatEnergy(kwh, lang, { perYear: true })

  return (
    <ChartCard
      id="chart-supply"
      title={copy.title}
      lead={copy.lead}
      chart={
        <div className="flex flex-col gap-3">
          <SupplyChart data={data} />
          <SeriesLegend
            items={[
              { id: "heating", label: copy.heatingSupply, color: SERIES.hot },
              { id: "cooling", label: copy.coolingSupply, color: SERIES.cool },
              { id: "heating-demand", label: copy.heatingDemand, color: SERIES.hot, line: true },
              { id: "cooling-demand", label: copy.coolingDemand, color: SERIES.cool, line: true },
            ]}
          />
        </div>
      }
      table={
        <ChartTable
          caption={interpolate(overview.charts.tableOf, { chart: copy.title })}
          heading={copy.source}
          columns={[copy.heatingSupply, copy.coolingSupply]}
          rows={data.rows.map((row) => ({ key: row.source, label: sources[row.source].label, cells: [energy(row.heatingKwh), energy(row.coolingKwh)] }))}
          footer={{ key: "demand", label: overview.charts.coverage.demand, cells: [energy(data.heatingDemandKwh), energy(data.coolingDemandKwh)] }}
        />
      }
    />
  )
}

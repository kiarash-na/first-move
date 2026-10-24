"use client"

import dynamic from "next/dynamic"

import { investmentParts } from "@/lib/dashboard/overview"
import { formatEur } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { QuickCheckComplete } from "@/lib/quick-check"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { barChartHeight, ChartCard, ChartSkeleton, ChartTable } from "../../../_components/charts"

const InvestmentChart = dynamic(() => import("./investment-chart"), { ssr: false, loading: () => <ChartSkeleton height={barChartHeight(3)} /> })

/** Default chart 3 (PLAN-DASH-09): the parts of the overall investment (EQ-3.10d with OQ-17). */
export function InvestmentCard({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const overview = useDictionary("overview")
  const copy = overview.charts.investment
  const parts = investmentParts(result)

  return (
    <ChartCard
      id="chart-investment"
      title={copy.title}
      lead={copy.lead}
      tone="hot"
      chart={<InvestmentChart parts={parts} />}
      table={
        <ChartTable
          caption={interpolate(overview.charts.tableOf, { chart: copy.title })}
          heading={copy.item}
          columns={[copy.amount]}
          rows={parts.map((part) => ({ key: part.id, label: copy.parts[part.id], cells: [formatEur(part.value, lang)] }))}
          footer={{ key: "total", label: overview.charts.total, cells: [formatEur(result.values.overallInvestment, lang)] }}
        />
      }
    />
  )
}

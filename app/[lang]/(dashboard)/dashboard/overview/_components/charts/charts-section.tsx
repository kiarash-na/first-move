"use client"

import type { QuickCheckComplete } from "@/lib/quick-check"
import { useDictionary } from "../../../_components/i18n-provider"
import { CoverageChartCard } from "./coverage-chart-card"
import { EconomicsCard } from "./economics-card"
import { InvestmentCard } from "./investment-card"
import { MoreCharts } from "./more-charts"

/** The overview charts (D-06): three by default, three more on click. Every chart has a table view. */
export function ChartsSection({ result }: { result: QuickCheckComplete }) {
  const title = useDictionary("overview").sections.charts
  return (
    <section aria-labelledby="overview-charts" data-slot="charts-section" className="flex flex-col gap-6">
      <h2 id="overview-charts" className="text-xl leading-tight font-[560] tracking-[-0.035em] [font-stretch:86%]">
        {title}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <CoverageChartCard result={result} className="lg:col-span-2" />
        <EconomicsCard result={result} />
        <InvestmentCard result={result} />
      </div>
      <MoreCharts result={result} />
    </section>
  )
}

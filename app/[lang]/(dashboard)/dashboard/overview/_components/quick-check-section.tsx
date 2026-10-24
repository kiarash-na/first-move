"use client"

import type { QuickCheckComplete } from "@/lib/quick-check"
import { useDictionary } from "../../_components/i18n-provider"
import { ChartsSection } from "./charts/charts-section"
import { KpiGrid } from "./kpis/kpi-grid"
import { TileGrid } from "./tiles/tile-grid"
import { VerdictHero } from "./verdict-hero"

/** Everything the Quick Check gives, in reading order: verdict, key numbers, indicators, charts. */
export function QuickCheckSection({ result }: { result: QuickCheckComplete }) {
  const screening = useDictionary("quick-check").ui.results.screening
  return (
    <div data-slot="quick-check-section" className="flex flex-col gap-10">
      <VerdictHero result={result} />
      <KpiGrid result={result} />
      <TileGrid result={result} />
      <ChartsSection result={result} />
      <p className="max-w-[70ch] border-t pt-4 text-sm leading-relaxed text-muted-foreground">
        <strong className="font-[560] text-text-secondary">{screening.title}.</strong> {screening.body}
      </p>
    </div>
  )
}

"use client"

import { DEMANDS, type QuickCheckComplete } from "@/lib/quick-check"
import { useDictionary } from "../i18n-provider"
import { CoverageCard } from "./coverage-card"

/** Heating and cooling coverage side by side, so supply gaps stay visible (QCT-KF-04). */
export function CoveragePanel({ result }: { result: QuickCheckComplete }) {
  const ui = useDictionary("quick-check").ui.results.coverage
  return (
    <section aria-labelledby="coverage-title" data-slot="coverage" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div className="flex flex-col gap-1">
          <h2 id="coverage-title" className="text-xl leading-tight font-[560] tracking-[-0.035em] [font-stretch:86%]">
            {ui.title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{ui.lead}</p>
        </div>
        <p className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{ui.scale}</p>
      </div>
      <div className="grid gap-px border bg-border md:grid-cols-2">
        {DEMANDS.map((demand) => (
          <CoverageCard key={demand} demand={demand} result={result} />
        ))}
      </div>
    </section>
  )
}

"use client"

import { formatPercent } from "@/lib/i18n/format"
import type { FieldGroup } from "@/lib/project"
import type { ShareSum } from "@/lib/dashboard/share-sum"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale, useTextRef } from "../../../../_components/i18n-provider"
import { SHARE_COLUMNS } from "./share-columns"
import { ShareLegend } from "./share-legend"
import { ShareRow } from "./share-row"

/**
 * QCT-IN-04: building types as rows, construction periods as columns (Industry included, period
 * labels verbatim, OQ-03). The grid starts empty (D-31); row and column totals update live.
 */
export function ShareGrid({ group, sum }: { group: FieldGroup; sum: ShareSum }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check")
  const text = useTextRef()
  const periods = group.columns?.keys ?? []
  const types = group.rows?.keys ?? []
  const header = "hidden gap-x-2 px-3 font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase @xl:grid"

  return (
    <section aria-labelledby="share-grid-title" data-slot="share-grid" className="flex flex-col gap-4">
      <div className="flex max-w-[64ch] flex-col gap-1.5">
        <h2 id="share-grid-title" className="text-lg leading-tight font-[560] tracking-[-0.03em] [font-stretch:86%]">
          {text(group.text)}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{text(group.text, "help")}</p>
      </div>
      <div className="flex flex-col border bg-card">
        <div aria-hidden="true" className={cn(header, SHARE_COLUMNS, "items-end border-b py-3")}>
          <span>{copy.ui.buildings.types}</span>
          {periods.map((period) => (
            <span key={period} className="text-right normal-case">
              {copy.periods[period as keyof typeof copy.periods].label}
            </span>
          ))}
          <span className="text-right">{copy.ui.buildings.rowTotal}</span>
        </div>
        <div className="flex flex-col divide-y">
          {types.map((type) => (
            <ShareRow key={type} group={group} type={type} total={sum.rows[type] ?? 0} />
          ))}
        </div>
        <div aria-hidden="true" className={cn(header, SHARE_COLUMNS, "border-t bg-muted/40 py-3")}>
          <span>{copy.ui.buildings.columnTotal}</span>
          {periods.map((period) => (
            <span key={period} className="text-right tabular-nums">
              {formatPercent((sum.columns[period] ?? 0) / 100, lang, { fractionDigits: 1 })}
            </span>
          ))}
          <span className={cn("text-right tabular-nums", sum.state === "exact" ? "text-primary" : sum.state === "over" ? "text-hot" : "text-foreground")}>
            {formatPercent(sum.sum / 100, lang, { fractionDigits: 1 })}
          </span>
        </div>
      </div>
      <ShareLegend types={types} />
    </section>
  )
}

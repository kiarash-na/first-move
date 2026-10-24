"use client"

import { TriangleAlertIcon } from "lucide-react"
import { formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { cellField, INDUSTRY, type FieldGroup } from "@/lib/project"
import { cn } from "@/lib/utils"
import { isNumberField, NumberField } from "../../../../_components/fields/number-field"
import { useDictionary, useLocale } from "../../../../_components/i18n-provider"
import { SHARE_COLUMNS } from "./share-columns"

/**
 * One building type of the share grid: label (description on phones, in the legend when wide), one cell per construction period
 * (labels verbatim, OQ-03) and the row total. Wide: a table row; narrow: a block of cells.
 */
export function ShareRow({ group, type, total }: { group: FieldGroup; type: string; total: number }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check")
  const typeCopy = copy.buildingTypes[type as keyof typeof copy.buildingTypes]
  const periods = group.columns?.keys ?? []
  const industry = type === INDUSTRY

  return (
    <div role="group" aria-label={typeCopy.label} data-row={type} className={cn("grid gap-x-3 gap-y-3 px-4 py-4 @xl:items-center @xl:gap-x-2 @xl:px-3 @xl:py-3", "grid-cols-3", SHARE_COLUMNS)}>
      <div className="col-span-full flex min-w-0 flex-col gap-0.5 @xl:col-span-1 @xl:pr-2">
        <span className="inline-flex items-center gap-1.5 text-[15px] leading-snug font-[480]">
          {typeCopy.label}
          {industry && <TriangleAlertIcon className="hidden size-3.5 shrink-0 text-hot @xl:inline" strokeWidth={1.8} aria-hidden="true" />}
        </span>
        <span className={cn("flex items-start gap-1.5 text-xs leading-snug text-muted-foreground @xl:hidden", industry && "text-text-secondary")}>
          {industry && <TriangleAlertIcon className="mt-px size-3.5 shrink-0 text-hot" strokeWidth={1.8} aria-hidden="true" />}
          {typeCopy.description}
        </span>
      </div>
      {periods.map((period) => {
        const field = cellField(group.id, type, period)
        const periodLabel = copy.periods[period as keyof typeof copy.periods].label
        if (!isNumberField(field)) return <span key={period} />
        return (
          <div key={period} className="flex min-w-0 flex-col gap-1">
            <span aria-hidden="true" className="font-mono text-xs tracking-[0.04em] text-muted-foreground @xl:hidden">
              {periodLabel}
            </span>
            <NumberField field={field} compact hideLabel label={interpolate(copy.ui.buildings.cell, { type: typeCopy.label, period: periodLabel })} />
          </div>
        )
      })}
      <div className="col-span-full flex items-baseline justify-between gap-2 border-t pt-2 @xl:col-span-1 @xl:block @xl:border-t-0 @xl:pt-0 @xl:text-right">
        <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase @xl:sr-only">{copy.ui.buildings.rowTotal}</span>
        <span className={cn("font-mono text-sm tabular-nums", total > 0 ? "text-foreground" : "text-muted-foreground")}>
          {formatPercent(total / 100, lang, { fractionDigits: 1 })}
        </span>
      </div>
    </div>
  )
}

"use client"

import { formatHectares, formatNumber, formatPercent, formatQuantity } from "@/lib/i18n/format"
import { lookup } from "@/lib/i18n/lookup"
import type { ReportValue } from "@/lib/report/quick-check-inputs"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/** One Quick Check input as the report prints it, in the page language (`lib/i18n/format`). */
export function ReportInputValue({ value }: { value: ReportValue }) {
  const lang = useLocale()
  const copy = useDictionary("report").inputs
  const quickCheck = useDictionary("quick-check")

  switch (value.kind) {
    case "number": {
      const text = value.unit ? formatQuantity(value.value, value.unit, lang) : formatNumber(value.value, lang)
      return (
        <>
          {text}
          {value.hectares && <span className="text-muted-foreground"> ({formatHectares(value.value, lang)})</span>}
        </>
      )
    }
    case "percent":
      // As typed: 37.5 stays 37.5 %, so the printed shares add up to 100 % (R-03).
      return <>{formatPercent(value.value / 100, lang, { fractionDigits: 2 })}</>
    case "boolean":
      return <>{value.value ? copy.yes : copy.no}</>
    case "choice":
      return <>{lookup(quickCheck, value.option.key)}</>
    case "empty":
      return <span className="text-muted-foreground">{copy.empty[value.means]}</span>
  }
}

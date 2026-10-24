"use client"

import { lookup } from "@/lib/i18n/lookup"
import { interpolate } from "@/lib/i18n/interpolate"
import { formatNumber } from "@/lib/i18n/format"
import type { ReportAnswer as Answer } from "@/lib/report/business-plan-entries"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/** One Business Plan answer as written: text keeps its line breaks, lists and rows stay lists. */
export function ReportAnswer({ answer }: { answer: Answer }) {
  const lang = useLocale()
  const businessPlan = useDictionary("business-plan")
  const copy = useDictionary("report")

  switch (answer.kind) {
    case "text":
      return <p className="text-sm leading-relaxed whitespace-pre-line">{answer.text.trim()}</p>
    case "choice":
      return <p className="text-sm leading-relaxed">{lookup(businessPlan, answer.option.key)}</p>
    case "list":
      return (
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed">
          {answer.items.map((item, index) => (
            <li key={index}>{item.trim()}</li>
          ))}
        </ul>
      )
    case "rows":
      return (
        <ol className="flex flex-col gap-3">
          {answer.rows.map((row, index) => (
            <li key={row.id} className="flex flex-col gap-2 border-l-2 border-hot/60 pl-4 break-inside-avoid">
              <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
                {interpolate(copy.businessPlan.row, { number: formatNumber(index + 1, lang) })}
              </span>
              <dl className="flex flex-col gap-1.5">
                {row.cells.map((cell) => (
                  <div key={cell.label.key} className="flex flex-col gap-0.5">
                    <dt className="text-xs leading-snug text-muted-foreground">{lookup(businessPlan, cell.label.key)}</dt>
                    <dd className="text-sm leading-relaxed whitespace-pre-line">
                      {typeof cell.value === "string" ? cell.value.trim() : copy.inputs.yes}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      )
  }
}

"use client"

import { formatDate } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { SITE } from "@/lib/legal/operator"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/** The last lines: what the report is (a screening, QCT-SCOPE-08) and where it was made. */
export function ReportFooter({ created }: { created: string }) {
  const lang = useLocale()
  const copy = useDictionary("report").footer
  const screening = useDictionary("quick-check").ui.results.screening

  return (
    <footer data-slot="report-footer" className="flex flex-col gap-2 border-t pt-5 text-xs leading-relaxed text-muted-foreground break-inside-avoid">
      <p className="max-w-[72ch]">
        <strong className="font-[560] text-text-secondary">{screening.title}.</strong> {screening.body}
      </p>
      <p>{interpolate(copy.created, { site: SITE.domain, date: formatDate(created, lang) })}</p>
    </footer>
  )
}

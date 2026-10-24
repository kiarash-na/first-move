"use client"

import { ArrowLeftIcon, PrinterIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { dashboardHref } from "@/lib/dashboard/routes"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/**
 * Above the sheet, on screen only: back to the overview, and the browser's print dialog, where
 * "Save as PDF" makes the PDF (D-70). Nothing is generated or uploaded.
 */
export function ReportToolbar() {
  const lang = useLocale()
  const copy = useDictionary("report").toolbar

  return (
    <div
      role="toolbar"
      aria-label={copy.label}
      data-slot="report-toolbar"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 print:hidden"
    >
      <Button asChild variant="ghost">
        <Link href={dashboardHref(lang, { page: "overview" })}>
          <ArrowLeftIcon strokeWidth={1.6} aria-hidden="true" />
          {copy.back}
        </Link>
      </Button>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm text-muted-foreground">{copy.hint}</p>
        <Button onClick={() => window.print()}>
          <PrinterIcon strokeWidth={1.6} aria-hidden="true" />
          {copy.print}
        </Button>
      </div>
    </div>
  )
}

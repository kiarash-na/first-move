"use client"

import { ArrowRightIcon, PowerOffIcon, CircleDashedIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { dashboardHref } from "@/lib/dashboard/routes"
import type { QcPrefill } from "@/lib/business-plan"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"

/**
 * Shown instead of the Quick Check numbers when the module is off (a link to Quick Check) or
 * not complete yet (a link to the step to finish). The Business Plan works without either.
 */
export function QcUnavailable({ prefill }: { prefill: Exclude<QcPrefill, { status: "ready" }> }) {
  const lang = useLocale()
  const bp = useDictionary("business-plan")
  const off = prefill.status === "off"
  const copy = off ? bp.qc.off : bp.qc.incomplete
  const step = prefill.status === "incomplete" ? (prefill.nextStep ?? "area") : "area"
  const Icon = off ? PowerOffIcon : CircleDashedIcon

  return (
    <div className="flex flex-col gap-4 border border-dashed p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="flex items-start gap-4">
        <Icon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-base font-[520]">{copy.title}</p>
          <p className="max-w-[56ch] text-sm leading-relaxed text-text-secondary">{copy.body}</p>
        </div>
      </div>
      <Button asChild variant="default" className="shrink-0">
        <Link href={dashboardHref(lang, { page: "quick-check", step })}>
          {copy.action}
          <ArrowRightIcon strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}

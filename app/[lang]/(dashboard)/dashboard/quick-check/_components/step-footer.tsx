"use client"

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { dashboardHref, QUICK_CHECK_PAGES } from "@/lib/dashboard/routes"
import { interpolate } from "@/lib/i18n/interpolate"
import type { QuickCheckStep } from "@/lib/project"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/** Back and next at the end of a step; after the last step, the results. */
export function StepFooter({ step }: { step: QuickCheckStep }) {
  const lang = useLocale()
  const items = useDictionary("shell").nav.items.quickCheck
  const copy = useDictionary("quick-check").ui.footer
  const index = QUICK_CHECK_PAGES.indexOf(step)
  const previous = index > 0 ? QUICK_CHECK_PAGES[index - 1] : null
  const next = QUICK_CHECK_PAGES[index + 1]

  return (
    <div data-slot="step-footer" className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
      {previous ? (
        <Button asChild variant="ghost">
          <Link href={dashboardHref(lang, { page: "quick-check", step: previous })}>
            <ArrowLeftIcon strokeWidth={1.6} aria-hidden="true" />
            {copy.previous}
          </Link>
        </Button>
      ) : (
        <span />
      )}
      <Button asChild className="max-sm:w-full">
        <Link href={dashboardHref(lang, { page: "quick-check", step: next })}>
          {next === "results" ? copy.results : interpolate(copy.next, { step: items[next] })}
          <ArrowRightIcon strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}

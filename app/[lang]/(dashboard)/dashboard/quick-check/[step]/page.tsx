import type { Metadata } from "next"
import { Suspense } from "react"

import { isQuickCheckPage, QUICK_CHECK_PAGES } from "@/lib/dashboard/routes"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { QuickCheckStep } from "./_components/quick-check-step"
import { QuickCheckStepSkeleton } from "./_components/quick-check-step-skeleton"

/** Every Quick Check page is prerendered; an unknown step is a 404 (PLAN-DASH-00). */
export function generateStaticParams() {
  return QUICK_CHECK_PAGES.map((step) => ({ step }))
}

/** Waits for the complete static page, so an unknown step answers 404 instead of a 200 shell. */
export const ensureStatic = "navigation"

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/quick-check/[step]">): Promise<Metadata> {
  const { lang, step } = await params
  if (!isQuickCheckPage(step)) return {}
  const shell = await getDictionary(requireLocale(lang), "shell")
  return { title: `${shell.nav.items.quickCheck[step]} · ${shell.nav.sections.quickCheck}` }
}

/**
 * A Quick Check input step (QCT-IN-00..09) or the results (QCT-KF-*). The step is read inside
 * `<Suspense>` so the App Shell is shared by every step; the inputs and the live result read
 * the project on the client inside the gate.
 */
export default function QuickCheckStepPage({ params }: PageProps<"/[lang]/dashboard/quick-check/[step]">) {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<QuickCheckStepSkeleton />}>
        <QuickCheckStep params={params} />
      </Suspense>
    </div>
  )
}

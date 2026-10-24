import type { Metadata } from "next"
import { Suspense } from "react"

import { BUSINESS_PLAN_PAGES, isBusinessPlanPage } from "@/lib/dashboard/routes"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { GateSkeleton } from "../../_components/gate-skeleton"
import { BusinessPlanStepRoute } from "./_components/business-plan-step-route"

/** Every Business Plan step is prerendered; an unknown step is a 404 (PLAN-DASH-00). */
export function generateStaticParams() {
  return BUSINESS_PLAN_PAGES.map((step) => ({ step }))
}

/** Waits for the complete static page, so an unknown step answers 404 instead of a 200 shell. */
export const ensureStatic = "navigation"

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/business-plan/[step]">): Promise<Metadata> {
  const { lang, step } = await params
  if (!isBusinessPlanPage(step)) return {}
  const shell = await getDictionary(requireLocale(lang), "shell")
  return { title: `${shell.nav.items.businessPlan[step]} · ${shell.nav.sections.businessPlan}` }
}

/**
 * A Business Plan step BM-STEP-01..04 (phase 10). The step is read inside `<Suspense>` (the
 * fallback is the gate's own skeleton); the project is read on the client only.
 */
export default function BusinessPlanStepPage({ params }: PageProps<"/[lang]/dashboard/business-plan/[step]">) {
  return (
    <Suspense fallback={<GateSkeleton />}>
      <BusinessPlanStepRoute params={params} />
    </Suspense>
  )
}

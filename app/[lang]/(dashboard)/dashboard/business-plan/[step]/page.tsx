import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BUSINESS_PLAN_PAGES, isBusinessPlanPage } from "@/lib/dashboard/routes"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { ProjectGate } from "../../_components/project-gate"
import { BusinessPlanStep } from "./_steps/business-plan-step"

/** Every Business Plan step is prerendered; an unknown step is a 404 (PLAN-DASH-00). */
export function generateStaticParams() {
  return BUSINESS_PLAN_PAGES.map((step) => ({ step }))
}

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/business-plan/[step]">): Promise<Metadata> {
  const { lang, step } = await params
  if (!isBusinessPlanPage(step)) return {}
  const shell = await getDictionary(requireLocale(lang), "shell")
  return { title: `${shell.nav.items.businessPlan[step]} · ${shell.nav.sections.businessPlan}` }
}

/** A Business Plan step BM-STEP-01..04 (phase 10): a static shell; the project is read on the client only. */
export default async function BusinessPlanStepPage({ params }: PageProps<"/[lang]/dashboard/business-plan/[step]">) {
  const { lang, step } = await params
  requireLocale(lang)
  if (!isBusinessPlanPage(step)) notFound()

  return (
    <ProjectGate module="businessPlan">
      <BusinessPlanStep step={step} />
    </ProjectGate>
  )
}

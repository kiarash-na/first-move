import { notFound } from "next/navigation"

import { isBusinessPlanPage } from "@/lib/dashboard/routes"
import { requireLocale } from "@/lib/i18n/require-locale"
import { ProjectGate } from "../../../_components/project-gate"
import { BusinessPlanStep } from "../_steps/business-plan-step"

/**
 * The URL-specific part of a Business Plan page: reads the step inside the page's `<Suspense>`
 * so the route's App Shell stays URL-independent. An unknown step is a 404.
 */
export async function BusinessPlanStepRoute({ params }: Pick<PageProps<"/[lang]/dashboard/business-plan/[step]">, "params">) {
  const { lang, step } = await params
  requireLocale(lang)
  if (!isBusinessPlanPage(step)) notFound()

  return (
    <ProjectGate module="businessPlan">
      <BusinessPlanStep step={step} />
    </ProjectGate>
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isQuickCheckPage, QUICK_CHECK_PAGES } from "@/lib/dashboard/routes"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { PageHeader } from "../../_components/page-header"
import { ProjectGate } from "../../_components/project-gate"
import { ResultsView } from "./_results/results-view"
import { StepView } from "./_steps/step-view"

/** Every Quick Check page is prerendered; an unknown step is a 404 (PLAN-DASH-00). */
export function generateStaticParams() {
  return QUICK_CHECK_PAGES.map((step) => ({ step }))
}

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/quick-check/[step]">): Promise<Metadata> {
  const { lang, step } = await params
  if (!isQuickCheckPage(step)) return {}
  const shell = await getDictionary(requireLocale(lang), "shell")
  return { title: `${shell.nav.items.quickCheck[step]} · ${shell.nav.sections.quickCheck}` }
}

/**
 * A Quick Check input step (QCT-IN-00..09) or the results (QCT-KF-*). The header is static;
 * the inputs and the live result read the project on the client inside the gate.
 */
export default async function QuickCheckStepPage({ params }: PageProps<"/[lang]/dashboard/quick-check/[step]">) {
  const { lang, step } = await params
  const locale = requireLocale(lang)
  if (!isQuickCheckPage(step)) notFound()
  const [shell, quickCheck] = await Promise.all([getDictionary(locale, "shell"), getDictionary(locale, "quick-check")])
  const index = QUICK_CHECK_PAGES.indexOf(step)
  const results = step === "results"
  const eyebrow = results ? shell.nav.sections.quickCheck : `${shell.nav.sections.quickCheck} · ${String(index + 1).padStart(2, "0")}`

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={eyebrow}
        title={results ? quickCheck.ui.results.title : shell.nav.items.quickCheck[step]}
        description={results ? undefined : quickCheck.ui.intro[step]}
        tone="cool"
      />
      <ProjectGate module="quickCheck">{results ? <ResultsView /> : <StepView step={step} />}</ProjectGate>
    </div>
  )
}

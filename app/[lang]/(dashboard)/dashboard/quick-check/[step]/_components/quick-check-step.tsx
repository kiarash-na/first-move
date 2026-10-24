import { notFound } from "next/navigation"

import { isQuickCheckPage, QUICK_CHECK_PAGES } from "@/lib/dashboard/routes"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { PageHeader } from "../../../_components/page-header"
import { ProjectGate } from "../../../_components/project-gate"
import { ResultsView } from "../_results/results-view"
import { StepView } from "../_steps/step-view"

/**
 * The URL-specific part of a Quick Check page: reads the step inside the page's `<Suspense>`
 * so the route's App Shell stays URL-independent (adopting-partial-prefetching guide).
 * An unknown step is a 404.
 */
export async function QuickCheckStep({ params }: Pick<PageProps<"/[lang]/dashboard/quick-check/[step]">, "params">) {
  const { lang, step } = await params
  const locale = requireLocale(lang)
  if (!isQuickCheckPage(step)) notFound()
  const [shell, quickCheck] = await Promise.all([getDictionary(locale, "shell"), getDictionary(locale, "quick-check")])
  const index = QUICK_CHECK_PAGES.indexOf(step)
  const results = step === "results"
  const eyebrow = results ? shell.nav.sections.quickCheck : `${shell.nav.sections.quickCheck} · ${String(index + 1).padStart(2, "0")}`

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={results ? quickCheck.ui.results.title : shell.nav.items.quickCheck[step]}
        description={results ? undefined : quickCheck.ui.intro[step]}
        tone="cool"
      />
      <ProjectGate module="quickCheck">{results ? <ResultsView /> : <StepView step={step} />}</ProjectGate>
    </>
  )
}

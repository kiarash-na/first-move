import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isQuickCheckPage, QUICK_CHECK_PAGES } from "@/lib/dashboard/routes"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { STEP_EXPLAIN } from "@/lib/quick-check"
import { PlaceholderPage } from "../../_components/placeholder-page"
import { ProjectGate } from "../../_components/project-gate"

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

/** A Quick Check step or the results (phase 08 fills them in). Each input step lists its equations (D-33). */
export default async function QuickCheckStepPage({ params }: PageProps<"/[lang]/dashboard/quick-check/[step]">) {
  const { lang, step } = await params
  const locale = requireLocale(lang)
  if (!isQuickCheckPage(step)) notFound()
  const shell = await getDictionary(locale, "shell")
  const index = QUICK_CHECK_PAGES.indexOf(step)
  const eyebrow = step === "results" ? shell.nav.sections.quickCheck : `${shell.nav.sections.quickCheck} · ${String(index + 1).padStart(2, "0")}`

  return (
    <ProjectGate module="quickCheck">
      <PlaceholderPage
        eyebrow={eyebrow}
        title={shell.nav.items.quickCheck[step]}
        tone="cool"
        explain={step === "results" ? undefined : STEP_EXPLAIN[step]}
      />
    </ProjectGate>
  )
}

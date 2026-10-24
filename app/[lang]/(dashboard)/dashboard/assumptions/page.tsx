import type { Metadata } from "next"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { STEP_EXPLAIN } from "@/lib/quick-check"
import { PlaceholderPage } from "../_components/placeholder-page"
import { ProjectGate } from "../_components/project-gate"

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/assumptions">): Promise<Metadata> {
  const shell = await getDictionary(requireLocale((await params).lang), "shell")
  return { title: shell.nav.items.assumptions }
}

/** Defaults, OQ answers and the parameter playground (D-10); phase 08 fills it in. */
export default async function AssumptionsPage({ params }: PageProps<"/[lang]/dashboard/assumptions">) {
  const shell = await getDictionary(requireLocale((await params).lang), "shell")
  return (
    <ProjectGate module="quickCheck">
      <PlaceholderPage
        eyebrow={shell.nav.sections.quickCheck}
        title={shell.nav.items.assumptions}
        tone="cool"
        explain={STEP_EXPLAIN.assumptions}
      />
    </ProjectGate>
  )
}

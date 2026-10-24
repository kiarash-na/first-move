import type { Metadata } from "next"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { PlaceholderPage } from "../_components/placeholder-page"
import { ProjectGate } from "../_components/project-gate"
import { ModuleMap } from "./_components/module-map"

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/overview">): Promise<Metadata> {
  const shell = await getDictionary(requireLocale((await params).lang), "shell")
  return { title: shell.nav.items.overview }
}

/** The project overview (D-06). Phase 09 builds it; until then a map of the module steps. */
export default async function OverviewPage({ params }: PageProps<"/[lang]/dashboard/overview">) {
  const shell = await getDictionary(requireLocale((await params).lang), "shell")
  return (
    <ProjectGate>
      <PlaceholderPage eyebrow={shell.nav.sections.project} title={shell.nav.items.overview}>
        <ModuleMap />
      </PlaceholderPage>
    </ProjectGate>
  )
}

import type { Metadata } from "next"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { I18nProvider } from "../_components/i18n-provider"
import { ProjectGate } from "../_components/project-gate"
import { OverviewView } from "./_components/overview-view"

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/overview">): Promise<Metadata> {
  const overview = await getDictionary(requireLocale((await params).lang), "overview")
  return { title: overview.meta.title }
}

/**
 * The project overview (D-06, PLAN-DASH-09). The shell is static; the project is read on the
 * client once the store is ready, behind the gate's skeleton. The charts are separate chunks.
 */
export default async function OverviewPage({ params }: PageProps<"/[lang]/dashboard/overview">) {
  const lang = requireLocale((await params).lang)
  const overview = await getDictionary(lang, "overview")

  return (
    <I18nProvider lang={lang} dictionaries={{ overview }}>
      <ProjectGate>
        <OverviewView />
      </ProjectGate>
    </I18nProvider>
  )
}

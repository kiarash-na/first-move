import type { Metadata } from "next"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { I18nProvider } from "../_components/i18n-provider"
import { PageHeader } from "../_components/page-header"
import { ProjectGate } from "../_components/project-gate"
import { AssumptionsView } from "./_components/assumptions-view"

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/assumptions">): Promise<Metadata> {
  const shell = await getDictionary(requireLocale((await params).lang), "shell")
  return { title: shell.nav.items.assumptions }
}

/** Defaults TBL-1..6, the OQ answers in use and the parameter playground (D-10, QCT-REF-1.1). */
export default async function AssumptionsPage({ params }: PageProps<"/[lang]/dashboard/assumptions">) {
  const lang = requireLocale((await params).lang)
  const [shell, assumptions] = await Promise.all([getDictionary(lang, "shell"), getDictionary(lang, "assumptions")])
  return (
    <I18nProvider lang={lang} dictionaries={{ assumptions }}>
      <div className="flex flex-col gap-8">
        <PageHeader eyebrow={shell.nav.sections.quickCheck} title={shell.nav.items.assumptions} description={assumptions.lead} tone="cool" />
        <ProjectGate module="quickCheck">
          <AssumptionsView />
        </ProjectGate>
      </div>
    </I18nProvider>
  )
}

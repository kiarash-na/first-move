import type { Metadata } from "next"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { I18nProvider } from "../_components/i18n-provider"
import { ProjectGate } from "../_components/project-gate"
import { ReportView } from "./_components/report-view"

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/report">): Promise<Metadata> {
  const report = await getDictionary(requireLocale((await params).lang), "report")
  return { title: report.meta.title }
}

/**
 * The report of the open project (D-09, D-70). The shell is static; the project is read on the
 * client once the store is ready, behind the gate's skeleton, like every dashboard page.
 */
export default async function ReportPage({ params }: PageProps<"/[lang]/dashboard/report">) {
  const lang = requireLocale((await params).lang)
  const [report, assumptions] = await Promise.all([getDictionary(lang, "report"), getDictionary(lang, "assumptions")])

  return (
    <I18nProvider lang={lang} dictionaries={{ report, assumptions }}>
      <ProjectGate>
        <ReportView />
      </ProjectGate>
    </I18nProvider>
  )
}

import type { Metadata } from "next"

import { exampleCards } from "@/lib/dashboard/example-cards"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { I18nProvider } from "./_components/i18n-provider"
import { StartScreen } from "./_start/start-screen"

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard">): Promise<Metadata> {
  const start = await getDictionary(requireLocale((await params).lang), "start")
  return { title: start.meta.title }
}

/**
 * The start screen (D-03). The example verdicts come from the real engine at build time
 * (`run()` on each example's inputs), so the static shell already shows them.
 */
export default async function DashboardPage({ params }: PageProps<"/[lang]/dashboard">) {
  const lang = requireLocale((await params).lang)
  const start = await getDictionary(lang, "start")

  return (
    <I18nProvider lang={lang} dictionaries={{ start }}>
      <StartScreen examples={exampleCards(lang)} />
    </I18nProvider>
  )
}

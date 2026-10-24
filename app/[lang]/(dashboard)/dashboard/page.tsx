import type { Metadata } from "next"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { StartPlaceholder } from "./_start/start-placeholder"

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard">): Promise<Metadata> {
  const start = await getDictionary(requireLocale((await params).lang), "start")
  return { title: start.placeholder.metaTitle }
}

/** Start screen. Phase 01 shows a placeholder; phase 07 builds the real start screen. */
export default async function DashboardPage({ params }: PageProps<"/[lang]/dashboard">) {
  const lang = requireLocale((await params).lang)
  const [common, start] = await Promise.all([getDictionary(lang, "common"), getDictionary(lang, "start")])

  return <StartPlaceholder lang={lang} common={common} copy={start.placeholder} />
}

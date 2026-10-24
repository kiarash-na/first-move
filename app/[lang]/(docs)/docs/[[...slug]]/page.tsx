import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { ComingSoon } from "../../_components/coming-soon"

/** Only the docs index exists for now; content pages come later (D-22). */
export function generateStaticParams() {
  return [{ slug: [] }]
}

export async function generateMetadata({ params }: PageProps<"/[lang]/docs/[[...slug]]">): Promise<Metadata> {
  const common = await getDictionary(requireLocale((await params).lang), "common")
  return { title: common.docs.metaTitle }
}

export default async function DocsPage({ params }: PageProps<"/[lang]/docs/[[...slug]]">) {
  const { lang: rawLang, slug } = await params
  const lang = requireLocale(rawLang)
  if (slug?.length) notFound()

  const common = await getDictionary(lang, "common")
  return <ComingSoon lang={lang} copy={common.docs} />
}

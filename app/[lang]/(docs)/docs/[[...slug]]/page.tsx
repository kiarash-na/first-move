import type { Metadata } from "next"
import { lang as rootLang } from "next/root-params"
import { Suspense } from "react"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { ComingSoon } from "../../_components/coming-soon"
import { DocsSlugGuard } from "./_components/docs-slug-guard"

/** Only the docs index exists for now; content pages come later (D-22). */
export function generateStaticParams() {
  return [{ slug: [] }]
}

/** Waits for the complete static page, so an unknown slug answers 404 instead of a 200 shell. */
export const ensureStatic = "navigation"

export async function generateMetadata({ params }: PageProps<"/[lang]/docs/[[...slug]]">): Promise<Metadata> {
  const common = await getDictionary(requireLocale((await params).lang), "common")
  return { title: common.docs.metaTitle }
}

/**
 * The docs index. The language is a root param, so the page itself stays URL-independent; only
 * the slug check reads `params`, inside `<Suspense>` (adopting-partial-prefetching guide).
 */
export default async function DocsPage({ params }: PageProps<"/[lang]/docs/[[...slug]]">) {
  const lang = requireLocale(await rootLang())
  const common = await getDictionary(lang, "common")

  return (
    <>
      <ComingSoon lang={lang} copy={common.docs} />
      <Suspense>
        <DocsSlugGuard params={params} />
      </Suspense>
    </>
  )
}

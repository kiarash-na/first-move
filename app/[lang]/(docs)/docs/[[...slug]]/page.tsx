import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { docFromParam, docSegments, visibleDocs } from "@/lib/docs/pages"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { AI_FEATURES_LIVE } from "@/lib/legal/ai"
import { DocsArticle } from "./_components/docs-article"
import { DocsNav } from "./_components/docs-nav"

/** Every visible docs page in every language; the AI pages only while the AI features are live. */
export function generateStaticParams() {
  return visibleDocs(AI_FEATURES_LIVE).map((slug) => ({ slug: docSegments(slug) }))
}

/** Waits for the complete static page, so an unknown slug answers 404 instead of a 200 shell. */
export const ensureStatic = "navigation"

/**
 * The page reads its slug before it renders, on purpose: inside a `<Suspense>` boundary React
 * streams an article above its progressive chunk size (12,800 bytes) out of order, hidden until a
 * script runs. Every page is prerendered whole, so a navigation waits only for static output.
 */
export const instant = false

export async function generateMetadata({ params }: PageProps<"/[lang]/docs/[[...slug]]">): Promise<Metadata> {
  const { lang, slug } = await params
  const docs = await getDictionary(requireLocale(lang), "docs")
  const page = docFromParam(slug, AI_FEATURES_LIVE)
  return page ? { title: docs.pages[page].title, description: docs.pages[page].description } : {}
}

/**
 * The public docs (D-22, PLAN-AGENT-04): the page list and one article. An unknown slug, and the
 * AI pages while the AI features are off, answer 404.
 */
export default async function DocsPage({ params }: PageProps<"/[lang]/docs/[[...slug]]">) {
  const { lang: rawLang, slug: segments } = await params
  const lang = requireLocale(rawLang)
  const slug = docFromParam(segments, AI_FEATURES_LIVE)
  if (!slug) notFound()
  const docs = await getDictionary(lang, "docs")

  return (
    <main className="mx-auto w-full max-w-content flex-1 px-[clamp(20px,3.2vw,52px)] py-12 sm:py-15">
      <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <DocsNav lang={lang} current={slug} copy={docs} live={AI_FEATURES_LIVE} />
        <DocsArticle slug={slug} lang={lang} copy={docs} live={AI_FEATURES_LIVE} />
      </div>
    </main>
  )
}

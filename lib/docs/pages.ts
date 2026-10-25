import type { Locale } from "@/lib/i18n/locales"
import { AI_FEATURES_LIVE } from "@/lib/legal/ai"

/**
 * The public docs pages (PLAN-AGENT-04, D-22, D-57), in reading order. The slug is the URL
 * segment (`/en/docs/quick-check`) and the file name in `content/docs/<lang>/`; the index lives
 * at `/docs`. The two AI pages exist only while the AI features are live (`lib/legal/ai.ts`); the
 * AI Plan Score is live on its own (D-72), so its page is always visible.
 */
export const DOC_PAGES = [
  { slug: "index", ai: false },
  { slug: "what-is-5gdhc", ai: false },
  { slug: "quick-check", ai: false },
  { slug: "business-plan", ai: false },
  { slug: "ai-plan-score", ai: false },
  { slug: "reference-cases", ai: false },
  { slug: "assistant", ai: true },
  { slug: "email-agent", ai: true },
  { slug: "data-and-privacy", ai: false },
] as const

export type DocSlug = (typeof DOC_PAGES)[number]["slug"]

export const DOC_SLUGS: readonly DocSlug[] = DOC_PAGES.map((page) => page.slug)

/** The pages about the AI features, hidden (404) until they go live. */
export const AI_DOC_SLUGS: readonly DocSlug[] = DOC_PAGES.filter((page) => page.ai).map((page) => page.slug)

export function isDocSlug(value: unknown): value is DocSlug {
  return typeof value === "string" && (DOC_SLUGS as readonly string[]).includes(value)
}

/** The pages a visitor can open: every page once the AI features are live, else the others. */
export function visibleDocs(live: boolean = AI_FEATURES_LIVE): DocSlug[] {
  return DOC_PAGES.filter((page) => live || !page.ai).map((page) => page.slug)
}

/**
 * The page of a `[[...slug]]` param: no segment is the index, one visible slug is that page,
 * anything else (`index` itself, a hidden or unknown slug, more segments) is null, a 404.
 */
export function docFromParam(segments: readonly string[] | undefined, live: boolean = AI_FEATURES_LIVE): DocSlug | null {
  if (!segments || segments.length === 0) return "index"
  if (segments.length > 1 || segments[0] === "index") return null
  return visibleDocs(live).find((slug) => slug === segments[0]) ?? null
}

/** The `[[...slug]]` segments of a page, for `generateStaticParams`: none for the index. */
export function docSegments(slug: DocSlug): string[] {
  return slug === "index" ? [] : [slug]
}

/** The path of a page in a language: `/en/docs`, `/de/docs/quick-check`. */
export function docHref(lang: Locale, slug: DocSlug): string {
  return slug === "index" ? `/${lang}/docs` : `/${lang}/docs/${slug}`
}

/** The visible pages before and after a page, for the pager. */
export function docNeighbours(slug: DocSlug, live: boolean = AI_FEATURES_LIVE): { previous: DocSlug | null; next: DocSlug | null } {
  const pages = visibleDocs(live)
  const index = pages.indexOf(slug)
  if (index === -1) return { previous: null, next: null }
  return { previous: pages[index - 1] ?? null, next: pages[index + 1] ?? null }
}

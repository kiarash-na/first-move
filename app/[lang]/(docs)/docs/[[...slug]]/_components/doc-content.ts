import type { MDXContent } from "mdx/types"

import type { DocSlug } from "@/lib/docs/pages"
import type { Locale } from "@/lib/i18n/locales"

type Loader = () => Promise<{ default: MDXContent }>

/**
 * The MDX file of every page and language, imported on demand (MDX guide, "Using dynamic
 * imports"). English is complete, and every page has its German translation (D-32). German stays
 * partial by type: a page added in English without a German file shows the English page with a
 * note on German routes until its loader is added here.
 */
export const DOC_CONTENT: { en: Record<DocSlug, Loader>; de: Partial<Record<DocSlug, Loader>> } = {
  en: {
    index: () => import("@/content/docs/en/index.mdx"),
    "what-is-5gdhc": () => import("@/content/docs/en/what-is-5gdhc.mdx"),
    "quick-check": () => import("@/content/docs/en/quick-check.mdx"),
    "business-plan": () => import("@/content/docs/en/business-plan.mdx"),
    "ai-plan-score": () => import("@/content/docs/en/ai-plan-score.mdx"),
    "reference-cases": () => import("@/content/docs/en/reference-cases.mdx"),
    assistant: () => import("@/content/docs/en/assistant.mdx"),
    "email-agent": () => import("@/content/docs/en/email-agent.mdx"),
    "data-and-privacy": () => import("@/content/docs/en/data-and-privacy.mdx"),
  },
  de: {
    index: () => import("@/content/docs/de/index.mdx"),
    "what-is-5gdhc": () => import("@/content/docs/de/what-is-5gdhc.mdx"),
    "quick-check": () => import("@/content/docs/de/quick-check.mdx"),
    "business-plan": () => import("@/content/docs/de/business-plan.mdx"),
    "ai-plan-score": () => import("@/content/docs/de/ai-plan-score.mdx"),
    "reference-cases": () => import("@/content/docs/de/reference-cases.mdx"),
    assistant: () => import("@/content/docs/de/assistant.mdx"),
    "email-agent": () => import("@/content/docs/de/email-agent.mdx"),
    "data-and-privacy": () => import("@/content/docs/de/data-and-privacy.mdx"),
  },
}

/** The language a page is shown in: its own when it exists, else English. */
export function contentLanguage(slug: DocSlug, lang: Locale): Locale {
  return DOC_CONTENT[lang][slug] ? lang : "en"
}

/** Loads the MDX content of a page in the language it is shown in. */
export async function loadDocContent(slug: DocSlug, lang: Locale): Promise<{ Content: MDXContent; lang: Locale }> {
  const shown = contentLanguage(slug, lang)
  const loader = DOC_CONTENT[shown][slug] ?? DOC_CONTENT.en[slug]
  return { Content: (await loader()).default, lang: shown }
}

import type { MetadataRoute } from "next"

import { visibleDocs } from "@/lib/docs/pages"
import { LOCALES, type Locale } from "@/lib/i18n/locales"
import { AI_FEATURES_LIVE } from "@/lib/legal/ai"
import { localizedLanguages, localizedUrl } from "@/lib/seo/metadata"

/** The legal routes; the slug equals the single path segment for all six (PLAN-DASH-12). */
const LEGAL_PATHS = ["/imprint", "/privacy", "/terms", "/cookies", "/license", "/ai"] as const

/**
 * sitemap.xml: every public page in every locale, each row naming its hreflang alternates. The
 * dashboard, the consent-confirm page and the API are absent on purpose; the unprefixed root only
 * redirects, so only the locale URLs are listed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const docsPaths = visibleDocs(AI_FEATURES_LIVE).map((slug) => (slug === "index" ? "/docs" : `/docs/${slug}`))
  const rows: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    ...docsPaths.map((path) => ({ path, priority: path === "/docs" ? 0.8 : 0.7 })),
    { path: "/presentation", priority: 0.5 },
    ...LEGAL_PATHS.map((path) => ({ path, priority: 0.2 })),
  ]
  return LOCALES.flatMap((lang) => rows.map((row) => entry(lang, row.path, row.priority)))
}

function entry(lang: Locale, path: string, priority: number): MetadataRoute.Sitemap[number] {
  return { url: localizedUrl(lang, path), priority, alternates: { languages: localizedLanguages(path) } }
}

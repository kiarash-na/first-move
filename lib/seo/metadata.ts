import type { Metadata } from "next"

import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n/locales"
import { siteUrl } from "./site"

/** Absolute URL of a public path in one locale: ("de", "/docs") → "https://www.firstmove.energy/de/docs". */
export function localizedUrl(lang: Locale, path: string): string {
  return `${siteUrl()}/${lang}${path}`
}

/**
 * hreflang targets of a public path: every locale, plus x-default at the default language — the
 * unprefixed URL only redirects (D-67), so it cannot be the x-default target itself.
 */
export function localizedLanguages(path: string): Record<string, string> {
  return Object.fromEntries([...LOCALES.map((lang) => [lang, localizedUrl(lang, path)]), ["x-default", localizedUrl(DEFAULT_LOCALE, path)]])
}

/** Canonical and hreflang links of a public page (D-19): the page itself, in its own language. */
export function localizedAlternates(lang: Locale, path: string): Metadata["alternates"] {
  return { canonical: localizedUrl(lang, path), languages: localizedLanguages(path) }
}

/**
 * The metadata every public page shares: metadataBase so relative image URLs resolve, the
 * canonical and hreflang links, and the Open Graph and Twitter card shells. og:title and
 * og:description stay unset on purpose — Next inherits them from the page's title (template
 * applied) and description, and the Twitter card inherits its image from Open Graph.
 * The image is referenced explicitly: the opengraph-image file convention does not attach to
 * pages across the route groups of the multiple root layouts, so its URL is named here.
 */
export function publicMetadata(lang: Locale, path: string, siteName: string): Metadata {
  return {
    metadataBase: new URL(siteUrl()),
    alternates: localizedAlternates(lang, path),
    openGraph: {
      type: "website",
      siteName,
      url: localizedUrl(lang, path),
      locale: lang === "de" ? "de_DE" : "en_US",
      alternateLocale: lang === "de" ? "en_US" : "de_DE",
      images: [{ url: `/${lang}/opengraph-image`, width: 1200, height: 630, alt: siteName }],
    },
    twitter: { card: "summary_large_image" },
  }
}

import { LOCALES, type Locale } from "@/lib/i18n/locales"
import { localizedUrl } from "@/lib/seo/metadata"

/**
 * Structured data of the landing (schema.org WebApplication): what First Move is, free, in the
 * browser, in both languages. The text comes from the dictionaries like every visible text.
 */
export function JsonLd({ lang, name, slogan, description }: { lang: Locale; name: string; slogan: string; description: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    alternateName: slogan,
    url: localizedUrl(lang, ""),
    description,
    inLanguage: [...LOCALES],
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
}

import type { MetadataRoute } from "next"

import { LOCALES } from "@/lib/i18n/locales"
import { siteUrl } from "@/lib/seo/site"

/** App and endpoint paths a crawler has no business with, per locale where the path is localized. */
const PRIVATE_LOCALIZED = ["/dashboard", "/mail/confirm"] as const

/**
 * robots.txt: the public pages are crawlable; the dashboard (a client-side app whose data lives
 * in the visitor's browser), the consent-confirm endpoint and the API are not crawled. The
 * dashboard pages also carry a noindex meta tag, which covers links a crawler cannot see here.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...LOCALES.flatMap((lang) => PRIVATE_LOCALIZED.map((path) => `/${lang}${path}`)), "/api/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}

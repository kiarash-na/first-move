import type { Metadata } from "next"
import "@fontsource-variable/archivo/wdth.css"
import "@fontsource/ibm-plex-mono/latin-400.css"
import "./globals.css"

import { NotFoundView } from "@/components/not-found/not-found-view"
import { buttonVariants } from "@/components/ui/button"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/locales"

export async function generateMetadata(): Promise<Metadata> {
  const common = await getDictionary(DEFAULT_LOCALE, "common")
  return { title: `${common.notFound.title} · ${common.app.name}` }
}

/**
 * 404 for URLs no route matches (several root layouts, so no shared not-found).
 * It bypasses every layout, so it imports the styles and sets the dark theme itself.
 * There is no locale here: copy in the default language (D-67), with a link to both language start pages.
 */
export default async function GlobalNotFound() {
  const common = await getDictionary(DEFAULT_LOCALE, "common")

  return (
    <html lang={DEFAULT_LOCALE} data-theme="dark">
      <body className="flex min-h-dvh flex-col">
        <NotFoundView copy={common.notFound}>
          {LOCALES.map((locale) => (
            <a
              key={locale}
              href={`/${locale}`}
              hrefLang={locale}
              lang={locale}
              className={buttonVariants({ variant: "secondary" })}
            >
              {common.notFound.home} · {common.language.names[locale]}
            </a>
          ))}
        </NotFoundView>
      </body>
    </html>
  )
}

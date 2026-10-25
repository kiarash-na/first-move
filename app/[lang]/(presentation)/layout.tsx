import type { Metadata, Viewport } from "next"
import "@fontsource-variable/archivo/wdth.css"
import "@fontsource-variable/archivo/wdth-italic.css"
import "@fontsource/ibm-plex-mono/latin-400.css"
import "../../globals.css"

import { CookieNotice } from "@/components/cookie-notice/cookie-notice"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localeParams } from "@/lib/i18n/locales"
import { requireLocale } from "@/lib/i18n/require-locale"
import { DeckBootScript } from "./_components/deck-boot-script"

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const common = await getDictionary(requireLocale((await params).lang), "common")
  return { title: { default: common.app.name, template: `%s · ${common.app.name}` }, description: common.app.slogan }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070b0e",
}

export function generateStaticParams() {
  return localeParams()
}

/**
 * Root layout of the presentation (PLAN-PRESENTATION-00): always dark like the landing, no site
 * header; the deck brings its own small bar. The boot script turns the stacked slides into a deck
 * before paint.
 */
export default async function PresentationLayout({ children, params }: LayoutProps<"/[lang]">) {
  const lang = requireLocale((await params).lang)
  const legal = await getDictionary(lang, "legal")

  return (
    <html lang={lang} data-theme="dark" suppressHydrationWarning>
      <head>
        <DeckBootScript />
      </head>
      <body>
        {children}
        <CookieNotice lang={lang} copy={legal.cookieNotice} />
      </body>
    </html>
  )
}

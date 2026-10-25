import type { Metadata, Viewport } from "next"
import "@fontsource-variable/archivo/wdth.css"
import "@fontsource-variable/archivo/wdth-italic.css"
import "@fontsource/ibm-plex-mono/latin-400.css"
import "../../globals.css"

import { CookieNotice } from "@/components/cookie-notice/cookie-notice"
import { ThemeScript } from "@/components/theme/theme-script"
import { ThemeSync } from "@/components/theme/theme-sync"
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

/** The cookie notice sits above the deck's bottom bar, so it never covers the slide select or the arrows. */
const NOTICE_ABOVE_DECK_BAR = "bottom-[calc(max(14px,env(safe-area-inset-bottom))_+_60px)]"

/**
 * Root layout of the presentation (PLAN-PRESENTATION-00): dark by default like the landing, but
 * with the light/dark switch in the deck's bar (owner, 2026-10-25) — the theme script applies the
 * stored choice before paint, so the static HTML stays dark and hydration matches. No site
 * header; the deck brings its own small bar. The boot script turns the stacked slides into a deck
 * before paint.
 */
export default async function PresentationLayout({ children, params }: LayoutProps<"/[lang]">) {
  const lang = requireLocale((await params).lang)
  const legal = await getDictionary(lang, "legal")

  return (
    <html lang={lang} data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <DeckBootScript />
      </head>
      <body>
        <ThemeSync />
        {children}
        <CookieNotice lang={lang} copy={legal.cookieNotice} className={NOTICE_ABOVE_DECK_BAR} />
      </body>
    </html>
  )
}

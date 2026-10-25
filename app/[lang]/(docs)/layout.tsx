import type { Metadata, Viewport } from "next"
import "@fontsource-variable/archivo/wdth.css"
import "@fontsource-variable/archivo/wdth-italic.css"
import "@fontsource/ibm-plex-mono/latin-400.css"
import "../../globals.css"

import { AppHeader } from "./_components/app-header"
import { ThemeScript } from "@/components/theme/theme-script"
import { CookieNotice } from "@/components/cookie-notice/cookie-notice"
import { SiteFooter } from "@/components/site-footer/site-footer"
import { ThemeSync } from "@/components/theme/theme-sync"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localeParams } from "@/lib/i18n/locales"
import { requireLocale } from "@/lib/i18n/require-locale"
import { siteUrl } from "@/lib/seo/site"

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const common = await getDictionary(requireLocale((await params).lang), "common")
  return {
    // metadataBase only: each docs and legal page sets its own canonical, hreflang and cards.
    metadataBase: new URL(siteUrl()),
    title: { default: common.docs.metaTitle, template: `%s · ${common.app.name}` },
    description: common.app.slogan,
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export function generateStaticParams() {
  return localeParams()
}

/** Root layout of the public MDX docs (D-22) and the legal pages. Dark by default, light/dark toggle (D-16). */
export default async function DocsRootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const lang = requireLocale((await params).lang)
  const [common, legal] = await Promise.all([getDictionary(lang, "common"), getDictionary(lang, "legal")])

  return (
    <html lang={lang} data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeSync />
        <div className="flex min-h-dvh flex-col">
          <AppHeader lang={lang} common={common} />
          {children}
          <SiteFooter lang={lang} copy={legal} />
        </div>
        <CookieNotice lang={lang} copy={legal.cookieNotice} />
      </body>
    </html>
  )
}

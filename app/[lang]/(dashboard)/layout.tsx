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
import { SidebarScript } from "./_components/sidebar-script"

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const common = await getDictionary(requireLocale((await params).lang), "common")
  return {
    title: { default: common.app.name, template: `%s · ${common.app.name}` },
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

/**
 * Root layout of the app. Dark by default; the stored light/dark choice (D-16) and a collapsed
 * sidebar rail (D-59) apply before paint.
 */
export default async function DashboardRootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const lang = requireLocale((await params).lang)
  const legal = await getDictionary(lang, "legal")

  return (
    <html lang={lang} data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <SidebarScript />
      </head>
      <body>
        <ThemeSync />
        {children}
        {/* Offset past the sidebar (md and up; 18rem, or the 4rem rail) so the notice never covers its privacy note. */}
        <CookieNotice lang={lang} copy={legal.cookieNotice} className="md:left-[calc(var(--sidebar-width)_+_1rem)]" />
      </body>
    </html>
  )
}

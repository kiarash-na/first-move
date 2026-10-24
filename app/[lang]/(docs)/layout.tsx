import type { Metadata, Viewport } from "next"
import "@fontsource-variable/archivo/wdth.css"
import "@fontsource/instrument-serif/400-italic.css"
import "@fontsource/ibm-plex-mono/latin-400.css"
import "../../globals.css"

import { AppHeader } from "./_components/app-header"
import { ThemeScript } from "@/components/theme/theme-script"
import { ThemeSync } from "@/components/theme/theme-sync"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localeParams } from "@/lib/i18n/locales"
import { requireLocale } from "@/lib/i18n/require-locale"

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const common = await getDictionary(requireLocale((await params).lang), "common")
  return {
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

/** Root layout of the public MDX docs (D-22). Dark by default, light/dark toggle (D-16). */
export default async function DocsRootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const lang = requireLocale((await params).lang)
  const common = await getDictionary(lang, "common")

  return (
    <html lang={lang} data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeSync />
        <div className="flex min-h-dvh flex-col">
          <AppHeader lang={lang} common={common} />
          {children}
        </div>
      </body>
    </html>
  )
}

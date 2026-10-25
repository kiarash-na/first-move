import type { Metadata, Viewport } from "next"
import "@fontsource-variable/archivo/wdth.css"
import "@fontsource/ibm-plex-mono/latin-400.css"
import "../../globals.css"

import { CookieNotice } from "@/components/cookie-notice/cookie-notice"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localeParams } from "@/lib/i18n/locales"
import { requireLocale } from "@/lib/i18n/require-locale"
import { publicMetadata } from "@/lib/seo/metadata"

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const lang = requireLocale((await params).lang)
  const [{ meta }, common] = await Promise.all([getDictionary(lang, "landing"), getDictionary(lang, "common")])
  return { title: meta.title, description: meta.description, ...publicMetadata(lang, "", common.app.name) }
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

/** Root layout of the landing page: always dark (D-16), no theme script. */
export default async function WebsiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const lang = requireLocale((await params).lang)
  const legal = await getDictionary(lang, "legal")

  return (
    <html lang={lang} data-theme="dark" data-scroll-behavior="smooth">
      <body>
        {children}
        <CookieNotice lang={lang} copy={legal.cookieNotice} />
      </body>
    </html>
  )
}

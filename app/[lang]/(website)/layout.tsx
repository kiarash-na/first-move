import type { Metadata, Viewport } from "next"
import "@fontsource-variable/archivo/wdth.css"
import "@fontsource/instrument-serif/400-italic.css"
import "@fontsource/ibm-plex-mono/latin-400.css"
import "../../globals.css"

import { localeParams } from "@/lib/i18n/locales"
import { requireLocale } from "@/lib/i18n/require-locale"

// Landing copy and metadata move to dictionaries/{en,de}/landing.json in phase 02.
export const metadata: Metadata = {
  title: "5GDHC — The Operating System for Shared Energy",
  description:
    "A digital operating system for 5th Generation District Heating and Cooling—from first screening to a viable business model.",
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

  return (
    <html lang={lang} data-theme="dark">
      <body>{children}</body>
    </html>
  )
}

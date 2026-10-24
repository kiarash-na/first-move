import Link from "next/link"
import type * as React from "react"

import { withLocale } from "@/lib/i18n/locale-path"
import type { Locale } from "@/lib/i18n/locales"
import { linkKind } from "@/lib/legal/inline"

const LINK = "text-foreground underline decoration-1 underline-offset-4 hover:text-cool"

/**
 * A link in the docs. Site paths are written without a language (`/docs/quick-check`,
 * `/privacy#email`) and open in the page's language; `#anchor` stays on the page. Any other
 * target than https or mailto stays plain text, like in the legal pages.
 */
export function MdxLink({ href = "", children, lang }: { href?: string; children?: React.ReactNode; lang: Locale }) {
  switch (linkKind(href)) {
    case "internal":
      return (
        <Link href={withLocale(href, lang)} className={LINK}>
          {children}
        </Link>
      )
    case "anchor":
    case "mail":
      return (
        <a href={href} className={LINK}>
          {children}
        </a>
      )
    case "external":
      return (
        <a href={href} className={LINK} rel="noopener noreferrer">
          {children}
        </a>
      )
    default:
      return <>{children}</>
  }
}

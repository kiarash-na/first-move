import Link from "next/link"

import { withLocale } from "@/lib/i18n/locale-path"
import type { Locale } from "@/lib/i18n/locales"
import { LEGAL_DOCS, type LegalLinkLabels } from "@/lib/legal/docs"
import { cn } from "@/lib/utils"

/**
 * The six legal links, as a labelled navigation. Used by the site footer and by the landing
 * footer, so every public page reaches Terms, Privacy, Cookies, Imprint, AI and Licence.
 */
export function LegalLinks({
  lang,
  labels,
  navLabel,
  className,
  linkClassName,
  extra,
}: {
  lang: Locale
  labels: LegalLinkLabels
  navLabel: string
  className?: string
  linkClassName?: string
  /** One more link after the six, e.g. the source code. */
  extra?: { label: string; href: string }
}) {
  const link = cn("inline-flex min-h-11 items-center hover:text-cool", linkClassName)

  return (
    <nav aria-label={navLabel} className={className}>
      <ul className="flex flex-wrap gap-x-5 gap-y-0">
        {LEGAL_DOCS.map((slug) => (
          <li key={slug}>
            <Link href={withLocale(`/${slug}`, lang)} className={link}>
              {labels[slug]}
            </Link>
          </li>
        ))}
        {extra ? (
          <li>
            <a href={extra.href} rel="noopener noreferrer" className={link}>
              {extra.label}
            </a>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}

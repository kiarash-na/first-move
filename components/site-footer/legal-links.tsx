import Link from "next/link"

import { withLocale } from "@/lib/i18n/locale-path"
import type { Locale } from "@/lib/i18n/locales"
import { LEGAL_DOCS, type LegalLinkLabels } from "@/lib/legal/docs"
import { cn } from "@/lib/utils"

/** A link after the six: a path inside the app (`/en/presentation`) or an external address. */
export interface ExtraLink {
  label: string
  href: string
}

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
  /** More links after the six, e.g. the presentation and the source code. */
  extra?: ExtraLink | readonly ExtraLink[]
}) {
  const link = cn("inline-flex min-h-11 items-center hover:text-cool", linkClassName)
  const extras: readonly ExtraLink[] = extra === undefined ? [] : "href" in extra ? [extra] : extra

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
        {extras.map((item) => (
          <li key={item.href}>
            {item.href.startsWith("/") ? (
              <Link href={item.href} prefetch={false} className={link}>
                {item.label}
              </Link>
            ) : (
              <a href={item.href} rel="noopener noreferrer" className={link}>
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

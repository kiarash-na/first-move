"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { writeLocaleCookie } from "@/lib/i18n/locale-cookie"
import { switchLocalePath } from "@/lib/i18n/locale-path"
import { LOCALES, type Locale } from "@/lib/i18n/locales"
import { cn } from "@/lib/utils"

export interface LanguageSwitchProps {
  lang: Locale
  /** Accessible name of the group, e.g. "Language". */
  label: string
  /** Full names; each link's accessible name is its visible code plus the name (WCAG 2.5.3 label in name). */
  names: Record<Locale, string>
  /** Visible short codes, e.g. "EN". */
  short: Record<Locale, string>
  className?: string
  /** Kept on the link, e.g. `#3` so the presentation stays on its slide. */
  hash?: string
}

/** Same page in the other language; remembers the choice in `NEXT_LOCALE` (path `/`, 1 year). */
export function LanguageSwitch({ lang, label, names, short, className, hash = "" }: LanguageSwitchProps) {
  const pathname = usePathname()

  return (
    <nav aria-label={label} className={cn("flex items-center", className)}>
      {LOCALES.map((locale) => {
        const active = locale === lang
        return (
          <Link
            key={locale}
            href={`${switchLocalePath(pathname, locale)}${hash}`}
            hrefLang={locale}
            lang={locale}
            aria-label={`${short[locale]}, ${names[locale]}`}
            aria-current={active ? "true" : undefined}
            onClick={() => writeLocaleCookie(locale)}
            className={cn(
              "relative inline-flex size-11 items-center justify-center font-mono text-xs tracking-[0.06em] uppercase transition-colors duration-[180ms]",
              "after:absolute after:inset-x-2.5 after:bottom-2 after:h-0.5 after:bg-transparent",
              active
                ? "text-foreground after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {short[locale]}
          </Link>
        )
      })}
    </nav>
  )
}

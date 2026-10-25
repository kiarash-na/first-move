import Link from "next/link"
import type * as React from "react"

import { Brand } from "@/components/brand/brand"
import { LanguageSwitch } from "@/components/language-switch/language-switch"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/locales"

/**
 * Minimal top bar of the docs layout: brand, optional actions, the docs link, language switch,
 * theme toggle. The docs link reaches the docs index from every legal page and docs page
 * (PLAN-LANDING-POLISH-00 step b).
 */
export function AppHeader({
  lang,
  common,
  children,
}: {
  lang: Locale
  common: Dictionary<"common">
  children?: React.ReactNode
}) {
  return (
    <header className="mx-auto flex w-full max-w-content items-center justify-between gap-4 border-b px-[clamp(20px,3.2vw,52px)] pt-3.5 pb-3 sm:pt-5 sm:pb-4">
      <Brand href={`/${lang}`} name={common.app.name} label={common.app.homeLabel} />
      <div className="flex items-center gap-2">
        {children}
        <Link
          href={`/${lang}/docs`}
          prefetch={false}
          className="inline-flex min-h-11 items-center px-2.5 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase transition-colors duration-[180ms] hover:text-foreground"
        >
          {common.docs.link}
        </Link>
        <LanguageSwitch
          lang={lang}
          label={common.language.label}
          names={common.language.names}
          short={common.language.short}
        />
        <ThemeToggle labels={common.theme} />
      </div>
    </header>
  )
}

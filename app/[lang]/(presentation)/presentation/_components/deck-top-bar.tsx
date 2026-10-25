"use client"

import { Brand } from "@/components/brand/brand"
import { LanguageSwitch, type LanguageSwitchProps } from "@/components/language-switch/language-switch"
import { ThemeToggle, type ThemeToggleLabels } from "@/components/theme/theme-toggle"
import { withLocale } from "@/lib/i18n/locale-path"
import type { Locale } from "@/lib/i18n/locales"
import { hashForSlide, padSlideNumber } from "@/lib/presentation/slides"
import { useDeck } from "./deck-context"
import { FullscreenButton } from "./fullscreen-button"

export interface DeckTopBarProps {
  lang: Locale
  appName: string
  homeLabel: string
  language: Omit<LanguageSwitchProps, "lang" | "className" | "hash">
  fullscreen: { enterLabel: string; exitLabel: string }
  theme: ThemeToggleLabels
}

/** The deck's own small bar: the mark back to the website, the counter, the language, light/dark, full screen. */
export function DeckTopBar({ lang, appName, homeLabel, language, fullscreen, theme }: DeckTopBarProps) {
  const { index, count } = useDeck()

  return (
    <header className="deck-bar deck-bar--top">
      <Brand href={withLocale("/", lang)} name={appName} label={homeLabel} prefetch={false} className="deck-brand" />
      <div className="deck-bar__end">
        <p className="deck-counter" aria-hidden="true">
          <span className="deck-counter__current">{padSlideNumber(index + 1)}</span>
          <span className="deck-counter__total"> / {padSlideNumber(count)}</span>
        </p>
        <LanguageSwitch lang={lang} {...language} hash={hashForSlide(index)} />
        <ThemeToggle labels={theme} />
        <FullscreenButton {...fullscreen} />
      </div>
    </header>
  )
}

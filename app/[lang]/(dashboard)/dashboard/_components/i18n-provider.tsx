"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"

import type { Area, Dictionary } from "@/lib/i18n/dictionaries"
import { lookup } from "@/lib/i18n/lookup"
import type { Locale } from "@/lib/i18n/locales"
import type { TextRef } from "@/lib/project"

export type Dictionaries = { [A in Area]?: Dictionary<A> }

interface I18nValue {
  lang: Locale
  dictionaries: Dictionaries
}

const I18nContext = createContext<I18nValue | null>(null)

/**
 * Hands the dictionaries a server layout or page loaded to client components (PLAN-DASH-00:
 * never import dictionary JSON in client code). Nested providers add areas to their parent's.
 */
export function I18nProvider({
  lang,
  dictionaries,
  children,
}: {
  lang: Locale
  dictionaries: Dictionaries
  children: ReactNode
}) {
  const parent = useContext(I18nContext)
  const value = useMemo<I18nValue>(
    () => ({ lang, dictionaries: { ...parent?.dictionaries, ...dictionaries } }),
    [lang, parent, dictionaries],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error("I18nProvider is missing")
  return value
}

/** The UI language of the page. */
export function useLocale(): Locale {
  return useI18n().lang
}

/** One dictionary area; the layout or page must have loaded it. */
export function useDictionary<A extends Area>(area: A): Dictionary<A> {
  const dictionary = useI18n().dictionaries[area]
  if (!dictionary) throw new Error(`Dictionary "${area}" is not loaded`)
  return dictionary as Dictionary<A>
}

/** Resolves a registry text reference (`{ area, key }`) to its label, or null when not loaded. */
export function useTextRef(): (ref: TextRef, leaf?: string) => string | null {
  const { dictionaries } = useI18n()
  return (ref, leaf = "label") => lookup(dictionaries[ref.area], `${ref.key}.${leaf}`)
}

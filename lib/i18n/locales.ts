/** Supported UI languages (D-19), in the order of the language switch. */
export const LOCALES = ["en", "de"] as const

export type Locale = (typeof LOCALES)[number]

/** Where an unprefixed URL goes without a saved language, and the language of the global 404 (D-67). */
export const DEFAULT_LOCALE: Locale = "de"

/** The complete language: German is merged over it, so a missing DE key shows English (D-32). */
export const FALLBACK_LOCALE: Locale = "en"

/** Cookie that remembers the chosen language; read by `proxy.ts`, written by the language switch. */
export const LOCALE_COOKIE = "NEXT_LOCALE"

/** One year, in seconds. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** Locale guard: narrows any value to a supported `Locale`. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value)
}

/** Params for every root layout's `generateStaticParams`. */
export function localeParams(): { lang: Locale }[] {
  return LOCALES.map((lang) => ({ lang }))
}

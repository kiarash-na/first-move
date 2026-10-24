/** Supported UI languages (D-19). `en` is the default and the fallback for missing DE keys (D-32). */
export const LOCALES = ["en", "de"] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"

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

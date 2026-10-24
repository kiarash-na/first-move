import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales"

/**
 * Picks the best supported locale from an `Accept-Language` header.
 * Entries are ordered by q-value (stable for ties); `de-AT` matches `de`.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale | null {
  if (!acceptLanguage) return null
  const ranked = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [tag, ...params] = entry.trim().split(";")
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="))
      const q = qParam ? Number(qParam.slice(2)) : 1
      return { base: tag.trim().toLowerCase().split("-")[0], q: Number.isFinite(q) ? q : 0, index }
    })
    .filter((entry) => entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
  const match = ranked.find((entry) => isLocale(entry.base))
  return match ? (match.base as Locale) : null
}

/** Redirect choice for unprefixed paths: cookie, then browser language, else EN (PLAN-DASH-00). */
export function pickLocale(input: {
  cookie?: string | null
  acceptLanguage?: string | null
}): Locale {
  if (isLocale(input.cookie)) return input.cookie
  return negotiateLocale(input.acceptLanguage) ?? DEFAULT_LOCALE
}

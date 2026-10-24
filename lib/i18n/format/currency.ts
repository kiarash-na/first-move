import type { Locale } from "../locales"
import { EMPTY_VALUE, INTL_LOCALES, isFiniteNumber } from "./intl-locale"

export interface EurOptions {
  /** `€1.2M` / `1,2 Mio. €` instead of the full amount. */
  compact?: boolean
  /** Fraction digits; default 0 (screening values are rounded to whole euros). */
  fractionDigits?: number
}

function eurFormat(lang: Locale, compact: boolean, digits: number): Intl.NumberFormat {
  return new Intl.NumberFormat(INTL_LOCALES[lang], {
    style: "currency",
    currency: "EUR",
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: compact ? 0 : digits,
    maximumFractionDigits: digits,
  })
}

/**
 * Euro amounts in the UI language: `€1,235` (en) / `1.235 €` (de). Compact amounts keep one
 * fraction digit only when the language actually abbreviates them (`€89.6k`, `1,3 Mio. €`).
 * German has no compact form below a million, so those stay whole euros (`89.578 €`), never
 * tenths of a euro (D-21).
 */
export function formatEur(
  value: number | null | undefined,
  lang: Locale,
  { compact = false, fractionDigits }: EurOptions = {},
): string {
  if (!isFiniteNumber(value)) return EMPTY_VALUE
  if (!compact) return eurFormat(lang, false, fractionDigits ?? 0).format(value)
  const parts = eurFormat(lang, true, fractionDigits ?? 1).formatToParts(value)
  if (parts.some((part) => part.type === "compact")) return parts.map((part) => part.value).join("")
  return eurFormat(lang, false, fractionDigits ?? 0).format(value)
}

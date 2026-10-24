import type { Locale } from "../locales"
import { EMPTY_VALUE, INTL_LOCALES, isFiniteNumber } from "./intl-locale"

export interface EurOptions {
  /** `€1.2M` / `1,2 Mio. €` instead of the full amount. */
  compact?: boolean
  /** Fraction digits; default 0 (screening values are rounded to whole euros). */
  fractionDigits?: number
}

/** Euro amounts in the UI language: `€1,235` (en) / `1.235 €` (de). */
export function formatEur(
  value: number | null | undefined,
  lang: Locale,
  { compact = false, fractionDigits }: EurOptions = {},
): string {
  if (!isFiniteNumber(value)) return EMPTY_VALUE
  const digits = fractionDigits ?? (compact ? 1 : 0)
  return new Intl.NumberFormat(INTL_LOCALES[lang], {
    style: "currency",
    currency: "EUR",
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: compact ? 0 : digits,
    maximumFractionDigits: digits,
  }).format(value)
}

import type { Locale } from "../locales"
import { EMPTY_VALUE, INTL_LOCALES, isFiniteNumber } from "./intl-locale"

/**
 * Formats a **fraction** as a percentage: `0.256` → `26%` (en) / `26 %` (de).
 * Values stored as percent (0–100) must be divided by 100 first (OQ-01).
 */
export function formatPercent(
  fraction: number | null | undefined,
  lang: Locale,
  { fractionDigits = 0 }: { fractionDigits?: number } = {},
): string {
  if (!isFiniteNumber(fraction)) return EMPTY_VALUE
  return new Intl.NumberFormat(INTL_LOCALES[lang], {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(fraction)
}

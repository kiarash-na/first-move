import type { Locale } from "../locales"
import { EMPTY_VALUE, INTL_LOCALES, isFiniteNumber } from "./intl-locale"

/** `1234.5` → `1,234.5` (en) / `1.234,5` (de) (D-21). */
export function formatNumber(
  value: number | null | undefined,
  lang: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  if (!isFiniteNumber(value)) return EMPTY_VALUE
  return new Intl.NumberFormat(INTL_LOCALES[lang], options).format(value)
}

/** A number with a unit symbol, joined by a no-break space: `12,5 m`. */
export function formatQuantity(
  value: number | null | undefined,
  unit: string,
  lang: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  if (!isFiniteNumber(value)) return EMPTY_VALUE
  return `${formatNumber(value, lang, options)} ${unit}`
}

import { formatNumber } from "@/lib/i18n/format"
import type { Locale } from "@/lib/i18n/locales"

/**
 * US dollars as the Vercel AI Gateway bills them (prices, balance, estimates), through the app's
 * number formatter (D-21): `$0.042` / `0,042 $`.
 */
export function formatUsd(value: number, lang: Locale, digits: { min?: number; max?: number } = {}): string {
  return formatNumber(value, lang, {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: digits.min ?? 0,
    maximumFractionDigits: digits.max ?? 3,
  })
}

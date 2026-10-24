import { formatNumber, formatPercent } from "@/lib/i18n/format"
import type { Locale } from "@/lib/i18n/locales"
import { INDICATOR_DISPLAY, indicatorDisplayValue, type ClassifiedIndicator } from "@/lib/quick-check"

/**
 * A classified Quick Check indicator in the UI language, rounded so it never shows a number on
 * the other side of its class boundary (`99%` with "Conditionally feasible", never `100%`).
 * Coverage is a fraction shown as a whole percent; the others are plain numbers. Every place
 * that shows one of these values next to (or instead of) its class uses this.
 */
export function formatIndicator(indicator: ClassifiedIndicator, value: number | null | undefined, lang: Locale): string {
  const shown = typeof value === "number" && Number.isFinite(value) ? indicatorDisplayValue(indicator, value) : value
  if (indicator === "coverage") return formatPercent(shown, lang)
  return formatNumber(shown, lang, { maximumFractionDigits: INDICATOR_DISPLAY[indicator].digits })
}

import { formatNumber, parseNumber } from "@/lib/i18n/format"
import type { Locale } from "@/lib/i18n/locales"

/** A stored number as it appears in an input: grouped, in the UI language, no unit (`7,200` / `7.200`). */
export function formatInputNumber(value: number | null, lang: Locale): string {
  if (value === null) return ""
  return formatNumber(value, lang, { maximumFractionDigits: 6, useGrouping: true })
}

/**
 * What a typed text becomes in a patch (D-21: both decimal separators): "" → null (cleared),
 * a number → that number, anything else → the raw text, so `applyPatch` reports the format error.
 */
export function inputPatchValue(text: string, lang: Locale): number | string | null {
  const trimmed = text.trim()
  if (trimmed === "") return null
  return parseNumber(trimmed, lang) ?? trimmed
}

/** True when the text already shows `value` (so typing "1." or "0,50" is not reformatted). */
export function showsValue(text: string, value: number | null, lang: Locale): boolean {
  const parsed = inputPatchValue(text, lang)
  return parsed === value
}

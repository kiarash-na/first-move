import type { Locale } from "../locales"

/** BCP 47 tags behind each UI language: EN uses British conventions (day-month order). */
export const INTL_LOCALES: Record<Locale, string> = {
  en: "en-GB",
  de: "de-DE",
}

/** Shown for missing or non-finite numbers. */
export const EMPTY_VALUE = "–"

export function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

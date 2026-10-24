import type { Locale } from "@/lib/i18n/locales"
import type { Localized } from "./types"

export function isLocalized(value: unknown): value is Localized {
  return typeof value === "object" && value !== null && !Array.isArray(value) && typeof (value as Localized).en === "string"
}

/** Replaces every `Localized` in a tree by its text in `lang`, falling back to English (D-32). */
export function resolveTexts(value: unknown, lang: Locale): unknown {
  if (isLocalized(value)) {
    const german = value.de
    return lang === "de" && german !== undefined && german !== "" ? german : value.en
  }
  if (Array.isArray(value)) return value.map((entry) => resolveTexts(entry, lang))
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveTexts(entry, lang)]))
  }
  return value
}

import { optionLabel, type Texts } from "@/lib/ai/extract/field-label"
import { formatNumber } from "@/lib/i18n/format"
import type { Locale } from "@/lib/i18n/locales"
import { getField } from "@/lib/project"

export interface DisplayCopy {
  empty: string
  yes: string
  no: string
  /** "{count} new entries" */
  newEntries: string
}

const TEXT_CAP = 160

/**
 * A field value as the review card shows it (D-21 numbers, option labels, yes/no); a list shows
 * how many entries the proposal adds to what is there now.
 */
export function displayValue(key: string, value: unknown, current: unknown, lang: Locale, texts: Texts, copy: DisplayCopy): string {
  if (value === null || value === undefined || value === "") return copy.empty
  if (typeof value === "boolean") return value ? copy.yes : copy.no
  const field = getField(key)
  if (typeof value === "number") {
    const unit = field && "unit" in field ? field.unit : undefined
    const text = formatNumber(value, lang, { maximumFractionDigits: 3 })
    return unit ? `${text} ${unit}` : text
  }
  if (Array.isArray(value)) {
    const added = value.length - (Array.isArray(current) ? current.length : 0)
    return added > 0 ? copy.newEntries.replace("{count}", formatNumber(added, lang)) : formatNumber(value.length, lang)
  }
  if (typeof value === "string") {
    if (field?.kind === "choice") return optionLabel(field, value, texts) ?? value
    return value.length > TEXT_CAP ? `${value.slice(0, TEXT_CAP)}…` : value
  }
  return copy.empty
}

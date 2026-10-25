import "server-only"
import { fieldLabel, optionLabel } from "@/lib/ai/extract/field-label"
import { formatNumber, formatPercent, formatQuantity, formatSquareMeters, formatHectares } from "@/lib/i18n/format"
import { getField, type FieldDef } from "@/lib/project"
import type { MailTexts } from "./texts"

/** Characters of a free text shown back in an email; the rest is in the file and the dashboard. */
export const TEXT_SHOWN = 240

const shorten = (text: string, max = TEXT_SHOWN) => {
  const line = text.replace(/\s+/g, " ").trim()
  return line.length > max ? `${[...line].slice(0, max - 1).join("").trimEnd()}…` : line
}

/** A number in the field's unit: area in m² with hectares (D-31), shares as percent (OQ-01). */
function formatNumeric(field: FieldDef & { kind: "integer" | "number" | "percent" }, value: number, t: MailTexts): string {
  const lang = t.locale
  if (field.kind === "percent") return formatPercent(value / 100, lang, { fractionDigits: 1 })
  if (field.unit === "m²") return `${formatSquareMeters(value, lang)} (${formatHectares(value, lang)})`
  if (field.unit) return formatQuantity(value, field.unit, lang, { maximumFractionDigits: 2 })
  return formatNumber(value, lang, { maximumFractionDigits: 2 })
}

/** One row of an item list in a line: its filled properties, joined. */
function formatRow(field: FieldDef & { kind: "items" }, row: Record<string, unknown>, t: MailTexts): string {
  return field.properties
    .map((property) => {
      const value = row[property.key]
      if (typeof value === "boolean") return value ? (t.mail.conversation.results.yes as string) : null
      return typeof value === "string" && value.trim() ? shorten(value, 120) : null
    })
    .filter((part): part is string => part !== null)
    .join(" · ")
}

/**
 * A field's value as an email shows it back (PLAN-AGENT-07 step 8): numbers through
 * `lib/i18n/format` with their unit, yes or no, the option's label, texts shortened, lists by entry.
 */
export function formatFieldValue(fieldId: string, value: unknown, t: MailTexts): string {
  const field = getField(fieldId)
  const { results } = t.mail.conversation
  if (!field || value === null || value === undefined || value === "") return results.notEntered
  switch (field.kind) {
    case "integer":
    case "number":
    case "percent":
      return typeof value === "number" ? formatNumeric(field, value, t) : results.notEntered
    case "boolean":
      return value ? results.yes : results.no
    case "choice":
      return optionLabel(field, String(value), t.texts) ?? String(value)
    case "textList":
      return Array.isArray(value) ? value.map((entry) => shorten(String(entry), 80)).join("; ") : results.notEntered
    case "items":
      return Array.isArray(value) ? value.map((row) => formatRow(field, row as Record<string, unknown>, t)).filter(Boolean).join(" | ") || results.notEntered : results.notEntered
    default:
      return shorten(String(value))
  }
}

/** A field's name as the dashboard shows it ("Share of buildings · Residential buildings · 1961-1990"). */
export function fieldName(fieldId: string, t: MailTexts): string {
  const field = getField(fieldId)
  return field ? fieldLabel(field, t.texts) : fieldId
}

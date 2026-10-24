import { parseNumber } from "@/lib/i18n/format/parse"
import type { CatalogueField, CatalogueOption, FieldCatalogue } from "./field-catalogue"
import type { ExtractedValue } from "./output-schema"
import { convertUnit } from "./units"

/** Where a value was read: a quote, and the document and page when known. */
export interface ValueSource {
  quote: string
  file?: string
  page?: number
}

export type ProposalValue = string | number | boolean

/** A model value turned into a value of its field's type, ready to merge. */
export interface NormalizedValue {
  id: string
  field: CatalogueField
  value: ProposalValue
  /** The new row an item-list property belongs to (the model's numbering). */
  item?: number
  source: ValueSource
}

export type UnclearReason =
  | "not-in-scope"
  | "missing-item"
  | "empty"
  | "not-a-number"
  | "ambiguous-number"
  | "unknown-unit"
  | "unit-mismatch"
  | "unknown-option"
  | "not-a-boolean"

/** A value that cannot be used as given: shown to the user, never guessed. */
export interface UnclearValue {
  id: string
  label: string
  reason: UnclearReason
  value: ProposalValue
  source: ValueSource
}

type Converted = { ok: true; value: ProposalValue } | { ok: false; reason: UnclearReason }

/** A number as typed, with the rest of the text as its unit ("2,5 GWh/a", "35 %", "1.234,5"). */
const NUMBER_TEXT = /^([+\-\u{2212}\u{2013}]?[\d.,'\s\u{A0}\u{202F}]*\d)\s*([\s\S]*)$/u

/** Both decimal separators (D-21); a number EN and DE read differently ("1.234") is ambiguous. */
function readNumber(raw: ProposalValue, statedUnit: string | undefined): { ok: true; value: number; unit?: string } | { ok: false; reason: UnclearReason } {
  if (typeof raw === "number") return { ok: true, value: raw, unit: statedUnit }
  if (typeof raw === "boolean") return { ok: false, reason: "not-a-number" }
  const match = NUMBER_TEXT.exec(raw.trim())
  if (!match) return { ok: false, reason: "not-a-number" }
  const en = parseNumber(match[1], "en")
  const de = parseNumber(match[1], "de")
  if (en === null && de === null) return { ok: false, reason: "not-a-number" }
  if (en !== null && de !== null && en !== de) return { ok: false, reason: "ambiguous-number" }
  const rest = match[2].trim()
  return { ok: true, value: (en ?? de)!, unit: statedUnit?.trim() || rest || undefined }
}

const BOOLEANS: Record<string, boolean> = { yes: true, no: false, true: true, false: false, ja: true, nein: false, wahr: true, falsch: false }

const optionKey = (text: string) => text.normalize("NFKC").trim().toLowerCase().replace(/[\s-]+/g, "_")

function readChoice(raw: ProposalValue, options: readonly CatalogueOption[], fallback: readonly CatalogueOption[]): Converted {
  if (typeof raw !== "string") return { ok: false, reason: "unknown-option" }
  const wanted = optionKey(raw)
  const match = [...options, ...fallback].find((option) => optionKey(option.value) === wanted || optionKey(option.label) === wanted)
  return match ? { ok: true, value: match.value } : { ok: false, reason: "unknown-option" }
}

function readText(raw: ProposalValue, multiline: boolean): Converted {
  const text = multiline ? String(raw).trim().replace(/\n{3,}/g, "\n\n") : String(raw).replace(/\s+/g, " ").trim()
  return text ? { ok: true, value: text } : { ok: false, reason: "empty" }
}

/**
 * One model value → a value of its field's type (PLAN-AGENT-03 step 4). Numbers accept both
 * decimal separators and convert a stated unit; percent stays as typed (OQ-01); choices match
 * the option key or its label (UI language, then `fallback`, usually English); booleans accept
 * yes/no, ja/nein, true/false. Anything ambiguous is reported, never guessed.
 */
export function toPatchValue(value: ExtractedValue, field: CatalogueField, fallback?: CatalogueField): Converted {
  switch (field.kind) {
    case "integer":
    case "number":
    case "percent": {
      const number = readNumber(value.value, value.unit)
      if (!number.ok) return number
      const converted = convertUnit(number.value, number.unit, field.unit)
      return converted.ok ? { ok: true, value: converted.value } : converted
    }
    case "boolean":
      if (typeof value.value === "boolean") return { ok: true, value: value.value }
      return typeof value.value === "string" && value.value.trim().toLowerCase() in BOOLEANS
        ? { ok: true, value: BOOLEANS[value.value.trim().toLowerCase()] }
        : { ok: false, reason: "not-a-boolean" }
    case "choice":
      return readChoice(value.value, field.options ?? [], fallback?.options ?? [])
    case "longText":
      return readText(value.value, true)
    default:
      return readText(value.value, false)
  }
}

/** Normalizes every value of a model output against the catalogue it was asked with. */
export function normalizeValues(values: readonly ExtractedValue[], catalogue: FieldCatalogue, fallback?: FieldCatalogue) {
  const byId = new Map(catalogue.fields.map((field) => [field.id, field]))
  const fallbackById = new Map(fallback?.fields.map((field) => [field.id, field]))
  const normalized: NormalizedValue[] = []
  const unclear: UnclearValue[] = []
  for (const value of values) {
    const source: ValueSource = { quote: value.quote, ...(value.file && { file: value.file }), ...(value.page && { page: value.page }) }
    const field = byId.get(value.field)
    const report = (reason: UnclearReason) => unclear.push({ id: value.field, label: field?.label ?? value.field, reason, value: value.value, source })
    if (!field) {
      report("not-in-scope")
      continue
    }
    if (field.property && value.item === undefined) {
      report("missing-item")
      continue
    }
    const converted = toPatchValue(value, field, fallbackById.get(field.id))
    if (!converted.ok) {
      report(converted.reason)
      continue
    }
    normalized.push({ id: field.id, field, value: converted.value, ...(field.property && { item: value.item }), source })
  }
  return { values: normalized, unclear }
}

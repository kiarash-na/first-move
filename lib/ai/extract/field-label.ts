import type { Area } from "@/lib/i18n/dictionaries"
import { lookup } from "@/lib/i18n/lookup"
import { getGroup, type ChoiceField, type FieldDef, type TextRef } from "@/lib/project"

/** Dictionaries by area for one language, as a layout or the server loaded them (DE merged over EN). */
export type Texts = Partial<Record<Area, unknown>>

/** A registry text (`label` by default, or `help`), or null when it is missing. */
export const textOf = (texts: Texts, ref: TextRef, leaf = "label") => lookup(texts[ref.area], `${ref.key}.${leaf}`)

/**
 * A field's name as the UI shows it: its group, then its own label, or for a grid cell its row
 * and column ("Share of buildings · Residential · Before 1919").
 */
export function fieldLabel(field: FieldDef, texts: Texts): string {
  const own = textOf(texts, field.text)
  const group = field.group ? getGroup(field.group) : undefined
  if (!group) return own ?? field.id
  const parts = [textOf(texts, group.text)]
  if (field.text.key !== group.text.key) parts.push(own)
  else {
    if (field.row && group.rows) parts.push(lookup(texts[group.rows.text.area], `${group.rows.text.key}.${field.row}.label`))
    if (field.column && group.columns) parts.push(lookup(texts[group.columns.text.area], `${group.columns.text.key}.${field.column}.label`))
  }
  return parts.filter((part): part is string => part !== null).join(" · ") || field.id
}

/** The label of one option of a choice field. */
export function optionLabel(field: ChoiceField, option: string, texts: Texts): string | null {
  return lookup(texts[field.optionText.area], `${field.optionText.key}.${option}.label`)
}

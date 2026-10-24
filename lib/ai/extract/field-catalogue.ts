import { lookup } from "@/lib/i18n/lookup"
import type { Locale } from "@/lib/i18n/locales"
import { fieldsOf, getGroup, type FieldDef, type FieldStep } from "@/lib/project"
import { fieldLabel, optionLabel, textOf, type Texts } from "./field-label"

export type CatalogueModule = "quickCheck" | "businessPlan"

export type CatalogueKind = "integer" | "number" | "percent" | "boolean" | "choice" | "text" | "longText" | "textList"

export interface CatalogueOption {
  value: string
  label: string
}

/** One value a model may return, described for the model and for the UI (PLAN-AGENT-03 step 4). */
export interface CatalogueField {
  /** What a model returns as `field`: the patch key, or `<list>[].<property>` for a property of a new row. */
  id: string
  /** The registry field it writes. */
  fieldId: string
  /** The row property, for item lists. */
  property?: string
  module: CatalogueModule
  step: FieldStep
  /** Module and step as the navigation names them ("Quick Check · Project area"). */
  section: string
  label: string
  /** The item list's own label, for row properties. */
  listLabel?: string
  help?: string
  /** The group the field is laid out in; its help is shared by all its fields. */
  group?: { id: string; label: string; help?: string }
  kind: CatalogueKind
  unit?: string
  min?: number
  exclusiveMin?: number
  max?: number
  /** Characters of a text, or of each entry of a text list. */
  maxLength?: number
  /** Entries of a text list, or rows of an item list. */
  maxItems?: number
  options?: CatalogueOption[]
  required: boolean
  requirements: readonly string[]
}

export interface FieldCatalogue {
  lang: Locale
  fields: CatalogueField[]
}

export interface CatalogueScope {
  modules: readonly CatalogueModule[]
  /** Steps to include. Default: every input step except `assumptions`, the parameter playground. */
  steps?: readonly FieldStep[]
}

function section(module: CatalogueModule, step: FieldStep, texts: Texts): string {
  const name = lookup(texts.shell, `nav.sections.${module}`) ?? module
  const page = lookup(texts.shell, step === "assumptions" ? "nav.items.assumptions" : `nav.items.${module}.${step}`) ?? step
  return `${name} · ${page}`
}

function groupOf(field: FieldDef, texts: Texts): CatalogueField["group"] {
  const group = field.group ? getGroup(field.group) : undefined
  if (!group) return undefined
  const help = textOf(texts, group.text, "help")
  return { id: group.id, label: textOf(texts, group.text) ?? group.id, ...(help && { help }) }
}

function entriesOf(field: FieldDef, module: CatalogueModule, texts: Texts): CatalogueField[] {
  const label = fieldLabel(field, texts)
  const ownHelp = field.group && getGroup(field.group)?.text.key === field.text.key ? null : textOf(texts, field.text, "help")
  const group = groupOf(field, texts)
  const base = {
    fieldId: field.id,
    module,
    step: field.step,
    section: section(module, field.step, texts),
    ...(group && { group }),
    required: field.required,
    requirements: field.requirements,
  }
  switch (field.kind) {
    case "items":
      return field.properties.map((property) => {
        const name = textOf(texts, property.text) ?? property.key
        return {
          ...base,
          id: `${field.id}[].${property.key}`,
          property: property.key,
          label: `${label} · ${name}`,
          listLabel: label,
          ...(ownHelp && { help: ownHelp }),
          kind: property.kind,
          ...(property.maxLength !== undefined && { maxLength: property.maxLength }),
          maxItems: field.maxItems,
        }
      })
    case "choice":
      return [
        {
          ...base,
          id: field.id,
          label,
          ...(ownHelp && { help: ownHelp }),
          kind: "choice",
          options: field.options.map((value) => ({ value, label: optionLabel(field, value, texts) ?? value })),
        },
      ]
    case "textList":
      return [{ ...base, id: field.id, label, ...(ownHelp && { help: ownHelp }), kind: "textList", maxLength: field.maxLength, maxItems: field.maxItems }]
    case "text":
    case "longText":
      return [{ ...base, id: field.id, label, ...(ownHelp && { help: ownHelp }), kind: field.kind, maxLength: field.maxLength }]
    case "boolean":
      return [{ ...base, id: field.id, label, ...(ownHelp && { help: ownHelp }), kind: "boolean" }]
    default:
      return [
        {
          ...base,
          id: field.id,
          label,
          ...(ownHelp && { help: ownHelp }),
          kind: field.kind,
          ...(field.unit && { unit: field.unit }),
          ...(field.min !== undefined && { min: field.min }),
          ...(field.exclusiveMin !== undefined && { exclusiveMin: field.exclusiveMin }),
          max: field.max,
        },
      ]
  }
}

/**
 * The fields an agent may fill, from the registry (PLAN-AGENT-03 step 4): id, label and help in
 * the UI language, kind, unit, bounds, options with labels, required and requirement IDs, in
 * registry order. The email agent also builds its question lists from it (phase A07).
 */
export function fieldCatalogue(scope: CatalogueScope, lang: Locale, texts: Texts): FieldCatalogue {
  const steps = scope.steps ? new Set(scope.steps) : null
  const fields = scope.modules.flatMap((module) =>
    fieldsOf({ module })
      .filter((field) => (steps ? steps.has(field.step) : field.step !== "assumptions"))
      .flatMap((field) => entriesOf(field, module, texts)),
  )
  return { lang, fields }
}

import { isTextFilled } from "@/lib/business-plan/filled"
import { stepProgress, type StepProgress } from "@/lib/business-plan/progress"
import { fieldsOf } from "@/lib/project/fields/registry"
import { BUSINESS_PLAN_STEPS, type BusinessPlanStep } from "@/lib/project/fields/steps"
import type { FieldDef, ItemPropertyDef, TextRef } from "@/lib/project/fields/types"
import { getAt, parsePath } from "@/lib/project/path"
import type { Project } from "@/lib/project/schema/project"

export interface ReportCell {
  label: TextRef
  value: string | boolean
}

/** One filled Business Plan field, as written (D-27: qualitative, stored as typed). */
export type ReportAnswer =
  | { kind: "text"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "rows"; rows: { id: string; cells: ReportCell[] }[] }
  | { kind: "choice"; option: TextRef }

export interface ReportEntry {
  id: string
  label: TextRef
  answer: ReportAnswer
}

export interface ReportStepEntries {
  step: BusinessPlanStep
  progress: StepProgress
  entries: ReportEntry[]
}

const label = (text: TextRef): TextRef => ({ area: text.area, key: `${text.key}.label` })

function cellOf(property: ItemPropertyDef, raw: unknown): ReportCell | null {
  if (property.kind === "boolean") return raw === true ? { label: label(property.text), value: true } : null
  return isTextFilled(raw) ? { label: label(property.text), value: raw as string } : null
}

function answerOf(field: FieldDef, raw: unknown): ReportAnswer | null {
  switch (field.kind) {
    case "text":
    case "longText":
      return isTextFilled(raw) ? { kind: "text", text: raw as string } : null
    case "textList": {
      const items = Array.isArray(raw) ? raw.filter(isTextFilled) : []
      return items.length > 0 ? { kind: "list", items } : null
    }
    case "items": {
      const rows = (Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [])
        .map((row, index) => ({
          id: typeof row.id === "string" ? row.id : String(index),
          cells: field.properties.map((property) => cellOf(property, row[property.key])).filter((cell) => cell !== null),
        }))
        .filter((row) => row.cells.length > 0)
      return rows.length > 0 ? { kind: "rows", rows } : null
    }
    case "choice":
      return raw === null || raw === undefined
        ? null
        : { kind: "choice", option: { area: field.optionText.area, key: `${field.optionText.key}.${String(raw)}.label` } }
    default:
      return null
  }
}

/**
 * The Business Plan for the report (PLAN-DASH-13): per step, its progress and every field that
 * holds something, in registry order and exactly as written. Blank text, blank list entries and
 * rows without content are left out; a "yes" flag (deal breaker) prints, a "no" does not.
 */
export function businessPlanEntries(project: Project): ReportStepEntries[] {
  return BUSINESS_PLAN_STEPS.map((step) => ({
    step,
    progress: stepProgress(project, step),
    entries: fieldsOf({ module: "businessPlan", step }).flatMap((field) => {
      const answer = answerOf(field, getAt(project, parsePath(field.id) ?? []))
      return answer ? [{ id: field.id, label: label(field.text), answer }] : []
    }),
  }))
}

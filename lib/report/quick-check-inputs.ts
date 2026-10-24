import { fieldsOf, getGroup } from "@/lib/project/fields/registry"
import { QUICK_CHECK_STEPS, type QuickCheckStep } from "@/lib/project/fields/steps"
import type { FieldDef, TextRef } from "@/lib/project/fields/types"
import { getAt, parsePath } from "@/lib/project/path"
import type { Project } from "@/lib/project/schema/project"

/** What the report prints for one input; the component formats it in the page language. */
export type ReportValue =
  | { kind: "number"; value: number; unit?: string; hectares: boolean }
  | { kind: "percent"; value: number }
  | { kind: "boolean"; value: boolean }
  | { kind: "choice"; option: TextRef }
  | { kind: "empty"; means: NonNullable<FieldDef["emptyMeans"]> }

export interface ReportInput {
  id: string
  /** Label paths, joined with " · " (a share cell names its building type and its period). */
  label: TextRef[]
  value: ReportValue
}

export interface ReportInputStep {
  step: QuickCheckStep
  inputs: ReportInput[]
}

const label = (text: TextRef): TextRef => ({ area: text.area, key: `${text.key}.label` })

function valueOf(field: FieldDef, raw: unknown): ReportValue {
  if (raw === null || raw === undefined) return { kind: "empty", means: field.emptyMeans ?? "not-entered" }
  switch (field.kind) {
    case "percent":
      return { kind: "percent", value: raw as number }
    case "integer":
    case "number":
      return { kind: "number", value: raw as number, unit: field.unit, hectares: field.companion === "hectares" }
    case "boolean":
      return { kind: "boolean", value: raw as boolean }
    case "choice":
      return { kind: "choice", option: { area: field.optionText.area, key: `${field.optionText.key}.${String(raw)}.label` } }
    default:
      return { kind: "empty", means: "not-entered" }
  }
}

/**
 * A grid cell (a building share) is listed only when it holds a share above 0, labelled with its
 * row and column; a grid without any share prints once, as not entered.
 */
function gridInputs(fields: FieldDef[], groupId: string, project: Project): ReportInput[] {
  const group = getGroup(groupId)
  const filled = fields.flatMap((field): ReportInput[] => {
    const raw = getAt(project, parsePath(field.id) ?? [])
    if (typeof raw !== "number" || raw === 0 || !group?.rows || !field.row) return []
    const parts = [{ area: group.rows.text.area, key: `${group.rows.text.key}.${field.row}.label` }]
    if (group.columns && field.column) parts.push({ area: group.columns.text.area, key: `${group.columns.text.key}.${field.column}.label` })
    return [{ id: field.id, label: parts, value: valueOf(field, raw) }]
  })
  if (filled.length > 0 || !group) return filled
  return [{ id: groupId, label: [label(group.text)], value: { kind: "empty", means: "not-entered" } }]
}

/**
 * The Quick Check inputs of a project for the report (PLAN-DASH-13), step by step and in
 * registry order (D-05): every value as entered, and what an empty one stands for. Parameter
 * overrides (the Assumptions step) are printed with Tables 4 to 6, not here.
 */
export function quickCheckInputs(project: Project): ReportInputStep[] {
  return QUICK_CHECK_STEPS.map((step) => {
    const fields = fieldsOf({ module: "quickCheck", step })
    const inputs: ReportInput[] = []
    const gridsDone = new Set<string>()
    for (const field of fields) {
      const group = field.group ? getGroup(field.group) : undefined
      if (group?.layout === "grid") {
        if (gridsDone.has(group.id)) continue
        gridsDone.add(group.id)
        inputs.push(...gridInputs(fields.filter((entry) => entry.group === group.id), group.id, project))
        continue
      }
      inputs.push({ id: field.id, label: [label(field.text)], value: valueOf(field, getAt(project, parsePath(field.id) ?? [])) })
    }
    return { step, inputs }
  })
}

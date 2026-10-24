import { BUSINESS_PLAN_FIELDS, BUSINESS_PLAN_GROUPS } from "./business-plan"
import { PROJECT_FIELDS, PROJECT_GROUPS } from "./project"
import { QUICK_CHECK_DERIVED, QUICK_CHECK_FIELDS, QUICK_CHECK_GROUPS } from "./quick-check"
import type { FieldStep } from "./steps"
import type { DerivedValue, FieldDef, FieldGroup, FieldModule } from "./types"

/**
 * The agent-ready field registry (D-05): every input, declared once. The UI renders inputs
 * from it, `applyPatch` accepts its ids, and a later ingestion agent reads it next to
 * `projectJsonSchema()`. Plain data: it serializes to JSON as is.
 */
export const FIELDS: readonly FieldDef[] = [...PROJECT_FIELDS, ...QUICK_CHECK_FIELDS, ...BUSINESS_PLAN_FIELDS]

export const FIELD_GROUPS: readonly FieldGroup[] = [...PROJECT_GROUPS, ...QUICK_CHECK_GROUPS, ...BUSINESS_PLAN_GROUPS]

export const DERIVED_VALUES: readonly DerivedValue[] = QUICK_CHECK_DERIVED

const FIELD_BY_ID = new Map(FIELDS.map((field) => [field.id, field]))
const GROUP_BY_ID = new Map(FIELD_GROUPS.map((group) => [group.id, group]))

export function getField(id: string): FieldDef | undefined {
  return FIELD_BY_ID.get(id)
}

export function getGroup(id: string): FieldGroup | undefined {
  return GROUP_BY_ID.get(id)
}

interface Filter {
  module?: FieldModule
  step?: FieldStep
  group?: string
}

const matches = (entry: { module: FieldModule; step: FieldStep; group?: string }, filter: Filter) =>
  (filter.module === undefined || entry.module === filter.module) &&
  (filter.step === undefined || entry.step === filter.step) &&
  (filter.group === undefined || entry.group === filter.group)

/** Fields in registry order, filtered by module, step and/or group. */
export function fieldsOf(filter: Filter = {}): FieldDef[] {
  return FIELDS.filter((field) => matches(field, filter))
}

/** Groups in registry order, filtered by module and/or step. */
export function groupsOf(filter: Omit<Filter, "group"> = {}): FieldGroup[] {
  return FIELD_GROUPS.filter((group) => matches(group, filter))
}

/** The field in one cell of a group, or undefined for a cell without input (a dash, OQ-13). */
export function cellField(groupId: string, row: string, column?: string): FieldDef | undefined {
  return FIELDS.find((field) => field.group === groupId && field.row === row && field.column === column)
}

import { emptyValue } from "./empty-value"
import type { FieldDef } from "./fields/types"
import { parsePath } from "./path"
import { projectSchema } from "./schema/project"
import { schemaAt } from "./schema/schema-at"
import type { ProjectPatch } from "./apply-patch"

/**
 * A patch that resets fields to "not entered" (null, "", false, []). Used for one-click resets,
 * e.g. all parameter overrides (D-10): `clearPatch(fieldsOf({ step: "assumptions" }))`.
 */
export function clearPatch(fields: readonly FieldDef[]): ProjectPatch {
  return Object.fromEntries(
    fields.map((field) => [field.id, emptyValue(schemaAt(projectSchema, parsePath(field.id) ?? [])!)]),
  )
}

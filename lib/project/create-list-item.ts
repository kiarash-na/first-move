import { z } from "zod"
import { emptyValue } from "./empty-value"
import { getField } from "./fields/registry"
import { parsePath } from "./path"
import { projectSchema } from "./schema/project"
import { schemaAt } from "./schema/schema-at"

/**
 * A new, empty row for an item list field (`businessPlan.risks`, …) with a fresh id. Append it
 * with a patch of the whole list: `{ [listId]: [...rows, createListItem(listId)] }`.
 */
export function createListItem(listId: string, id: string = crypto.randomUUID()): Record<string, unknown> {
  const field = getField(listId)
  const list = field?.kind === "items" ? schemaAt(projectSchema, parsePath(listId) ?? []) : undefined
  if (!(list instanceof z.ZodArray)) throw new Error(`${listId} is not an item list`)
  return { ...(emptyValue(list.element as z.ZodType) as Record<string, unknown>), id }
}

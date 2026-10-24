import { z } from "zod"
import { projectSchema } from "./schema/project"

/**
 * The JSON Schema of a project: the contract for a later ingestion agent (D-05), next to the
 * field registry. Generated from the Zod schema, so it cannot drift. Refinements that JSON
 * Schema cannot express (unique row ids, at least one module) are named in descriptions.
 */
export function projectJsonSchema() {
  return z.toJSONSchema(projectSchema, { target: "draft-2020-12" })
}

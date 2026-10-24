import { z } from "zod"

/**
 * The "not entered yet" value of a schema: null where null is allowed, "" for text, false for
 * a toggle, [] for a list, and objects filled key by key. Keeps `createProject` in step with
 * the schema, so a new field needs no second edit.
 */
export function emptyValue(schema: z.ZodType): unknown {
  if (schema instanceof z.ZodNullable || schema instanceof z.ZodNull) return null
  if (schema instanceof z.ZodLiteral) return schema.value
  if (schema instanceof z.ZodString) return ""
  if (schema instanceof z.ZodBoolean) return false
  if (schema instanceof z.ZodArray) return []
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodType>
    return Object.fromEntries(Object.entries(shape).map(([key, child]) => [key, emptyValue(child)]))
  }
  throw new Error(`No empty value for schema type "${schema.def.type}"`)
}

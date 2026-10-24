import { z } from "zod"
import { TEXT_LIMITS, type NumberLimit } from "@/lib/project/fields/limits"

/*
 * Building blocks shared by the section schemas. Rules for every schema in this folder:
 * - no transforms or preprocess, so `z.toJSONSchema()` works (PLAN-DASH-03); numbers are
 *   parsed in `lib/i18n/format`, never here
 * - strict objects: unknown keys are rejected (imports are validated, D-14)
 * - every key is always present; an input that was not entered is `null`
 */

/** A finite number within a limit from `fields/limits.ts`. */
export function limitedNumber(limit: NumberLimit) {
  let schema = limit.integer ? z.number().int() : z.number()
  if (limit.min !== undefined) schema = schema.min(limit.min)
  if (limit.exclusiveMin !== undefined) schema = schema.gt(limit.exclusiveMin)
  return schema.max(limit.max)
}

/** One-line free text, stored as typed (D-21). */
export const shortText = () => z.string().max(TEXT_LIMITS.short)

/** Multi-line free text, stored as typed (D-21). */
export const longText = () => z.string().max(TEXT_LIMITS.long)

/** A list of one-line entries (stakeholders, partners, current supply). */
export const textList = () => z.array(shortText()).max(TEXT_LIMITS.listEntries)

/** Id of a row in an item list. Stable across edits, so a patch can target the row. */
export const itemId = () => z.string().regex(/^[A-Za-z0-9_-]{1,64}$/)

/** A list of rows that each carry a unique `id` (the JSON Schema states it in the description). */
export function itemList<Shape extends z.core.$ZodLooseShape & { id: z.ZodString }>(
  item: z.ZodObject<Shape, z.core.$strict>,
  description: string,
) {
  return z
    .array(item)
    .max(TEXT_LIMITS.listItems)
    .refine((rows) => new Set(rows.map((row) => (row as { id: string }).id)).size === rows.length, {
      message: "Row ids must be unique",
      params: { code: "duplicate-id" },
    })
    .meta({ description: `${description} Row ids are unique.` })
}

/** A strict object with one entry per key, all of the same (or a key-dependent) schema. */
export function keyedObject<const K extends string, S extends z.ZodType>(keys: readonly K[], value: (key: K) => S) {
  const shape = Object.fromEntries(keys.map((key) => [key, value(key)])) as { [P in K]: S }
  return z.strictObject(shape)
}

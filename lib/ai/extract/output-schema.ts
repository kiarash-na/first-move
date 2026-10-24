import { z } from "zod"
import { TEXT_LIMITS } from "@/lib/project"

/** Caps on what a model may return, so a runaway or hostile output cannot flood the review. */
export const EXTRACTION_LIMITS = {
  values: 300,
  unclear: 50,
  quote: 300,
  unit: 30,
  file: 200,
  topic: 200,
  reason: 300,
} as const

/**
 * The structured output a model must return when it reads documents (PLAN-AGENT-03 step 4):
 * values with a quote from the source, and topics it could not settle. `field` may only be a
 * catalogue id of the requested scope; `item` numbers the new rows of an item list (1, 2, …).
 */
export function extractionSchema(fieldIds: readonly string[]) {
  if (fieldIds.length === 0) throw new Error("The extraction scope has no fields")
  return z.strictObject({
    values: z
      .array(
        z.strictObject({
          field: z.enum(fieldIds as [string, ...string[]]),
          item: z.int().min(1).max(TEXT_LIMITS.listItems).optional(),
          value: z.union([z.string().max(TEXT_LIMITS.long), z.number(), z.boolean()]),
          unit: z.string().max(EXTRACTION_LIMITS.unit).optional(),
          quote: z.string().max(EXTRACTION_LIMITS.quote),
          file: z.string().max(EXTRACTION_LIMITS.file).optional(),
          page: z.int().min(1).optional(),
        }),
      )
      .max(EXTRACTION_LIMITS.values),
    unclear: z
      .array(z.strictObject({ topic: z.string().max(EXTRACTION_LIMITS.topic), reason: z.string().max(EXTRACTION_LIMITS.reason) }))
      .max(EXTRACTION_LIMITS.unclear),
  })
}

export type ExtractionOutput = z.infer<ReturnType<typeof extractionSchema>>
export type ExtractedValue = ExtractionOutput["values"][number]

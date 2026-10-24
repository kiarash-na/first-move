import { z } from "zod"
import { isPatchKey } from "@/lib/project/fields/patch-key"

export const PROVENANCE_LIMITS = { entries: 500, model: 120, file: 200 } as const

/** Who proposed a value: the in-app assistant or the email agent (PLAN-AGENT-00). */
export const AI_SOURCES = ["assistant", "email"] as const

/** One AI-proposed value the user accepted. */
export const aiMarkSchema = z
  .strictObject({
    at: z.iso.datetime().meta({ description: "When the proposal was applied (ISO 8601 UTC)." }),
    by: z.enum(AI_SOURCES).meta({ description: "assistant = in-app assistant, email = email agent." }),
    model: z.string().min(1).max(PROVENANCE_LIMITS.model).meta({ description: "Model that proposed the value." }),
    file: z.string().max(PROVENANCE_LIMITS.file).optional().meta({ description: "Document the value was read from." }),
  })
  .meta({ description: "An AI-proposed value the user accepted." })

/**
 * Which values an AI proposed (schema v2; AI page: "recorded as AI-proposed in the project
 * data"). Keys are patch keys of single values (a field, or `<list>.<index>.<property>`). Not a
 * field: system-managed by `applyPatch`, so a manual edit removes the mark.
 */
export const provenanceSchema = z
  .strictObject({
    ai: z
      .record(z.string().refine(isPatchKey, { message: "Not a field" }), aiMarkSchema)
      .refine((marks) => Object.keys(marks).length <= PROVENANCE_LIMITS.entries, {
        message: `At most ${PROVENANCE_LIMITS.entries} marks`,
      }),
  })
  .meta({ description: "System-managed record of AI-proposed values (keys are field ids). Not patchable." })

export type AiMark = z.infer<typeof aiMarkSchema>
export type AiSource = (typeof AI_SOURCES)[number]
export type Provenance = z.infer<typeof provenanceSchema>

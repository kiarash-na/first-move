import { z } from "zod"
import { TEXT_LIMITS } from "@/lib/project/fields/limits"
import { SCHEMA_VERSION } from "@/lib/project/versions"

/** Which modules the project uses (D-01). At least one is on; data of a module that is off is kept. */
export const modulesSchema = z
  .strictObject({
    quickCheck: z.boolean(),
    businessPlan: z.boolean(),
  })
  .refine((modules) => modules.quickCheck || modules.businessPlan, {
    message: "At least one module must be on",
    params: { code: "at-least-one-module" },
  })
  .meta({ description: "Modules in use (D-01). At least one is true." })

/** Project identity and versions (PLAN-DASH-00 § Data model, D-13). */
export const metaSchema = z.strictObject({
  id: z.uuid().meta({ description: "Project id (UUID). System-managed." }),
  name: z.string().max(TEXT_LIMITS.name).meta({ description: "Project name, free text." }),
  createdAt: z.iso.datetime().meta({ description: "ISO 8601 UTC timestamp. System-managed." }),
  updatedAt: z.iso.datetime().meta({ description: "ISO 8601 UTC timestamp of the last change. System-managed." }),
  schemaVersion: z.literal(SCHEMA_VERSION).meta({ description: "Shape version; older files are migrated." }),
  methodologyVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .meta({ description: "Quick Check methodology version the project was last saved with." }),
  modules: modulesSchema,
  exampleId: z
    .string()
    .regex(/^[a-z0-9-]{1,64}$/)
    .nullable()
    .meta({ description: "Example the project was copied from (D-04), or null." }),
})

export type ProjectMeta = z.infer<typeof metaSchema>
export type ProjectModules = z.infer<typeof modulesSchema>

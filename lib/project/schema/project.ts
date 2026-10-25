import { z } from "zod"
import { aiScoreSchema } from "./ai-score"
import { buildingsSchema } from "./buildings"
import { businessPlanSchema } from "./business-plan"
import { metaSchema } from "./meta"
import { provenanceSchema } from "./provenance"
import { quickCheckSchema } from "./quick-check"
import { siteSchema } from "./site"
import { sourcesSchema } from "./sources"

/**
 * One project with two optional modules (D-01, PLAN-DASH-00 § Data model). Inputs only:
 * results are derived, never stored (D-13). Every section is always present, whichever
 * modules are on. `provenance` (schema v2) records which values an AI proposed; `aiScore`
 * (schema v3, D-73) holds the last AI Plan Score, or null.
 */
export const projectSchema = z
  .strictObject({
    meta: metaSchema,
    site: siteSchema,
    buildings: buildingsSchema,
    sources: sourcesSchema,
    quickCheck: quickCheckSchema,
    businessPlan: businessPlanSchema,
    provenance: provenanceSchema,
    aiScore: aiScoreSchema.nullable(),
  })
  .meta({
    title: "First Move project",
    description: "A 5GDHC screening project: shared site, buildings and sources, Quick Check inputs and the Business Plan.",
  })

export type Project = z.infer<typeof projectSchema>

import { z } from "zod"
import { POTENTIALS } from "@/lib/project/catalog/potentials"
import { SOURCES } from "@/lib/project/catalog/sources"
import { keyedObject } from "./common"

/** Potential of one source (QCT-IN-07), or null when the source is not selected (QCT-IN-06). */
export const potentialSchema = z.enum(POTENTIALS).nullable()

/** Energy sources and PV (QCT-IN-06, QCT-IN-07, QCT-IN-09). */
export const sourcesSchema = z
  .strictObject({
    potentials: keyedObject(SOURCES, () => potentialSchema).meta({
      description:
        "Potential per energy source (QCT-IN-06/07). null = not selected. 'unknown' forces 'Further analysis required' (QCT-RULE-UNKNOWN).",
    }),
    pv: z.boolean().meta({ description: "Photovoltaic available (QCT-IN-09, OQ-06): lowers electricity costs by TBL-6 'PV cost reduction'." }),
  })
  .meta({ description: "Energy sources, shared by both modules." })

export type Sources = z.infer<typeof sourcesSchema>

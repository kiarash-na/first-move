import { z } from "zod"
import { longText } from "../common"

/**
 * BM-STEP-01 · Define the opportunity. The site itself is the shared `site` section; buildings
 * and sources are the shared Quick Check sections (D-01).
 */
export const opportunitySchema = z
  .strictObject({
    customerSegments: longText().meta({ description: "Customer segments (BM-STEP-01.1)." }),
    needs: longText().meta({ description: "Heating and cooling needs (BM-STEP-01.1)." }),
    heatSources: longText().meta({
      description: "Relevant heat sources, in words; the selection itself is sources.potentials (BM-STEP-01.1).",
    }),
    painPoint: longText().meta({ description: "The key pain point (BM-STEP-01.1)." }),
    alternatives: longText().meta({ description: "Available alternatives to a shared network (BM-STEP-01.2)." }),
    advantage: longText().meta({
      description: "Why a shared low-temperature network offers value compared with the alternatives (BM-STEP-01.2).",
    }),
  })
  .meta({ description: "BM-STEP-01: define the opportunity." })

export type Opportunity = z.infer<typeof opportunitySchema>

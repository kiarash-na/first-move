import { z } from "zod"
import { longText } from "../common"

/** BM-STEP-04.1: refine the model after the Reality Check and expert feedback. */
export const refinementsSchema = z
  .strictObject({
    feedback: longText().meta({ description: "Expert or mentor feedback and challenges found." }),
    changes: longText().meta({ description: "How the business model was refined, and why." }),
  })
  .meta({ description: "Refinements (BM-STEP-04.1)." })

/** BM-STEP-04.2: scalability and replication under different conditions. */
export const scalabilitySchema = z
  .strictObject({
    geographical: longText(),
    economic: longText(),
    organisational: longText(),
  })
  .meta({ description: "Scalability and replication by geographical, economic and organisational context (BM-STEP-04.2)." })

/** BM-STEP-04.3: next practical steps (V02 list, with the V01 decision gate). */
export const nextStepsSchema = z
  .strictObject({
    data: longText().meta({ description: "Data to collect." }),
    stakeholders: longText().meta({ description: "Stakeholders to engage." }),
    partnerships: longText().meta({ description: "Partnerships to secure." }),
    pilots: longText().meta({ description: "Pilot opportunities." }),
    decisions: longText().meta({ description: "Key decisions and the decision gate." }),
  })
  .meta({ description: "Next steps towards implementation (BM-STEP-04.3)." })

export type Refinements = z.infer<typeof refinementsSchema>
export type Scalability = z.infer<typeof scalabilitySchema>
export type NextSteps = z.infer<typeof nextStepsSchema>

import { z } from "zod"
import { itemId, itemList, longText, shortText } from "../common"

/** BM-STEP-03.1/2: rough but transparent assumptions, in words (D-27: no BP calculations). */
export const assumptionsSchema = z
  .strictObject({
    connectionRate: longText().meta({ description: "Plausible connection rate and why." }),
    tariffs: longText().meta({ description: "Tariffs: base and energy prices, connection fees." }),
    capex: longText().meta({ description: "Capital expenditure." }),
    financing: longText().meta({ description: "Financing." }),
    subsidies: longText().meta({ description: "Subsidy dependence." }),
  })
  .meta({ description: "Rough assumptions of the Reality Check (BM-STEP-03.1/2)." })

/** BM-STEP-03.3/4: a critical assumption and how to validate it. */
export const criticalAssumptionSchema = z.strictObject({
  id: itemId(),
  statement: longText(),
  validation: longText(),
})

/** BM-STEP-03.3/4: a risk, whether it could be the deal-breaker, and how to validate it. */
export const riskSchema = z.strictObject({
  id: itemId(),
  title: shortText(),
  description: longText(),
  dealBreaker: z.boolean(),
  validation: longText(),
})

export const criticalAssumptionsSchema = itemList(
  criticalAssumptionSchema,
  "Top critical assumptions, each with how to validate it (BM-STEP-03.3/4).",
)

export const risksSchema = itemList(
  riskSchema,
  "Risk register: top risks, one potential deal-breaker, how to validate each (BM-STEP-03.3/4).",
)

export type BusinessAssumptions = z.infer<typeof assumptionsSchema>
export type CriticalAssumption = z.infer<typeof criticalAssumptionSchema>
export type Risk = z.infer<typeof riskSchema>

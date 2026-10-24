import { z } from "zod"
import { LIMITS } from "@/lib/project/fields/limits"
import { limitedNumber } from "./common"
import { overridesSchema } from "./overrides"

/** Quick Check-only inputs (QCT-IN-05, QCT-IN-08) and parameter overrides (D-10). */
export const quickCheckSchema = z
  .strictObject({
    manualDemand: z
      .strictObject({
        heatingKwhPerYear: limitedNumber(LIMITS.manualDemandKwhPerYear)
          .nullable()
          .meta({ description: "Optional total heating demand in kWh/a; replaces EQ-3.2c (OQ-05)." }),
        coolingKwhPerYear: limitedNumber(LIMITS.manualDemandKwhPerYear)
          .nullable()
          .meta({ description: "Optional total cooling demand in kWh/a; replaces EQ-3.2d (OQ-05)." }),
      })
      .meta({ description: "Manual heating and cooling demand (QCT-IN-05). null = use the estimate." }),
    networkLengthM: limitedNumber(LIMITS.networkLengthM)
      .nullable()
      .meta({ description: "Optional total network length in m (QCT-IN-08); null = estimated by EQ-3.4a/b." }),
    overrides: overridesSchema,
  })
  .meta({ description: "Quick Check inputs that only the Quick Check uses." })

export type QuickCheckInputs = z.infer<typeof quickCheckSchema>

import { HEAT_DENSITY_RULE, type DensityClass } from "./rules.config"
import { classifyByRule } from "./threshold"

/** OQ-10: ρ_heat in kWh/m (EQ-3.5) as MWh/m, the unit of the TBL-9 thresholds and the UI. */
export function toMwhPerMeter(kwhPerMeter: number): number {
  return kwhPerMeter / 1000
}

/** TBL-9 (QCT-EVAL-4.3): class of the heat density in MWh/m. */
export function classifyHeatDensity(mwhPerMeter: number): DensityClass {
  return classifyByRule(mwhPerMeter, HEAT_DENSITY_RULE)
}

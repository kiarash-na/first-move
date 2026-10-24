// EQ-3.5: \rho_{heat} = \frac{Q_{heat,total}}{l_{total}}
import { divide } from "./divide"

/**
 * EQ-3.5: heat density in kWh/m (kWh/a per m of network). TBL-9 classifies it in MWh/m
 * (÷ 1000, OQ-10). null when the length is 0.
 */
export function heatDensity(heatingDemandTotal: number, networkLength: number): number | null {
  return divide(heatingDemandTotal, networkLength)
}

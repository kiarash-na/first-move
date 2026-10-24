import { toMwhPerMeter } from "../classify/heat-density"
import { buildingDensity } from "../equations/eq-3-03-building-density"
import { specificNetLength } from "../equations/eq-3-04a-specific-net-length"
import { totalNetLength } from "../equations/eq-3-04b-total-net-length"
import { heatDensity } from "../equations/eq-3-05-heat-density"
import type { Guard } from "./guard"

export interface NetworkStageInput {
  totalBuildings: number
  projectAreaM2: number
  /** QCT-IN-08; null = estimate. */
  manualNetworkLengthM: number | null
  heatingDemandKwh: number
}

export interface NetworkStage {
  buildingDensity: number
  specificNetworkLength: number
  estimatedNetworkLengthM: number
  networkLengthM: number
  heatDensityKwhPerM: number
  heatDensityMwhPerM: number
}

/**
 * Spatial indicators: EQ-3.3 building density (= N_ha, OQ-09), EQ-3.4a/b estimated length,
 * the entered length if any (QCT-IN-08), and EQ-3.5 heat density (kWh/m and MWh/m, OQ-10).
 */
export function networkStage(input: NetworkStageInput, guard: Guard): NetworkStage {
  const density = guard.need(buildingDensity(input.totalBuildings, input.projectAreaM2), "buildings.areaM2")
  const specific = specificNetLength(density)
  const estimated = totalNetLength(specific, input.projectAreaM2)
  const length = input.manualNetworkLengthM ?? estimated
  const heat = guard.need(heatDensity(input.heatingDemandKwh, length), "quickCheck.networkLengthM")
  return {
    buildingDensity: density,
    specificNetworkLength: specific,
    estimatedNetworkLengthM: estimated,
    networkLengthM: length,
    heatDensityKwhPerM: heat,
    heatDensityMwhPerM: toMwhPerMeter(heat),
  }
}

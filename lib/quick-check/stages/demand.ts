import { BUILDING_TYPES } from "@/lib/project/catalog/building-types"
import { CONSTRUCTION_PERIODS } from "@/lib/project/catalog/construction-periods"
import { numberOfBuildings } from "../equations/eq-3-01-number-of-buildings"
import { annualHeatingDemand } from "../equations/eq-3-02a-annual-heating-demand"
import { annualCoolingDemand } from "../equations/eq-3-02b-annual-cooling-demand"
import { totalHeatingDemand } from "../equations/eq-3-02c-total-heating-demand"
import { totalCoolingDemand } from "../equations/eq-3-02d-total-cooling-demand"
import type { EngineInputs } from "../inputs"
import type { EffectiveParameters } from "../params"
import type { CellResult } from "../types"

export interface DemandStage {
  cells: CellResult[]
  estimatedHeatingDemandKwh: number
  estimatedCoolingDemandKwh: number
  heatingDemandKwh: number
  coolingDemandKwh: number
}

/**
 * Building stock and demand: EQ-3.1 and EQ-3.2a/b per cell (all 25, OQ-08), EQ-3.2c/d totals.
 * A manual total replaces its estimate (OQ-05); the cells stay as estimated.
 */
export function demandStage(inputs: EngineInputs, parameters: EffectiveParameters, totalBuildings: number): DemandStage {
  const cells = BUILDING_TYPES.flatMap((type) =>
    CONSTRUCTION_PERIODS.map((period): CellResult => {
      const share = inputs.shares[type][period]
      const defaults = parameters.buildings[type][period]
      const buildings = numberOfBuildings(totalBuildings, share)
      return {
        type,
        period,
        share,
        buildings,
        ...defaults,
        heatingDemandKwh: annualHeatingDemand(buildings, defaults.heatingDemandPerM2, defaults.floorAreaM2),
        coolingDemandKwh: annualCoolingDemand(buildings, defaults.coolingDemandPerM2, defaults.floorAreaM2),
      }
    }),
  )
  const estimatedHeatingDemandKwh = totalHeatingDemand(cells.map((cell) => cell.heatingDemandKwh))
  const estimatedCoolingDemandKwh = totalCoolingDemand(cells.map((cell) => cell.coolingDemandKwh))
  return {
    cells,
    estimatedHeatingDemandKwh,
    estimatedCoolingDemandKwh,
    heatingDemandKwh: inputs.manualHeatingDemandKwh ?? estimatedHeatingDemandKwh,
    coolingDemandKwh: inputs.manualCoolingDemandKwh ?? estimatedCoolingDemandKwh,
  }
}

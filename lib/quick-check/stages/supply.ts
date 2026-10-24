import { CAPACITY_LEVELS, type CapacityLevel } from "@/lib/project/catalog/potentials"
import { heatingSupply } from "../equations/eq-3-08a-heating-supply"
import { coolingSupply } from "../equations/eq-3-08b-cooling-supply"
import { supplyInvestment } from "../equations/eq-3-10b-supply-investment-per-source"
import { electricityCosts, sourceElectricityCosts } from "../equations/eq-3-11-electricity-costs"
import { pvReducedElectricityCosts } from "../equations/pv-reduction"
import type { SelectedSource } from "../inputs"
import type { EffectiveParameters } from "../params"
import type { SourceResult } from "../types"
import type { Guard } from "./guard"

export interface SupplyStage {
  sources: SourceResult[]
  heatingSupplyKwh: number
  coolingSupplyKwh: number
  electricityCostsWithoutPv: number
  electricityCosts: number
}

const isCapacityLevel = (potential: string): potential is CapacityLevel =>
  (CAPACITY_LEVELS as readonly string[]).includes(potential)

const copField = (application: "heating" | "cooling", source: string) =>
  `quickCheck.overrides.${application}.${source}.cop`

/**
 * Supply per selected source (OQ-11): TBL-4/5 capacity of its level, EQ-3.8a/b, EQ-3.10b and
 * its EQ-3.11 term. Unknown potential adds 0 supply, cost and electricity (R-01); a dash
 * counts as 0 (OQ-13). The supplies and electricity costs are summed; PV lowers C_el (OQ-06).
 */
export function supplyStage(
  selected: readonly SelectedSource[],
  parameters: EffectiveParameters,
  pv: boolean,
  guard: Guard,
): SupplyStage {
  const { economic } = parameters
  const sources = selected.map(({ source, potential }): SourceResult => {
    const heating = parameters.heating[source]
    const cooling = parameters.cooling[source]
    const level = isCapacityLevel(potential) ? potential : null
    const heatingAvailableKwh = level === null ? 0 : (heating[level] ?? 0)
    const coolingAvailableKwh = level === null ? 0 : (cooling[level] ?? 0)
    const heatingSupplyKwh = guard.need(heatingSupply(heatingAvailableKwh, heating.cop), copField("heating", source))
    const coolingSupplyKwh = guard.need(coolingSupply(coolingAvailableKwh, cooling.cop), copField("cooling", source))
    const installationCostPerKwh = economic[`installation_costs_${source}`]
    const electricity = sourceElectricityCosts(
      { heatingSupply: heatingSupplyKwh, heatingCop: heating.cop, coolingSupply: coolingSupplyKwh, coolingCop: cooling.cop },
      economic.electricity_cost,
    )
    const electricityCostsWithoutPv = guard.need(
      electricity,
      copField(heating.cop === 0 ? "heating" : "cooling", source),
    )
    return {
      source,
      potential,
      heatingAvailableKwh,
      heatingCop: heating.cop,
      heatingSupplyKwh,
      coolingAvailableKwh,
      coolingCop: cooling.cop,
      coolingSupplyKwh,
      installationCostPerKwh,
      investment: supplyInvestment(installationCostPerKwh, heatingSupplyKwh),
      electricityCostsWithoutPv,
      electricityCosts: pvReducedElectricityCosts(electricityCostsWithoutPv, pv, economic.pv_cost_reduction),
    }
  })
  // EQ-3.11 over all sources. It is null only when a source term is, which the guard has
  // already recorded above (the run is then incomplete).
  const totalWithoutPv =
    electricityCosts(
      sources.map((entry) => ({
        heatingSupply: entry.heatingSupplyKwh,
        heatingCop: entry.heatingCop,
        coolingSupply: entry.coolingSupplyKwh,
        coolingCop: entry.coolingCop,
      })),
      economic.electricity_cost,
    ) ?? 0
  return {
    sources,
    heatingSupplyKwh: sources.reduce((sum, entry) => sum + entry.heatingSupplyKwh, 0),
    coolingSupplyKwh: sources.reduce((sum, entry) => sum + entry.coolingSupplyKwh, 0),
    electricityCostsWithoutPv: totalWithoutPv,
    electricityCosts: pvReducedElectricityCosts(totalWithoutPv, pv, economic.pv_cost_reduction),
  }
}

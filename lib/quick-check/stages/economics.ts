import type { EconomicParameter } from "@/lib/project/catalog/economic-parameters"
import { economicRatio } from "../equations/economic-ratio"
import { heatingRevenue, type FloorAreaCell } from "../equations/eq-3-09a-heating-revenue"
import { coolingRevenue } from "../equations/eq-3-09b-cooling-revenue"
import { connectionFeeRevenue, overallRevenue } from "../equations/eq-3-09c-overall-revenue"
import { networkInvestment } from "../equations/eq-3-10a-network-investment"
import { totalSupplyInvestment } from "../equations/eq-3-10c-supply-investment-total"
import { heatPumpInvestment, overallInvestment } from "../equations/eq-3-10d-overall-investment"
import { annuityFactor } from "../equations/eq-3-10e-annuity-factor"
import { annualizedCosts } from "../equations/eq-3-10f-annualized-costs"
import { operationAndMaintenance } from "../equations/eq-3-12-operation-and-maintenance"
import type { Guard } from "./guard"

export interface EconomicsStageInput {
  cells: readonly FloorAreaCell[]
  totalBuildings: number
  heatingDemandKwh: number
  coolingDemandKwh: number
  networkLengthM: number
  /** C_i of every selected source (EQ-3.10b). */
  supplyInvestments: readonly number[]
  /** C_el after the PV reduction (EQ-3.11, OQ-06). */
  electricityCosts: number
  /** TBL-6 in equation units (`params.ts`). */
  economic: Record<EconomicParameter, number>
}

export interface EconomicsStage {
  heatingRevenue: number
  heatingBaseRevenue: number
  heatingEnergyRevenue: number
  coolingRevenue: number
  coolingBaseRevenue: number
  coolingEnergyRevenue: number
  connectionFeeRevenue: number
  overallRevenue: number
  networkInvestment: number
  supplyInvestment: number
  heatPumpInvestment: number
  overallInvestment: number
  annuityFactor: number
  annualizedCosts: number
  operationAndMaintenance: number
  annualCosts: number
  economicRatio: number | null
}

/**
 * Revenues (EQ-3.9a-c), investment (EQ-3.10a-d, OQ-17), annuity and annual costs (EQ-3.10e/f,
 * EQ-3.12) and the economic ratio E (OQ-21). N_total terms use the entered total (R-02).
 */
export function economicsStage(input: EconomicsStageInput, guard: Guard): EconomicsStage {
  const { economic } = input
  const annuity = guard.need(
    annuityFactor(economic.interest_rate, economic.depreciation_period),
    "quickCheck.overrides.economic.depreciation_period",
  )
  const heating = heatingRevenue(input.cells, economic.heating_base_price, input.heatingDemandKwh, economic.heating_energy_price)
  const cooling = coolingRevenue(input.cells, economic.cooling_base_price, input.coolingDemandKwh, economic.cooling_energy_price)
  const network = networkInvestment(economic.network_construction_costs, input.networkLengthM)
  const supply = totalSupplyInvestment(input.supplyInvestments)
  const overall = overallInvestment(economic.heat_pump, input.totalBuildings, network, supply)
  const annualized = annualizedCosts(overall, annuity)
  const maintenance = operationAndMaintenance(overall)
  const revenue = overallRevenue(heating.total, cooling.total, economic.connection_fee, input.totalBuildings, annuity)
  return {
    heatingRevenue: heating.total,
    heatingBaseRevenue: heating.base,
    heatingEnergyRevenue: heating.energy,
    coolingRevenue: cooling.total,
    coolingBaseRevenue: cooling.base,
    coolingEnergyRevenue: cooling.energy,
    connectionFeeRevenue: connectionFeeRevenue(economic.connection_fee, input.totalBuildings, annuity),
    overallRevenue: revenue,
    networkInvestment: network,
    supplyInvestment: supply,
    heatPumpInvestment: heatPumpInvestment(economic.heat_pump, input.totalBuildings),
    overallInvestment: overall,
    annuityFactor: annuity,
    annualizedCosts: annualized,
    operationAndMaintenance: maintenance,
    annualCosts: annualized + input.electricityCosts + maintenance,
    economicRatio: economicRatio(revenue, annualized, input.electricityCosts, maintenance),
  }
}

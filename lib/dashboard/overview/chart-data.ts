import { BUILDING_TYPES, type BuildingType } from "@/lib/project/catalog/building-types"
import { CONSTRUCTION_PERIODS, type ConstructionPeriod } from "@/lib/project/catalog/construction-periods"
import type { SourceKey } from "@/lib/project/catalog/sources"
import type { Demand, QuickCheckComplete } from "@/lib/quick-check"

/**
 * The numbers behind the overview charts (PLAN-DASH-09 step 5). Pure functions of one
 * `run()` result: the charts and their table views read the same rows, so they cannot differ.
 * Energy is in kWh/a, money in € (investments) or €/a (revenues and costs).
 */

export interface CoverageRow {
  demand: Demand
  supplyKwh: number
  demandKwh: number
  /** Fraction; null when the demand is 0 (not relevant). */
  coverage: number | null
}

/** Supply against demand per demand type (EQ-3.6a/b), the data of the bullet bars. */
export function coverageRows(result: QuickCheckComplete): CoverageRow[] {
  const { values } = result
  return [
    { demand: "heating", supplyKwh: values.heatingSupplyKwh, demandKwh: values.heatingDemandKwh, coverage: values.heatingCoverage },
    { demand: "cooling", supplyKwh: values.coolingSupplyKwh, demandKwh: values.coolingDemandKwh, coverage: values.coolingCoverage },
  ]
}

export type RevenueId = "base" | "energy" | "connection"
export type CostId = "annualized" | "electricity" | "operation"

export interface Part<Id extends string> {
  id: Id
  value: number
}

export interface EconomicsData {
  revenues: Part<RevenueId>[]
  costs: Part<CostId>[]
  revenueTotal: number
  costTotal: number
}

/** Revenues (EQ-3.9c) against annual costs (OQ-21): base prices, energy prices, connection fees / annuity, electricity, O&M. */
export function economicsData({ values }: QuickCheckComplete): EconomicsData {
  return {
    revenues: [
      { id: "base", value: values.heatingBaseRevenue + values.coolingBaseRevenue },
      { id: "energy", value: values.heatingEnergyRevenue + values.coolingEnergyRevenue },
      { id: "connection", value: values.connectionFeeRevenue },
    ],
    costs: [
      { id: "annualized", value: values.annualizedCosts },
      { id: "electricity", value: values.electricityCosts },
      { id: "operation", value: values.operationAndMaintenance },
    ],
    revenueTotal: values.overallRevenue,
    costTotal: values.annualCosts,
  }
}

export type InvestmentId = "heatPump" | "network" | "supply"

/** The three parts of the overall investment (EQ-3.10d with OQ-17), largest first. */
export function investmentParts({ values }: QuickCheckComplete): Part<InvestmentId>[] {
  const parts: Part<InvestmentId>[] = [
    { id: "heatPump", value: values.heatPumpInvestment },
    { id: "network", value: values.networkInvestment },
    { id: "supply", value: values.supplyInvestment },
  ]
  return parts.sort((a, b) => b.value - a.value)
}

export interface DemandByTypeRow {
  type: BuildingType
  /** kWh/a per construction period, in `CONSTRUCTION_PERIODS` order. */
  periods: Record<ConstructionPeriod, number>
  total: number
}

export interface DemandByType {
  heating: DemandByTypeRow[]
  cooling: DemandByTypeRow[]
}

function sumBy(result: QuickCheckComplete, pick: "heatingDemandKwh" | "coolingDemandKwh"): DemandByTypeRow[] {
  return BUILDING_TYPES.map((type) => {
    const periods = Object.fromEntries(CONSTRUCTION_PERIODS.map((period) => [period, 0])) as Record<ConstructionPeriod, number>
    for (const cell of result.cells) if (cell.type === type) periods[cell.period] += cell[pick]
    return { type, periods, total: CONSTRUCTION_PERIODS.reduce((sum, period) => sum + periods[period], 0) }
  })
}

/** Demand by building type and construction period (EQ-3.2a/b per cell), for heating and cooling. */
export function demandByType(result: QuickCheckComplete): DemandByType {
  return { heating: sumBy(result, "heatingDemandKwh"), cooling: sumBy(result, "coolingDemandKwh") }
}

export interface SupplyRow {
  source: SourceKey
  heatingKwh: number
  coolingKwh: number
}

export interface SupplyBySource {
  rows: SupplyRow[]
  heatingDemandKwh: number
  coolingDemandKwh: number
}

/** Supply of each selected source (EQ-3.8a/b) next to the two demands. */
export function supplyBySource(result: QuickCheckComplete): SupplyBySource {
  return {
    rows: result.sources.map((source) => ({ source: source.source, heatingKwh: source.heatingSupplyKwh, coolingKwh: source.coolingSupplyKwh })),
    heatingDemandKwh: result.values.heatingDemandKwh,
    coolingDemandKwh: result.values.coolingDemandKwh,
  }
}

export interface SourceCost {
  source: SourceKey
  /** C_i (EQ-3.10b) in €. */
  investment: number
  /** The source's EQ-3.11 term in €/a (after PV, OQ-06). */
  electricity: number
}

export interface CostStructure {
  /** Annual costs by component and each one's share of the total (fraction; 0 when the total is 0). */
  annual: (Part<CostId> & { share: number })[]
  /** Investment items: heat pumps, network, then each selected source. */
  investment: { id: "heatPump" | "network" | SourceKey; value: number }[]
  perSource: SourceCost[]
}

/** How the costs split up: annual cost components and the investment down to each source. */
export function costStructure(result: QuickCheckComplete): CostStructure {
  const { costs, costTotal } = economicsData(result)
  return {
    annual: costs.map((cost) => ({ ...cost, share: costTotal > 0 ? cost.value / costTotal : 0 })),
    investment: [
      { id: "heatPump", value: result.values.heatPumpInvestment },
      { id: "network", value: result.values.networkInvestment },
      ...result.sources.map((source) => ({ id: source.source, value: source.investment })),
    ],
    perSource: result.sources.map((source) => ({ source: source.source, investment: source.investment, electricity: source.electricityCosts })),
  }
}

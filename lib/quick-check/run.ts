import { inputStatus } from "@/lib/project/completeness/input-status"
import { getField } from "@/lib/project/fields/registry"
import type { FieldStep } from "@/lib/project/fields/steps"
import type { Project } from "@/lib/project/schema/project"
import { coolingCoverage } from "./equations/eq-3-06b-cooling-coverage"
import { heatingCoverage } from "./equations/eq-3-06a-heating-coverage"
import { coolingToHeatingRatio, dominantDemand } from "./equations/eq-3-07-cooling-to-heating-ratio"
import { readInputs, type EngineInputs } from "./inputs"
import { effectiveParameters, type EffectiveParameters } from "./params"
import { assessmentStage } from "./stages/assessment"
import { demandStage } from "./stages/demand"
import { economicsStage } from "./stages/economics"
import { createGuard } from "./stages/guard"
import { networkStage } from "./stages/network"
import { supplyStage } from "./stages/supply"
import type { QuickCheckFlags, QuickCheckIncomplete, QuickCheckRun, QuickCheckValues } from "./types"

function runFlags(inputs: EngineInputs, parameters: EffectiveParameters, incomplete: boolean): QuickCheckFlags {
  return {
    incomplete,
    manualHeatingDemand: inputs.manualHeatingDemandKwh !== null,
    manualCoolingDemand: inputs.manualCoolingDemandKwh !== null,
    manualNetworkLength: inputs.manualNetworkLengthM !== null,
    estimatedNetworkLength: inputs.manualNetworkLengthM === null,
    customParameters: parameters.isCustom,
    pv: inputs.pv,
    industry: inputs.industry,
    unknownSources: inputs.unknownSources.length > 0,
  }
}

function incomplete(
  missing: string[],
  steps: FieldStep[],
  flags: QuickCheckFlags,
  parameters: EffectiveParameters,
): QuickCheckIncomplete {
  return { status: "incomplete", missing, incompleteSteps: steps, flags: { ...flags, incomplete: true }, parameters }
}

/**
 * The Quick Check (QCT-CALC-00): project in, full result out. Pure and synchronous; results are
 * derived, never stored (D-13). Without the required inputs (buildings, area, shares adding up
 * to 100, a selected source) there is no result (R-03, OQ-22).
 */
export function run(project: Project): QuickCheckRun {
  const parameters = effectiveParameters(project.quickCheck.overrides)
  const inputs = readInputs(project)
  const status = inputStatus(project, "quickCheck")
  const flags = runFlags(inputs, parameters, !status.complete)
  const { totalBuildings, projectAreaM2 } = inputs
  if (!status.complete || totalBuildings === null || projectAreaM2 === null) {
    return incomplete(status.missing, status.incompleteSteps, flags, parameters)
  }

  const guard = createGuard()
  const demand = demandStage(inputs, parameters, totalBuildings)
  const network = networkStage(
    { totalBuildings, projectAreaM2, manualNetworkLengthM: inputs.manualNetworkLengthM, heatingDemandKwh: demand.heatingDemandKwh },
    guard,
  )
  const supply = supplyStage(inputs.sources, parameters, inputs.pv, guard)
  const economics = economicsStage(
    {
      cells: demand.cells,
      totalBuildings,
      heatingDemandKwh: demand.heatingDemandKwh,
      coolingDemandKwh: demand.coolingDemandKwh,
      networkLengthM: network.networkLengthM,
      supplyInvestments: supply.sources.map((source) => source.investment),
      electricityCosts: supply.electricityCosts,
      economic: parameters.economic,
    },
    guard,
  )
  if (guard.invalid.length > 0) {
    const steps = [...new Set(guard.invalid.map((id) => getField(id)?.step ?? "assumptions"))]
    return incomplete([...guard.invalid], steps, flags, parameters)
  }

  const values: QuickCheckValues = {
    totalBuildings,
    projectAreaM2,
    estimatedHeatingDemandKwh: demand.estimatedHeatingDemandKwh,
    estimatedCoolingDemandKwh: demand.estimatedCoolingDemandKwh,
    heatingDemandKwh: demand.heatingDemandKwh,
    coolingDemandKwh: demand.coolingDemandKwh,
    ...network,
    heatingSupplyKwh: supply.heatingSupplyKwh,
    coolingSupplyKwh: supply.coolingSupplyKwh,
    heatingCoverage: heatingCoverage(supply.heatingSupplyKwh, demand.heatingDemandKwh),
    coolingCoverage: coolingCoverage(supply.coolingSupplyKwh, demand.coolingDemandKwh),
    chRatio: coolingToHeatingRatio(demand.coolingDemandKwh, demand.heatingDemandKwh),
    dominantDemand: dominantDemand(demand.coolingDemandKwh, demand.heatingDemandKwh),
    electricityCostsWithoutPv: supply.electricityCostsWithoutPv,
    electricityCosts: supply.electricityCosts,
    ...economics,
  }
  return {
    status: "complete",
    values,
    cells: demand.cells,
    sources: supply.sources,
    ...assessmentStage(values, inputs),
    flags,
    parameters,
  }
}

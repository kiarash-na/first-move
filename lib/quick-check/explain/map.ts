import type calc from "@/dictionaries/en/calc.json"
import type { TableId } from "@/lib/project/catalog/references"
import { stepEquations } from "@/lib/project/fields/step-equations"
import { QUICK_CHECK_STEPS, type QuickCheckStep } from "@/lib/project/fields/steps"
import type { QuickCheckFlags } from "../types"
import type { FormulaId } from "./formulas"

/** Dot paths to the strings of the `calc` dictionary (EN is the source of keys, D-32). */
type LeafPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : LeafPaths<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export type CalcKey = LeafPaths<typeof calc>

/** A collapsed "How we calculate" (D-33): one plain-language sentence and the formulas it uses. */
export interface Explanation {
  text: CalcKey
  formulas: readonly FormulaId[]
  tables: readonly TableId[]
}

/** EQ-3.7 has no equation in the source; its formula is the OQ-12 answer, shown next to it. */
function withResolved(ids: readonly FormulaId[]): FormulaId[] {
  return ids.flatMap((id) => (id === "EQ-3.7" ? (["EQ-3.7", "OQ-12"] as const) : [id]))
}

export type ExplainedStep = QuickCheckStep | "assumptions"

/** The tables each step's inputs select defaults from or override. */
const STEP_TABLES: Record<ExplainedStep, readonly TableId[]> = {
  area: ["TBL-8"],
  buildings: ["TBL-1", "TBL-2", "TBL-3"],
  sources: ["TBL-4", "TBL-5", "TBL-6"],
  options: ["TBL-6"],
  assumptions: ["TBL-4", "TBL-5", "TBL-6"],
}

/**
 * Per Quick Check step: the equations its inputs feed or replace (from the field registry,
 * `stepEquations`) and the `calc.steps.<step>` sentence.
 */
export const STEP_EXPLAIN = {} as Record<ExplainedStep, Explanation>
for (const step of [...QUICK_CHECK_STEPS, "assumptions"] as const) {
  STEP_EXPLAIN[step] = {
    text: `steps.${step}`,
    formulas: withResolved(stepEquations("quickCheck", step)),
    tables: STEP_TABLES[step],
  }
}

type ManualFlag = Extract<keyof QuickCheckFlags, "manualHeatingDemand" | "manualCoolingDemand" | "manualNetworkLength">

interface ResultExplain extends Explanation {
  /** A manual input drops the estimate's formulas from the list and may change the sentence. */
  manual?: Partial<Record<ManualFlag, { drops: readonly FormulaId[]; text?: CalcKey }>>
}

const HEATING_ESTIMATE = ["EQ-3.1", "EQ-3.2a", "EQ-3.2c"] as const
const COOLING_ESTIMATE = ["EQ-3.1", "EQ-3.2b", "EQ-3.2d"] as const
const LENGTH_ESTIMATE = ["EQ-3.3", "EQ-3.4a", "EQ-3.4b"] as const

/**
 * Per result value (keys of `QuickCheckValues`, plus `densityCategory` and `level`): the
 * formulas that produce it, in methodology order, and its `calc.results.<key>` sentence.
 */
export const RESULT_EXPLAIN = {
  heatingDemandKwh: {
    text: "results.heatingDemandKwh.text",
    formulas: HEATING_ESTIMATE,
    tables: ["TBL-1", "TBL-3"],
    manual: { manualHeatingDemand: { drops: HEATING_ESTIMATE, text: "results.heatingDemandKwh.manual" } },
  },
  coolingDemandKwh: {
    text: "results.coolingDemandKwh.text",
    formulas: COOLING_ESTIMATE,
    tables: ["TBL-2", "TBL-3"],
    manual: { manualCoolingDemand: { drops: COOLING_ESTIMATE, text: "results.coolingDemandKwh.manual" } },
  },
  buildingDensity: { text: "results.buildingDensity.text", formulas: ["EQ-3.3"], tables: ["TBL-8"] },
  densityCategory: { text: "results.densityCategory.text", formulas: ["EQ-3.3"], tables: ["TBL-8"] },
  specificNetworkLength: {
    text: "results.specificNetworkLength.text",
    formulas: ["EQ-3.3", "EQ-3.4a"],
    tables: [],
  },
  networkLengthM: {
    text: "results.networkLengthM.text",
    formulas: LENGTH_ESTIMATE,
    tables: [],
    manual: { manualNetworkLength: { drops: LENGTH_ESTIMATE, text: "results.networkLengthM.manual" } },
  },
  heatDensityMwhPerM: {
    text: "results.heatDensityMwhPerM.text",
    formulas: ["EQ-3.2c", "EQ-3.4b", "EQ-3.5"],
    tables: ["TBL-9"],
    manual: { manualHeatingDemand: { drops: ["EQ-3.2c"] }, manualNetworkLength: { drops: ["EQ-3.4b"] } },
  },
  heatingSupplyKwh: { text: "results.heatingSupplyKwh.text", formulas: ["EQ-3.8a"], tables: ["TBL-4"] },
  coolingSupplyKwh: { text: "results.coolingSupplyKwh.text", formulas: ["EQ-3.8b"], tables: ["TBL-5"] },
  heatingCoverage: {
    text: "results.heatingCoverage.text",
    formulas: ["EQ-3.8a", "EQ-3.2c", "EQ-3.6a"],
    tables: ["TBL-4", "TBL-7"],
    manual: { manualHeatingDemand: { drops: ["EQ-3.2c"] } },
  },
  coolingCoverage: {
    text: "results.coolingCoverage.text",
    formulas: ["EQ-3.8b", "EQ-3.2d", "EQ-3.6b"],
    tables: ["TBL-5", "TBL-7"],
    manual: { manualCoolingDemand: { drops: ["EQ-3.2d"] } },
  },
  chRatio: { text: "results.chRatio.text", formulas: ["EQ-3.7", "OQ-12"], tables: ["TBL-10"] },
  heatingRevenue: { text: "results.heatingRevenue.text", formulas: ["EQ-3.9a"], tables: ["TBL-3", "TBL-6"] },
  coolingRevenue: { text: "results.coolingRevenue.text", formulas: ["EQ-3.9b"], tables: ["TBL-3", "TBL-6"] },
  connectionFeeRevenue: {
    text: "results.connectionFeeRevenue.text",
    formulas: ["EQ-3.10e", "EQ-3.9c"],
    tables: ["TBL-6"],
  },
  overallRevenue: {
    text: "results.overallRevenue.text",
    formulas: ["EQ-3.9a", "EQ-3.9b", "EQ-3.10e", "EQ-3.9c"],
    tables: ["TBL-6"],
  },
  networkInvestment: {
    text: "results.networkInvestment.text",
    formulas: ["EQ-3.4b", "EQ-3.10a"],
    tables: ["TBL-6"],
    manual: { manualNetworkLength: { drops: ["EQ-3.4b"] } },
  },
  supplyInvestment: {
    text: "results.supplyInvestment.text",
    formulas: ["EQ-3.8a", "EQ-3.10b", "EQ-3.10c"],
    tables: ["TBL-4", "TBL-6"],
  },
  heatPumpInvestment: { text: "results.heatPumpInvestment.text", formulas: ["EQ-3.10d"], tables: ["TBL-6"] },
  overallInvestment: {
    text: "results.overallInvestment.text",
    formulas: ["EQ-3.10a", "EQ-3.10b", "EQ-3.10c", "EQ-3.10d"],
    tables: ["TBL-6"],
  },
  annuityFactor: { text: "results.annuityFactor.text", formulas: ["EQ-3.10e"], tables: ["TBL-6"] },
  annualizedCosts: {
    text: "results.annualizedCosts.text",
    formulas: ["EQ-3.10d", "EQ-3.10e", "EQ-3.10f"],
    tables: ["TBL-6"],
  },
  electricityCosts: {
    text: "results.electricityCosts.text",
    formulas: ["EQ-3.8a", "EQ-3.8b", "EQ-3.11"],
    tables: ["TBL-4", "TBL-5", "TBL-6"],
  },
  operationAndMaintenance: {
    text: "results.operationAndMaintenance.text",
    formulas: ["EQ-3.10d", "EQ-3.12"],
    tables: [],
  },
  annualCosts: {
    text: "results.annualCosts.text",
    formulas: ["EQ-3.10f", "EQ-3.11", "EQ-3.12"],
    tables: [],
  },
  economicRatio: {
    text: "results.economicRatio.text",
    formulas: ["EQ-3.9c", "EQ-3.10f", "EQ-3.11", "EQ-3.12", "OQ-21"],
    tables: [],
  },
  level: {
    text: "results.level.text",
    formulas: ["EQ-3.3", "EQ-3.5", "EQ-3.6a", "EQ-3.6b", "OQ-21"],
    tables: ["TBL-7", "TBL-8", "TBL-9", "TBL-11"],
  },
} as const satisfies Record<string, ResultExplain>

export type ExplainedResult = keyof typeof RESULT_EXPLAIN

/** The explanation of a result value for the flags of a run (manual inputs replace estimates). */
export function explainResult(key: ExplainedResult, flags: QuickCheckFlags): Explanation {
  const entry: ResultExplain = RESULT_EXPLAIN[key]
  const active = (Object.keys(entry.manual ?? {}) as ManualFlag[]).filter((flag) => flags[flag])
  const variants = active.map((flag) => entry.manual![flag]!)
  const dropped = new Set(variants.flatMap((variant) => variant.drops))
  return {
    text: variants.find((variant) => variant.text)?.text ?? entry.text,
    formulas: entry.formulas.filter((id) => !dropped.has(id)),
    tables: entry.tables,
  }
}

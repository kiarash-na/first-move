import type calc from "@/dictionaries/en/calc.json"
import type { TableId } from "@/lib/project/catalog/references"
import { fieldsOf } from "@/lib/project/fields/registry"
import { stepEquations } from "@/lib/project/fields/step-equations"
import { QUICK_CHECK_STEPS, type QuickCheckStep } from "@/lib/project/fields/steps"
import type { QuickCheckFlags } from "../types"
import { FORMULA_IDS, type FormulaId } from "./formulas"

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

/**
 * Formulas from a resolved OQ answer, and the equation each one belongs after. The engine
 * computes these, so wherever the equation is listed the OQ formula follows it: EQ-3.7 has no
 * equation in the source (OQ-12), EQ-3.10d counts the installations twice as printed (OQ-17),
 * and E closes the cost chain after EQ-3.12 (OQ-21). OQ-06 (PV) applies only with PV, so it is
 * added by `pv` variants, not here.
 */
const RESOLVED_AFTER: Record<Exclude<FormulaId, `EQ-${string}`>, FormulaId> = {
  "OQ-06": "EQ-3.11",
  "OQ-12": "EQ-3.7",
  "OQ-17": "EQ-3.10d",
  "OQ-21": "EQ-3.12",
}
const ALWAYS_RESOLVED = ["OQ-12", "OQ-17"] as const

/** Every formula in methodology order, each OQ formula right after its equation. */
const METHODOLOGY_ORDER: readonly FormulaId[] = FORMULA_IDS.filter((id) => id.startsWith("EQ-")).flatMap((id) => [
  id,
  ...(Object.keys(RESOLVED_AFTER) as (keyof typeof RESOLVED_AFTER)[]).filter((oq) => RESOLVED_AFTER[oq] === id),
])

/** The ids in methodology order, without duplicates. */
export function inMethodologyOrder(ids: Iterable<FormulaId>): FormulaId[] {
  const wanted = new Set(ids)
  return METHODOLOGY_ORDER.filter((id) => wanted.has(id))
}

/** Adds the always-applied OQ formulas next to their equations (EQ-3.7 → OQ-12, EQ-3.10d → OQ-17). */
function withResolved(ids: readonly FormulaId[]): FormulaId[] {
  const used = new Set(ids)
  return inMethodologyOrder([...ids, ...ALWAYS_RESOLVED.filter((oq) => used.has(RESOLVED_AFTER[oq]))])
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
 * Formulas a step's sentence describes beyond the ones its inputs feed directly: buildings →
 * the per-group and total demand (EQ-3.2a-d), area → the length estimate from the density
 * (EQ-3.4a), sources → the coverage (EQ-3.6a/b).
 */
const STEP_EXTRA: Record<ExplainedStep, readonly FormulaId[]> = {
  area: ["EQ-3.4a"],
  buildings: ["EQ-3.2a", "EQ-3.2b", "EQ-3.2c", "EQ-3.2d"],
  sources: ["EQ-3.6a", "EQ-3.6b"],
  options: [],
  assumptions: [],
}

/** OQ formulas whose inputs are in the step (PV and its reduction cite OQ-06). */
function stepResolved(step: ExplainedStep): FormulaId[] {
  const cited = new Set(fieldsOf({ module: "quickCheck", step }).flatMap((field) => field.openQuestions))
  return (Object.keys(RESOLVED_AFTER) as (keyof typeof RESOLVED_AFTER)[]).filter((oq) => cited.has(oq))
}

/**
 * Per Quick Check step: the equations its inputs feed or replace (from the field registry,
 * `stepEquations`), the ones its sentence describes (`STEP_EXTRA`), the OQ formulas the engine
 * uses with them, and the `calc.steps.<step>` sentence.
 */
export const STEP_EXPLAIN = {} as Record<ExplainedStep, Explanation>
for (const step of [...QUICK_CHECK_STEPS, "assumptions"] as const) {
  STEP_EXPLAIN[step] = {
    text: `steps.${step}`,
    formulas: withResolved([...stepEquations("quickCheck", step), ...STEP_EXTRA[step], ...stepResolved(step)]),
    tables: STEP_TABLES[step],
  }
}

type VariantFlag = Extract<keyof QuickCheckFlags, "manualHeatingDemand" | "manualCoolingDemand" | "manualNetworkLength" | "pv">

interface Variant {
  /** Formulas that no longer apply (a manual input replaces the estimate). */
  drops?: readonly FormulaId[]
  /** OQ formulas that apply on top, listed right after their equation (PV: OQ-06 after EQ-3.11). */
  adds?: readonly (keyof typeof RESOLVED_AFTER)[]
  text?: CalcKey
}

interface ResultExplain extends Explanation {
  /** Per run flag: a manual input drops the estimate's formulas, PV adds OQ-06; either may change the sentence. */
  variants?: Partial<Record<VariantFlag, Variant>>
}

/** With PV, C_el is EQ-3.11 times (1 − PV cost reduction) (OQ-06). */
const WITH_PV = { pv: { adds: ["OQ-06"] } } as const

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
    variants: { manualHeatingDemand: { drops: HEATING_ESTIMATE, text: "results.heatingDemandKwh.manual" } },
  },
  coolingDemandKwh: {
    text: "results.coolingDemandKwh.text",
    formulas: COOLING_ESTIMATE,
    tables: ["TBL-2", "TBL-3"],
    variants: { manualCoolingDemand: { drops: COOLING_ESTIMATE, text: "results.coolingDemandKwh.manual" } },
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
    variants: { manualNetworkLength: { drops: LENGTH_ESTIMATE, text: "results.networkLengthM.manual" } },
  },
  heatDensityMwhPerM: {
    text: "results.heatDensityMwhPerM.text",
    formulas: ["EQ-3.2c", "EQ-3.4b", "EQ-3.5"],
    tables: ["TBL-9"],
    variants: { manualHeatingDemand: { drops: ["EQ-3.2c"] }, manualNetworkLength: { drops: ["EQ-3.4b"] } },
  },
  heatingSupplyKwh: { text: "results.heatingSupplyKwh.text", formulas: ["EQ-3.8a"], tables: ["TBL-4"] },
  coolingSupplyKwh: { text: "results.coolingSupplyKwh.text", formulas: ["EQ-3.8b"], tables: ["TBL-5"] },
  heatingCoverage: {
    text: "results.heatingCoverage.text",
    formulas: ["EQ-3.8a", "EQ-3.2c", "EQ-3.6a"],
    tables: ["TBL-4", "TBL-7"],
    variants: { manualHeatingDemand: { drops: ["EQ-3.2c"] } },
  },
  coolingCoverage: {
    text: "results.coolingCoverage.text",
    formulas: ["EQ-3.8b", "EQ-3.2d", "EQ-3.6b"],
    tables: ["TBL-5", "TBL-7"],
    variants: { manualCoolingDemand: { drops: ["EQ-3.2d"] } },
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
    variants: { manualNetworkLength: { drops: ["EQ-3.4b"] } },
  },
  supplyInvestment: {
    text: "results.supplyInvestment.text",
    formulas: ["EQ-3.8a", "EQ-3.10b", "EQ-3.10c"],
    tables: ["TBL-4", "TBL-6"],
  },
  heatPumpInvestment: { text: "results.heatPumpInvestment.text", formulas: ["EQ-3.10d", "OQ-17"], tables: ["TBL-6"] },
  overallInvestment: {
    text: "results.overallInvestment.text",
    formulas: ["EQ-3.10a", "EQ-3.10b", "EQ-3.10c", "EQ-3.10d", "OQ-17"],
    tables: ["TBL-6"],
  },
  annuityFactor: { text: "results.annuityFactor.text", formulas: ["EQ-3.10e"], tables: ["TBL-6"] },
  annualizedCosts: {
    text: "results.annualizedCosts.text",
    formulas: ["EQ-3.10d", "OQ-17", "EQ-3.10e", "EQ-3.10f"],
    tables: ["TBL-6"],
  },
  electricityCosts: {
    text: "results.electricityCosts.text",
    formulas: ["EQ-3.8a", "EQ-3.8b", "EQ-3.11"],
    tables: ["TBL-4", "TBL-5", "TBL-6"],
    variants: WITH_PV,
  },
  operationAndMaintenance: {
    text: "results.operationAndMaintenance.text",
    formulas: ["EQ-3.10d", "OQ-17", "EQ-3.12"],
    tables: [],
  },
  annualCosts: {
    text: "results.annualCosts.text",
    formulas: ["EQ-3.10f", "EQ-3.11", "EQ-3.12"],
    tables: [],
    variants: WITH_PV,
  },
  economicRatio: {
    text: "results.economicRatio.text",
    formulas: ["EQ-3.9c", "EQ-3.10f", "EQ-3.11", "EQ-3.12", "OQ-21"],
    tables: [],
    variants: WITH_PV,
  },
  level: {
    text: "results.level.text",
    formulas: ["EQ-3.3", "EQ-3.5", "EQ-3.6a", "EQ-3.6b", "OQ-21"],
    tables: ["TBL-7", "TBL-8", "TBL-9", "TBL-11"],
  },
} as const satisfies Record<string, ResultExplain>

export type ExplainedResult = keyof typeof RESULT_EXPLAIN

/**
 * The explanation of a result value for the flags of a run: manual inputs replace estimates,
 * PV adds its reduction (OQ-06), so the formulas listed reproduce the number shown.
 */
export function explainResult(key: ExplainedResult, flags: QuickCheckFlags): Explanation {
  const entry: ResultExplain = RESULT_EXPLAIN[key]
  const active = (Object.keys(entry.variants ?? {}) as VariantFlag[]).filter((flag) => flags[flag])
  const variants = active.map((flag) => entry.variants![flag]!)
  const dropped = new Set(variants.flatMap((variant) => variant.drops ?? []))
  const added = variants.flatMap((variant) => variant.adds ?? []) as (keyof typeof RESOLVED_AFTER)[]
  const after = (id: FormulaId) => added.filter((oq) => RESOLVED_AFTER[oq] === id)
  return {
    text: variants.find((variant) => variant.text)?.text ?? entry.text,
    formulas: entry.formulas.filter((id) => !dropped.has(id)).flatMap((id) => [id, ...after(id)]),
    tables: entry.tables,
  }
}

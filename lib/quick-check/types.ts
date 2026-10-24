import type { BuildingType } from "@/lib/project/catalog/building-types"
import type { ConstructionPeriod } from "@/lib/project/catalog/construction-periods"
import type { Potential } from "@/lib/project/catalog/potentials"
import type { SourceKey } from "@/lib/project/catalog/sources"
import type { FieldStep } from "@/lib/project/fields/steps"
import type {
  ChRatioClass,
  CoverageClass,
  DensityCategory,
  DensityClass,
  EconomicClass,
} from "./classify/rules.config"
import type { Drivers } from "./drivers"
import type { DominantDemand } from "./equations/eq-3-07-cooling-to-heating-ratio"
import type { OverallAssessment } from "./overall-rule"
import type { EffectiveParameters } from "./params"

/** What the UI must say about how a result came about (QCT-KF-06/07, D-10). */
export interface QuickCheckFlags {
  /** Required inputs are missing or the shares do not add up to 100 (R-03): no result. */
  incomplete: boolean
  /** A manual total replaces EQ-3.2c / EQ-3.2d (QCT-IN-05, OQ-05). */
  manualHeatingDemand: boolean
  manualCoolingDemand: boolean
  /** An entered network length replaces EQ-3.4a/b (QCT-IN-08); otherwise it is estimated (KF-07). */
  manualNetworkLength: boolean
  estimatedNetworkLength: boolean
  /** Parameter overrides are in use: "Custom parameters" badge (D-10). */
  customParameters: boolean
  /** PV lowers the electricity costs (QCT-IN-09, OQ-06). */
  pv: boolean
  /** Industry share > 0: forced Further analysis (QCT-RULE-INDUSTRY). */
  industry: boolean
  /** A selected source has Unknown potential: forced Further analysis (QCT-RULE-UNKNOWN, KF-06). */
  unknownSources: boolean
}

/** One cell (type i, period p) of the building stock (EQ-3.1, EQ-3.2a/b). */
export interface CellResult {
  type: BuildingType
  period: ConstructionPeriod
  /** s_i,p as a fraction (OQ-01). */
  share: number
  /** N_i,p, fractional (EQ-3.1). */
  buildings: number
  /** TBL-1/2/3 values used (0 for industry, OQ-02). */
  heatingDemandPerM2: number
  coolingDemandPerM2: number
  floorAreaM2: number
  hasDefaults: boolean
  /** EQ-3.2a / EQ-3.2b in kWh/a. */
  heatingDemandKwh: number
  coolingDemandKwh: number
}

/** One selected source (EQ-3.8a/b, EQ-3.10b, EQ-3.11). Unknown potential: all 0 (R-01). */
export interface SourceResult {
  source: SourceKey
  potential: Potential
  /** Q_heat,available (TBL-4 capacity of the level) and COP_H. */
  heatingAvailableKwh: number
  heatingCop: number | null
  /** EQ-3.8a in kWh/a. */
  heatingSupplyKwh: number
  /** Q_cool,available (TBL-5) and COP_C; a dash row has 0 and null (OQ-13). */
  coolingAvailableKwh: number
  coolingCop: number | null
  /** EQ-3.8b in kWh/a. */
  coolingSupplyKwh: number
  /** c_i in €/(kWh/a) (TBL-6; ambient air 0, OQ-18). */
  installationCostPerKwh: number
  /** C_i, EQ-3.10b, in €. */
  investment: number
  /** The source's EQ-3.11 term in €/a, before and after the PV reduction (OQ-06). */
  electricityCostsWithoutPv: number
  electricityCosts: number
}

/** Every intermediate value of methodology §3, in equation units. */
export interface QuickCheckValues {
  /** N_total (QCT-IN-01) and A_proj in m² (QCT-IN-02). */
  totalBuildings: number
  projectAreaM2: number
  /** EQ-3.2c / EQ-3.2d estimates in kWh/a, also when a manual total is used. */
  estimatedHeatingDemandKwh: number
  estimatedCoolingDemandKwh: number
  /** Q_heat,total / Q_cool,total used by every later equation: manual total or estimate. */
  heatingDemandKwh: number
  coolingDemandKwh: number
  /** EQ-3.3, buildings/ha (= N_ha, OQ-09). */
  buildingDensity: number
  /** EQ-3.4a, m/ha. */
  specificNetworkLength: number
  /** EQ-3.4b estimate in m, also when a length is entered. */
  estimatedNetworkLengthM: number
  /** l_total used: entered (QCT-IN-08) or estimated. */
  networkLengthM: number
  /** EQ-3.5 in kWh/m, and in MWh/m for TBL-9 and the UI (OQ-10). */
  heatDensityKwhPerM: number
  heatDensityMwhPerM: number
  /** Σ EQ-3.8a / Σ EQ-3.8b over the selected sources in kWh/a (OQ-11). */
  heatingSupplyKwh: number
  coolingSupplyKwh: number
  /** EQ-3.6a / EQ-3.6b as fractions; null when that demand is 0 (not relevant). */
  heatingCoverage: number | null
  coolingCoverage: number | null
  /** EQ-3.7 / OQ-12 (0–1) and the larger demand; null when both demands are 0. */
  chRatio: number | null
  dominantDemand: DominantDemand | null
  /** EQ-3.9a / EQ-3.9b in €/a, with their base-price and energy-price terms. */
  heatingRevenue: number
  heatingBaseRevenue: number
  heatingEnergyRevenue: number
  coolingRevenue: number
  coolingBaseRevenue: number
  coolingEnergyRevenue: number
  /** The p_connect · N_total · a term of EQ-3.9c in €/a. */
  connectionFeeRevenue: number
  /** EQ-3.9c in €/a. */
  overallRevenue: number
  /** EQ-3.10a, EQ-3.10c and the C_HP · N_total term of EQ-3.10d, in €. */
  networkInvestment: number
  supplyInvestment: number
  heatPumpInvestment: number
  /** EQ-3.10d (OQ-17) in €. */
  overallInvestment: number
  /** EQ-3.10e. */
  annuityFactor: number
  /** EQ-3.10f in €/a. */
  annualizedCosts: number
  /** EQ-3.11 in €/a (OQ-19), before and after the PV reduction (OQ-06). */
  electricityCostsWithoutPv: number
  electricityCosts: number
  /** EQ-3.12 in €/a. */
  operationAndMaintenance: number
  /** C_annual + C_el + C_O&M in €/a, the denominator of E (OQ-21). */
  annualCosts: number
  /** E = R_overall / annual costs (OQ-21); null when there are no annual costs. */
  economicRatio: number | null
}

/** The classes of methodology §4 (TBL-7..10), OQ-04 and OQ-21. */
export interface QuickCheckClasses {
  /** TBL-7, separately per demand (KF-03/04); null when that demand is not relevant. */
  heatingCoverage: CoverageClass | null
  coolingCoverage: CoverageClass | null
  /** TBL-8 and its rural / sub-urban / urban category (OQ-04). */
  buildingDensity: DensityClass
  densityCategory: DensityCategory
  /** TBL-9 (in MWh/m). */
  heatDensity: DensityClass
  /** TBL-10; null when not applicable. */
  chRatio: ChRatioClass | null
  /** OQ-21; null when E cannot be computed. */
  economic: EconomicClass | null
}

interface RunBase {
  flags: QuickCheckFlags
  /** The parameters in use (defaults + overrides), for the Assumptions page (D-10). */
  parameters: EffectiveParameters
}

/** No result yet (R-03, OQ-22): what is missing, by registry id and by step. */
export interface QuickCheckIncomplete extends RunBase {
  status: "incomplete"
  missing: string[]
  incompleteSteps: FieldStep[]
}

export interface QuickCheckComplete extends RunBase {
  status: "complete"
  values: QuickCheckValues
  cells: CellResult[]
  sources: SourceResult[]
  classes: QuickCheckClasses
  assessment: OverallAssessment
  drivers: Drivers
}

export type QuickCheckRun = QuickCheckIncomplete | QuickCheckComplete

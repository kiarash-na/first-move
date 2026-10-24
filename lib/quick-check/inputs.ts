import { BUILDING_TYPES, INDUSTRY, type BuildingType } from "@/lib/project/catalog/building-types"
import { CONSTRUCTION_PERIODS, type ConstructionPeriod } from "@/lib/project/catalog/construction-periods"
import type { Potential } from "@/lib/project/catalog/potentials"
import { SOURCES, type SourceKey } from "@/lib/project/catalog/sources"
import type { Project } from "@/lib/project/schema/project"
import { fromPercent } from "./params"

/** A selected energy source (QCT-IN-06) with its potential (QCT-IN-07). */
export interface SelectedSource {
  source: SourceKey
  potential: Potential
}

/** The project's Quick Check inputs in equation units. */
export interface EngineInputs {
  /** N_total (QCT-IN-01), industry included (R-02). */
  totalBuildings: number | null
  /** A_proj in m² (QCT-IN-02). */
  projectAreaM2: number | null
  /** s_i,p as fractions (OQ-01); an empty cell counts as 0. */
  shares: Record<BuildingType, Record<ConstructionPeriod, number>>
  /** Selected sources in TBL-4 order. */
  sources: SelectedSource[]
  /** QCT-IN-09 (OQ-06). */
  pv: boolean
  /** QCT-IN-05 totals in kWh/a; null = use the estimate (OQ-05). */
  manualHeatingDemandKwh: number | null
  manualCoolingDemandKwh: number | null
  /** QCT-IN-08 in m; null = estimate with EQ-3.4a/b. */
  manualNetworkLengthM: number | null
  /** Any industry share > 0 (QCT-RULE-INDUSTRY, OQ-02). */
  industry: boolean
  /** Selected sources with Unknown potential (QCT-RULE-UNKNOWN). */
  unknownSources: SourceKey[]
}

/** Reads the Quick Check inputs of a project. Pure; the project is already schema-valid. */
export function readInputs(project: Project): EngineInputs {
  const { buildings, sources, quickCheck } = project
  const shares = Object.fromEntries(
    BUILDING_TYPES.map((type) => [
      type,
      Object.fromEntries(CONSTRUCTION_PERIODS.map((period) => [period, fromPercent(buildings.shares[type][period] ?? 0)])),
    ]),
  ) as EngineInputs["shares"]
  const selected = SOURCES.flatMap((source): SelectedSource[] => {
    const potential = sources.potentials[source]
    return potential === null ? [] : [{ source, potential }]
  })
  return {
    totalBuildings: buildings.total,
    projectAreaM2: buildings.areaM2,
    shares,
    sources: selected,
    pv: sources.pv,
    manualHeatingDemandKwh: quickCheck.manualDemand.heatingKwhPerYear,
    manualCoolingDemandKwh: quickCheck.manualDemand.coolingKwhPerYear,
    manualNetworkLengthM: quickCheck.networkLengthM,
    industry: CONSTRUCTION_PERIODS.some((period) => (buildings.shares[INDUSTRY][period] ?? 0) > 0),
    unknownSources: selected.filter((entry) => entry.potential === "unknown").map((entry) => entry.source),
  }
}

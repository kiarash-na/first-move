import { ECONOMIC_PARAMETER_INFO, ECONOMIC_PARAMETERS } from "@/lib/project/catalog/economic-parameters"
import { CAPACITY_CELLS, type CapacityCell } from "@/lib/project/catalog/potentials"
import { SOURCE_CELLS, SOURCES, type Application } from "@/lib/project/catalog/sources"
import { bounds, fieldText, trace } from "./define"
import { ECONOMIC_LIMITS, LIMITS } from "./limits"
import type { FieldDef, FieldGroup } from "./types"

/**
 * "Play with parameters" (D-10) on the Assumptions page: overrides of TBL-4/5 (capacity, COP)
 * and TBL-6. Only cells with a default can be overridden (OQ-13). Labels: `quick-check`
 * dictionary (`sources`, `capacityCells`, `parameters`).
 */
const AREA = "quick-check"
const MODULE = "quickCheck"

const TABLES = { heating: "TBL-4", cooling: "TBL-5" } as const
const SUPPLY_EQUATION = { heating: "EQ-3.8a", cooling: "EQ-3.8b" } as const
const COP_LIMIT = { heating: LIMITS.heatingCop, cooling: LIMITS.coolingCop } as const

const groupId = (application: Application) => `quickCheck.overrides.${application}`

function cellField(application: Application, source: string, cell: CapacityCell): FieldDef {
  const isCop = cell === "cop"
  return {
    id: `${groupId(application)}.${source}.${cell}`,
    module: MODULE,
    step: "assumptions",
    kind: "number",
    ...(isCop ? {} : { unit: "kWh/a" }),
    ...bounds(isCop ? COP_LIMIT[application] : LIMITS.capacityKwhPerYear),
    text: fieldText(AREA, groupId(application)),
    nullable: true,
    emptyMeans: "default",
    required: false,
    group: groupId(application),
    row: source,
    column: cell,
    alsoShownIn: [],
    ...trace({
      requirements: ["QCT-REF-1.3"],
      openQuestions: isCop ? ["OQ-13", "OQ-14"] : ["OQ-26"],
      decisions: ["D-10"],
      feeds: isCop ? [SUPPLY_EQUATION[application], "EQ-3.11"] : [SUPPLY_EQUATION[application]],
      tables: [TABLES[application]],
    }),
  }
}

function capacityFields(application: Application): FieldDef[] {
  return SOURCES.flatMap((source) => SOURCE_CELLS[source][application].map((cell) => cellField(application, source, cell)))
}

const economicFields: FieldDef[] = ECONOMIC_PARAMETERS.map((key) => {
  const { unit, feeds, flags } = ECONOMIC_PARAMETER_INFO[key]
  const limit = ECONOMIC_LIMITS[key]
  return {
    id: `quickCheck.overrides.economic.${key}`,
    module: MODULE,
    step: "assumptions",
    kind: unit === "%" ? "percent" : limit.integer ? "integer" : "number",
    unit,
    ...bounds(limit),
    text: { area: AREA, key: `parameters.${key}` },
    nullable: true,
    emptyMeans: "default",
    required: false,
    group: "quickCheck.overrides.economic",
    row: key,
    alsoShownIn: [],
    ...trace({
      requirements: ["QCT-REF-1.4"],
      openQuestions: flags,
      decisions: ["D-10"],
      feeds,
      tables: ["TBL-6"],
    }),
  }
})

export const QUICK_CHECK_OVERRIDE_FIELDS: readonly FieldDef[] = [
  ...capacityFields("heating"),
  ...capacityFields("cooling"),
  ...economicFields,
]

function capacityGroup(application: Application): FieldGroup {
  return {
    id: groupId(application),
    module: MODULE,
    step: "assumptions",
    layout: "grid",
    text: fieldText(AREA, groupId(application)),
    rows: {
      keys: SOURCES.filter((source) => SOURCE_CELLS[source][application].length > 0),
      text: { area: AREA, key: "sources" },
    },
    columns: { keys: CAPACITY_CELLS, text: { area: AREA, key: "capacityCells" } },
    ...trace({
      requirements: ["QCT-REF-1.3"],
      openQuestions: ["OQ-13", "OQ-14", "OQ-26"],
      decisions: ["D-10"],
      feeds: [SUPPLY_EQUATION[application], "EQ-3.11"],
      tables: [TABLES[application]],
    }),
  }
}

export const QUICK_CHECK_OVERRIDE_GROUPS: readonly FieldGroup[] = [
  capacityGroup("heating"),
  capacityGroup("cooling"),
  {
    id: "quickCheck.overrides.economic",
    module: MODULE,
    step: "assumptions",
    layout: "list",
    text: fieldText(AREA, "quickCheck.overrides.economic"),
    rows: { keys: ECONOMIC_PARAMETERS, text: { area: AREA, key: "parameters" } },
    ...trace({
      requirements: ["QCT-REF-1.4"],
      openQuestions: ["OQ-01", "OQ-16", "OQ-18"],
      decisions: ["D-10"],
      feeds: [...new Set(ECONOMIC_PARAMETERS.flatMap((key) => ECONOMIC_PARAMETER_INFO[key].feeds))],
      tables: ["TBL-6"],
    }),
  },
]

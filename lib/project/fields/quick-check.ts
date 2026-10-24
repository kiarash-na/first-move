import { BUILDING_TYPES, INDUSTRY } from "@/lib/project/catalog/building-types"
import { CONSTRUCTION_PERIODS } from "@/lib/project/catalog/construction-periods"
import { POTENTIALS } from "@/lib/project/catalog/potentials"
import type { EquationId, TableId } from "@/lib/project/catalog/references"
import { hasCell, SOURCES, type SourceKey } from "@/lib/project/catalog/sources"
import { bounds, fieldText, trace } from "./define"
import { LIMITS, MIN_SELECTED_SOURCES, SHARE_SUM } from "./limits"
import { QUICK_CHECK_OVERRIDE_FIELDS, QUICK_CHECK_OVERRIDE_GROUPS } from "./quick-check-overrides"
import type { DerivedValue, FieldDef, FieldGroup, StepRef } from "./types"

/**
 * Quick Check inputs (QCT-IN-00..09), one entry per input. Building stock and sources are
 * shared with Business Plan step 1 (D-01). Labels: `quick-check` dictionary.
 */
const AREA = "quick-check"
const MODULE = "quickCheck"
const BUSINESS_PLAN_STEP_1: readonly StepRef[] = [{ module: "businessPlan", step: "opportunity" }]

const SHARES = "buildings.shares"
const POTENTIALS_GROUP = "sources.potentials"

/** The equations and tables a selected source feeds, from its TBL-4/5 cells (OQ-13). */
function sourceTrace(source: SourceKey) {
  const cools = hasCell(source, "cooling", "low")
  const usesElectricity = hasCell(source, "heating", "cop") || hasCell(source, "cooling", "cop")
  const feeds: EquationId[] = ["EQ-3.8a", ...(cools ? (["EQ-3.8b"] as const) : []), "EQ-3.10b"]
  if (usesElectricity) feeds.push("EQ-3.11")
  const tables: TableId[] = ["TBL-4", ...(cools ? (["TBL-5"] as const) : []), "TBL-6"]
  return trace({
    requirements: ["QCT-IN-06", "QCT-IN-07", "QCT-RULE-UNKNOWN"],
    openQuestions: ["OQ-11", "OQ-13", "OQ-14", "OQ-26"],
    decisions: ["R-01"],
    feeds,
    tables,
  })
}

const shareCells: FieldDef[] = BUILDING_TYPES.flatMap((type) =>
  CONSTRUCTION_PERIODS.map(
    (period): FieldDef => ({
      id: `${SHARES}.${type}.${period}`,
      module: MODULE,
      step: "buildings",
      kind: "percent",
      unit: "%",
      ...bounds(LIMITS.share),
      text: fieldText(AREA, SHARES),
      nullable: true,
      emptyMeans: "not-entered",
      required: false,
      group: SHARES,
      row: type,
      column: period,
      alsoShownIn: BUSINESS_PLAN_STEP_1,
      ...trace({
        requirements: type === INDUSTRY ? ["QCT-IN-04", "QCT-RULE-INDUSTRY"] : ["QCT-IN-04"],
        openQuestions: type === INDUSTRY ? ["OQ-01", "OQ-02", "OQ-03"] : ["OQ-01", "OQ-03"],
        decisions: ["D-31", "R-03"],
        feeds: ["EQ-3.1"],
        tables: ["TBL-1", "TBL-2", "TBL-3"],
      }),
    }),
  ),
)

const sourceFields: FieldDef[] = SOURCES.map((source) => ({
  id: `${POTENTIALS_GROUP}.${source}`,
  module: MODULE,
  step: "sources",
  kind: "choice",
  options: POTENTIALS,
  optionText: { area: AREA, key: "potentials" },
  text: { area: AREA, key: `sources.${source}` },
  nullable: true,
  emptyMeans: "not-selected",
  required: false,
  group: POTENTIALS_GROUP,
  row: source,
  alsoShownIn: BUSINESS_PLAN_STEP_1,
  ...sourceTrace(source),
}))

export const QUICK_CHECK_FIELDS: readonly FieldDef[] = [
  {
    id: "buildings.total",
    module: MODULE,
    step: "area",
    kind: "integer",
    ...bounds(LIMITS.buildingsTotal),
    text: fieldText(AREA, "buildings.total"),
    nullable: true,
    emptyMeans: "not-entered",
    required: true,
    alsoShownIn: BUSINESS_PLAN_STEP_1,
    ...trace({
      requirements: ["QCT-IN-01"],
      openQuestions: ["OQ-02"],
      decisions: ["R-02"],
      feeds: ["EQ-3.1", "EQ-3.3", "EQ-3.9c", "EQ-3.10d"],
    }),
  },
  {
    id: "buildings.areaM2",
    module: MODULE,
    step: "area",
    kind: "number",
    unit: "m²",
    ...bounds(LIMITS.areaM2),
    companion: "hectares",
    text: fieldText(AREA, "buildings.areaM2"),
    nullable: true,
    emptyMeans: "not-entered",
    required: true,
    alsoShownIn: BUSINESS_PLAN_STEP_1,
    ...trace({ requirements: ["QCT-IN-02"], decisions: ["D-31"], feeds: ["EQ-3.3", "EQ-3.4b"] }),
  },
  ...shareCells,
  ...sourceFields,
  {
    id: "quickCheck.manualDemand.heatingKwhPerYear",
    module: MODULE,
    step: "options",
    kind: "number",
    unit: "kWh/a",
    ...bounds(LIMITS.manualDemandKwhPerYear),
    text: fieldText(AREA, "quickCheck.manualDemand.heatingKwhPerYear"),
    nullable: true,
    emptyMeans: "estimated",
    required: false,
    group: "quickCheck.manualDemand",
    alsoShownIn: [],
    ...trace({
      requirements: ["QCT-IN-05"],
      openQuestions: ["OQ-05"],
      replaces: ["EQ-3.2c"],
      feeds: ["EQ-3.5", "EQ-3.6a", "EQ-3.7", "EQ-3.9a"],
    }),
  },
  {
    id: "quickCheck.manualDemand.coolingKwhPerYear",
    module: MODULE,
    step: "options",
    kind: "number",
    unit: "kWh/a",
    ...bounds(LIMITS.manualDemandKwhPerYear),
    text: fieldText(AREA, "quickCheck.manualDemand.coolingKwhPerYear"),
    nullable: true,
    emptyMeans: "estimated",
    required: false,
    group: "quickCheck.manualDemand",
    alsoShownIn: [],
    ...trace({
      requirements: ["QCT-IN-05"],
      openQuestions: ["OQ-05", "OQ-07"],
      replaces: ["EQ-3.2d"],
      feeds: ["EQ-3.6b", "EQ-3.7", "EQ-3.9b"],
    }),
  },
  {
    id: "quickCheck.networkLengthM",
    module: MODULE,
    step: "options",
    kind: "number",
    unit: "m",
    ...bounds(LIMITS.networkLengthM),
    text: fieldText(AREA, "quickCheck.networkLengthM"),
    nullable: true,
    emptyMeans: "estimated",
    required: false,
    alsoShownIn: [],
    ...trace({
      requirements: ["QCT-IN-08", "QCT-KF-07"],
      openQuestions: ["OQ-09"],
      replaces: ["EQ-3.4a", "EQ-3.4b"],
      feeds: ["EQ-3.5", "EQ-3.10a"],
    }),
  },
  {
    id: "sources.pv",
    module: MODULE,
    step: "options",
    kind: "boolean",
    text: fieldText(AREA, "sources.pv"),
    nullable: false,
    required: false,
    alsoShownIn: [],
    ...trace({
      requirements: ["QCT-IN-09"],
      openQuestions: ["OQ-01", "OQ-06"],
      feeds: ["EQ-3.11"],
      tables: ["TBL-6"],
    }),
  },
  ...QUICK_CHECK_OVERRIDE_FIELDS,
]

export const QUICK_CHECK_GROUPS: readonly FieldGroup[] = [
  {
    id: SHARES,
    module: MODULE,
    step: "buildings",
    layout: "grid",
    text: fieldText(AREA, SHARES),
    rows: { keys: BUILDING_TYPES, text: { area: AREA, key: "buildingTypes" } },
    columns: { keys: CONSTRUCTION_PERIODS, text: { area: AREA, key: "periods" } },
    rule: { kind: "sum", ...SHARE_SUM },
    ...trace({
      requirements: ["QCT-IN-04", "QCT-RULE-INDUSTRY"],
      openQuestions: ["OQ-01", "OQ-02", "OQ-03"],
      decisions: ["D-31", "R-03"],
      feeds: ["EQ-3.1"],
      tables: ["TBL-1", "TBL-2", "TBL-3"],
    }),
  },
  {
    id: POTENTIALS_GROUP,
    module: MODULE,
    step: "sources",
    layout: "list",
    text: fieldText(AREA, POTENTIALS_GROUP),
    rows: { keys: SOURCES, text: { area: AREA, key: "sources" } },
    rule: { kind: "min-selected", min: MIN_SELECTED_SOURCES },
    ...trace({
      requirements: ["QCT-IN-06", "QCT-IN-07", "QCT-RULE-UNKNOWN"],
      openQuestions: ["OQ-11", "OQ-13", "OQ-26"],
      decisions: ["R-01"],
      feeds: ["EQ-3.8a", "EQ-3.8b", "EQ-3.10b", "EQ-3.11"],
      tables: ["TBL-4", "TBL-5", "TBL-6"],
    }),
  },
  {
    id: "quickCheck.manualDemand",
    module: MODULE,
    step: "options",
    layout: "section",
    text: fieldText(AREA, "quickCheck.manualDemand"),
    ...trace({ requirements: ["QCT-IN-05"], openQuestions: ["OQ-05"], replaces: ["EQ-3.2c", "EQ-3.2d"] }),
  },
  ...QUICK_CHECK_OVERRIDE_GROUPS,
]

/** QCT-IN-03: the density category is derived from the TBL-8 class of ρ_building, not entered (OQ-04). */
export const QUICK_CHECK_DERIVED: readonly DerivedValue[] = [
  {
    id: "densityCategory",
    module: MODULE,
    step: "area",
    text: { area: AREA, key: "derived.densityCategory" },
    options: ["rural", "sub_urban", "urban"],
    optionText: { area: AREA, key: "derived.densityCategory.options" },
    computedBy: ["EQ-3.3"],
    tables: ["TBL-8"],
    requirements: ["QCT-IN-03"],
    openQuestions: ["OQ-04", "OQ-09"],
  },
]

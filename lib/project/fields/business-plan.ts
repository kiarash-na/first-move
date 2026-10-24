import { CANVAS_BLOCKS } from "@/lib/project/catalog/canvas-blocks"
import { SCENARIO_IDS } from "@/lib/project/catalog/scenarios"
import { fieldText, trace } from "./define"
import { TEXT_LIMITS } from "./limits"
import type { BusinessPlanStep } from "./steps"
import type { FieldDef, FieldGroup, FieldTrace, ItemPropertyDef, ItemsField } from "./types"

/**
 * Business Plan inputs (BM-STEP-01..04): a qualitative workspace (D-27), all free text stored
 * as typed. The site is shared with the Quick Check project (D-01). Labels: `business-plan`
 * dictionary.
 */
const AREA = "business-plan"
const MODULE = "businessPlan"

/** Every V01 scenario states these site facts, so presets can prefill them (OQ-25). */
const SCENARIO_FACT = trace({
  requirements: ["BM-STEP-01", "BM-SCN-01", "BM-SCN-02", "BM-SCN-03", "BM-SCN-04"],
  openQuestions: ["OQ-25"],
})

interface Options {
  step: BusinessPlanStep
  group?: string
  trace: FieldTrace
}

function textField(id: string, kind: "text" | "longText", { step, group, trace: meta }: Options): FieldDef {
  return {
    id,
    module: MODULE,
    step,
    kind,
    maxLength: kind === "text" ? TEXT_LIMITS.short : TEXT_LIMITS.long,
    text: fieldText(AREA, id),
    nullable: false,
    required: false,
    ...(group && { group }),
    alsoShownIn: [],
    ...meta,
  }
}

function textListField(id: string, { step, group, trace: meta }: Options): FieldDef {
  return {
    id,
    module: MODULE,
    step,
    kind: "textList",
    maxLength: TEXT_LIMITS.short,
    maxItems: TEXT_LIMITS.listEntries,
    text: fieldText(AREA, id),
    nullable: false,
    required: false,
    ...(group && { group }),
    alsoShownIn: [],
    ...meta,
  }
}

function itemsField(
  id: string,
  properties: readonly Omit<ItemPropertyDef, "text" | "maxLength">[],
  { step, trace: meta }: Options,
): ItemsField {
  return {
    id,
    module: MODULE,
    step,
    kind: "items",
    maxItems: TEXT_LIMITS.listItems,
    properties: properties.map((property) => ({
      ...property,
      ...(property.kind === "text" && { maxLength: TEXT_LIMITS.short }),
      ...(property.kind === "longText" && { maxLength: TEXT_LIMITS.long }),
      text: { area: AREA, key: `fields.${id}.item.${property.key}` },
    })),
    text: fieldText(AREA, id),
    nullable: false,
    required: false,
    alsoShownIn: [],
    ...meta,
  }
}

function longTexts(prefix: string, keys: readonly string[], step: BusinessPlanStep, meta: FieldTrace): FieldDef[] {
  return keys.map((key) => textField(`${prefix}.${key}`, "longText", { step, group: prefix, trace: meta }))
}

const STEP_1 = trace({ requirements: ["BM-STEP-01"] })
const STEP_2 = trace({ requirements: ["BM-STEP-02"] })
const STEP_3 = trace({ requirements: ["BM-STEP-03"], decisions: ["D-27"] })
const STEP_4 = trace({ requirements: ["BM-STEP-04"] })

export const BUSINESS_PLAN_FIELDS: readonly FieldDef[] = [
  // BM-STEP-01 · Define the opportunity
  textField("site.name", "text", { step: "opportunity", group: "site", trace: STEP_1 }),
  textField("site.location", "text", { step: "opportunity", group: "site", trace: STEP_1 }),
  textField("site.siteType", "text", { step: "opportunity", group: "site", trace: SCENARIO_FACT }),
  textField("site.ownership", "longText", { step: "opportunity", group: "site", trace: SCENARIO_FACT }),
  textField("site.units", "text", { step: "opportunity", group: "site", trace: SCENARIO_FACT }),
  textListField("site.currentSupply", { step: "opportunity", group: "site", trace: SCENARIO_FACT }),
  textListField("site.stakeholders", { step: "opportunity", group: "site", trace: SCENARIO_FACT }),
  textListField("site.partners", { step: "opportunity", group: "site", trace: SCENARIO_FACT }),
  {
    id: "businessPlan.scenarioId",
    module: MODULE,
    step: "opportunity",
    kind: "choice",
    options: SCENARIO_IDS,
    optionText: { area: AREA, key: "scenarios" },
    text: fieldText(AREA, "businessPlan.scenarioId"),
    nullable: true,
    emptyMeans: "not-selected",
    required: false,
    alsoShownIn: [],
    ...trace({ requirements: ["BM-SCOPE-05", "BM-SCOPE-06"], openQuestions: ["OQ-25"] }),
  },
  ...longTexts(
    "businessPlan.opportunity",
    ["customerSegments", "needs", "heatSources", "painPoint", "alternatives", "advantage"],
    "opportunity",
    STEP_1,
  ),

  // BM-STEP-02 · Build the business logic
  ...longTexts("businessPlan.canvas", CANVAS_BLOCKS, "business-logic", STEP_2),
  itemsField(
    "businessPlan.allocation",
    [
      { key: "stakeholder", kind: "text" },
      { key: "investment", kind: "longText" },
      { key: "risk", kind: "longText" },
      { key: "benefit", kind: "longText" },
    ],
    { step: "business-logic", trace: trace({ requirements: ["BM-STEP-02", "BM-SCOPE-03"] }) },
  ),

  // BM-STEP-03 · Run the Reality Check
  ...longTexts(
    "businessPlan.assumptions",
    ["connectionRate", "tariffs", "capex", "financing", "subsidies"],
    "reality-check",
    STEP_3,
  ),
  itemsField(
    "businessPlan.criticalAssumptions",
    [
      { key: "statement", kind: "longText" },
      { key: "validation", kind: "longText" },
    ],
    { step: "reality-check", trace: STEP_3 },
  ),
  itemsField(
    "businessPlan.risks",
    [
      { key: "title", kind: "text" },
      { key: "description", kind: "longText" },
      { key: "dealBreaker", kind: "boolean" },
      { key: "validation", kind: "longText" },
    ],
    { step: "reality-check", trace: STEP_3 },
  ),

  // BM-STEP-04 · Improve & prepare implementation
  ...longTexts("businessPlan.refinements", ["feedback", "changes"], "implementation", STEP_4),
  ...longTexts("businessPlan.scalability", ["geographical", "economic", "organisational"], "implementation", STEP_4),
  ...longTexts(
    "businessPlan.nextSteps",
    ["data", "stakeholders", "partnerships", "pilots", "decisions"],
    "implementation",
    STEP_4,
  ),
]

function section(id: string, step: BusinessPlanStep, meta: FieldTrace): FieldGroup {
  return { id, module: MODULE, step, layout: "section", text: fieldText(AREA, id), ...meta }
}

export const BUSINESS_PLAN_GROUPS: readonly FieldGroup[] = [
  section("site", "opportunity", trace({ requirements: ["BM-STEP-01"], openQuestions: ["OQ-25"] })),
  section("businessPlan.opportunity", "opportunity", STEP_1),
  section("businessPlan.canvas", "business-logic", STEP_2),
  section("businessPlan.assumptions", "reality-check", STEP_3),
  section("businessPlan.refinements", "implementation", STEP_4),
  section("businessPlan.scalability", "implementation", STEP_4),
  section("businessPlan.nextSteps", "implementation", STEP_4),
]

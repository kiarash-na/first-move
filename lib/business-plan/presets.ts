import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { ProjectPatch } from "@/lib/project/apply-patch"
import type { ScenarioId } from "@/lib/project/catalog/scenarios"
import { getAt, parsePath } from "@/lib/project/path"
import type { Project } from "@/lib/project/schema/project"
import { isTextFilled } from "./filled"

/** The scenarios that have a preset; `custom` is a use case of the team's own (OQ-25). */
export const PRESET_SCENARIOS = ["BM-SCN-01", "BM-SCN-02", "BM-SCN-03", "BM-SCN-04"] as const satisfies readonly ScenarioId[]

export type PresetScenario = (typeof PRESET_SCENARIOS)[number]

export const isPresetScenario = (id: unknown): id is PresetScenario =>
  typeof id === "string" && (PRESET_SCENARIOS as readonly string[]).includes(id)

/**
 * The site fields a scenario table can state (BM-SCN-01..04), in the order the preview lists
 * them. A preset sets only the ones its scenario states (OQ-25); nothing is invented.
 */
export const PRESET_FIELDS = ["siteType", "stakeholders", "ownership", "partners", "units", "currentSupply"] as const

export type PresetField = (typeof PRESET_FIELDS)[number]

const siteKey = (field: PresetField) => `site.${field}`

/** The `presets` node of the `business-plan` dictionary (stated facts, in the UI language). */
export type PresetTexts = Dictionary<"business-plan">["presets"]

type StatedFacts = Partial<Record<PresetField, string | readonly string[]>>

/** The facts one scenario states, as the dictionary holds them. */
export function presetFacts(texts: PresetTexts, scenario: PresetScenario): StatedFacts {
  return texts[scenario] as StatedFacts
}

/** The stated fields of a scenario, in display order. */
export function presetFieldsOf(texts: PresetTexts, scenario: PresetScenario): PresetField[] {
  const facts = presetFacts(texts, scenario)
  return PRESET_FIELDS.filter((field) => facts[field] !== undefined)
}

/**
 * The patch that selects a scenario: `businessPlan.scenarioId` plus exactly the site fields the
 * scenario states (OQ-25, BM-SCOPE-05). `custom` only records the choice and prefills nothing.
 */
export function presetPatch(scenario: ScenarioId, texts: PresetTexts): ProjectPatch {
  const patch: Record<string, unknown> = { "businessPlan.scenarioId": scenario }
  if (!isPresetScenario(scenario)) return patch
  const facts = presetFacts(texts, scenario)
  for (const field of presetFieldsOf(texts, scenario)) {
    const value = facts[field]
    patch[siteKey(field)] = Array.isArray(value) ? [...value] : value
  }
  return patch
}

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Site fields the patch would replace with something else while they hold the team's own text:
 * the UI asks before it overwrites them (D-02).
 */
export function presetOverwrites(project: Project, patch: ProjectPatch): PresetField[] {
  return PRESET_FIELDS.filter((field) => {
    if (!(siteKey(field) in patch)) return false
    const current = getAt(project, parsePath(siteKey(field)) ?? [])
    const filled = Array.isArray(current) ? current.some(isTextFilled) : isTextFilled(current)
    return filled && !sameValue(current, patch[siteKey(field)])
  })
}

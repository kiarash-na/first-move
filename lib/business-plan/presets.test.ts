import { describe, expect, it } from "vitest"
import businessPlan from "@/dictionaries/en/business-plan.json"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import { SCENARIO_IDS } from "@/lib/project/catalog/scenarios"
import { fieldsOf } from "@/lib/project/fields/registry"
import { PRESET_FIELDS, PRESET_SCENARIOS, isPresetScenario, presetFieldsOf, presetOverwrites, presetPatch } from "./presets"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const texts = businessPlan.presets
const empty = () => createProject({ modules: { businessPlan: true } })

/** The facts a scenario file states, as `Label: value` lines. */
function stated(id: string): Record<string, string> {
  const file = readFileSync(join(process.cwd(), `docs/20_business-models/00_scope/scenarios/scenario-0${id.slice(-1)}.md`), "utf8")
  return Object.fromEntries([...file.matchAll(/^- \*\*(.+?):\*\* (.+)$/gm)].map((match) => [match[1], match[2]]))
}

describe("scenario presets (OQ-25)", () => {
  it("cover BM-SCN-01..04 and a custom use case", () => {
    expect(PRESET_SCENARIOS).toEqual(SCENARIO_IDS.filter((id) => id !== "custom"))
    expect(isPresetScenario("BM-SCN-02")).toBe(true)
    expect(isPresetScenario("custom")).toBe(false)
  })

  it("only ever set site fields that exist in the registry", () => {
    const siteFields = fieldsOf({ module: "businessPlan", step: "opportunity" }).map((field) => field.id)
    for (const field of PRESET_FIELDS) expect(siteFields).toContain(`site.${field}`)
  })

  it.each(PRESET_SCENARIOS)("%s prefills exactly the fields the scenario states", (id) => {
    const patch = presetPatch(id, texts)
    const facts = stated(id)
    const expected = ["businessPlan.scenarioId"]
    expected.push("site.siteType", "site.stakeholders", "site.ownership", "site.units")
    if (facts["Other Partners"] !== "To be identified") expected.push("site.partners")
    if (facts["Current Energy Supply"] !== "Not specified") expected.push("site.currentSupply")
    expect(Object.keys(patch).sort()).toEqual(expected.sort())
    // the values are the stated ones
    const lower = (value: unknown) => String(value).toLowerCase()
    expect((patch["site.stakeholders"] as string[]).map(lower)).toEqual(facts.Stakeholders.split(", ").map(lower))
    expect(lower(patch["site.units"])).toBe(lower(facts["Units / Buildings"].replace("–", "-")))
    expect(lower(patch["site.ownership"])).toBe(lower(facts["Property & Usage Types"]))
    expect(lower(patch["site.siteType"])).toBe(lower(facts.Location))
  })

  it("is valid input for applyPatch and leaves everything else untouched", () => {
    const before = empty()
    const result = applyPatch(before, presetPatch("BM-SCN-03", texts), { atomic: true })
    expect(result.errors).toEqual([])
    expect(result.project.businessPlan.scenarioId).toBe("BM-SCN-03")
    expect(result.project.site.currentSupply).toEqual(["Natural gas", "Biomass"])
    expect(result.project.site.name).toBe("")
    expect(result.project.site.partners).toEqual([])
    expect(result.project.businessPlan.opportunity).toEqual(before.businessPlan.opportunity)
    expect(result.project.businessPlan.canvas).toEqual(before.businessPlan.canvas)
  })

  it("lists the stated fields in display order", () => {
    expect(presetFieldsOf(texts, "BM-SCN-01")).toEqual(["siteType", "stakeholders", "ownership", "partners", "units"])
    expect(presetFieldsOf(texts, "BM-SCN-03")).toEqual(["siteType", "stakeholders", "ownership", "units", "currentSupply"])
  })

  it("a custom use case only records the choice", () => {
    expect(presetPatch("custom", texts)).toEqual({ "businessPlan.scenarioId": "custom" })
  })

  it("reports the fields that would replace the team's own text", () => {
    const own = applyPatch(empty(), { "site.siteType": "My town", "site.units": "3-20 buildings", "site.partners": [] }).project
    const patch = presetPatch("BM-SCN-03", texts)
    expect(presetOverwrites(own, patch)).toEqual(["siteType"]) // units already equal, others empty
    expect(presetOverwrites(empty(), patch)).toEqual([])
    expect(presetOverwrites(own, presetPatch("custom", texts))).toEqual([])
  })
})

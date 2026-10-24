import { describe, expect, it } from "vitest"
import { createProject } from "@/lib/project"
import { EN_TEXTS } from "./test-utils/texts"
import { validateProposal } from "./validate"

const project = createProject({ modules: { quickCheck: true, businessPlan: true }, now: new Date("2026-10-24T10:00:00Z") })
const entry = (key: string, value: unknown, label = key) => ({ key, value, label, sources: [{ quote: "q" }] })

describe("validateProposal", () => {
  it("splits entries into those that apply and those that fail, with the UI's message", () => {
    const result = validateProposal(project, [entry("buildings.total", 120), entry("buildings.areaM2", -5, "Total project area")], EN_TEXTS)
    expect(result.patch).toEqual({ "buildings.total": 120 })
    expect(result.valid.map((valid) => valid.key)).toEqual(["buildings.total"])
    expect(result.invalid).toEqual([expect.objectContaining({ key: "buildings.areaM2", code: "above", message: "Enter a value above 0." })])
  })

  it("does not change the project", () => {
    const before = JSON.stringify(project)
    validateProposal(project, [entry("buildings.total", 120)], EN_TEXTS)
    expect(JSON.stringify(project)).toBe(before)
  })

  it("reports a group rule left unmet as incomplete, not as an error", () => {
    const result = validateProposal(project, [entry("buildings.shares.residential.until_1919", 60)], EN_TEXTS)
    expect(result.invalid).toEqual([])
    expect(result.incomplete).toEqual([{ id: "buildings.shares", label: "Share of buildings", rule: expect.objectContaining({ kind: "sum", target: 100 }), value: 60 }])
    const complete = validateProposal(project, [entry("buildings.shares.residential.until_1919", 60), entry("buildings.shares.residential.1919_1960", 40)], EN_TEXTS)
    expect(complete.incomplete).toEqual([])
  })

  it("matches errors inside a list value to its entry, and falls back to the English detail without texts", () => {
    const tooMany = Array.from({ length: 31 }, (_, index) => `Stakeholder ${index}`)
    const [invalid] = validateProposal(project, [entry("site.stakeholders", tooMany)], {}).invalid
    expect(invalid).toMatchObject({ key: "site.stakeholders", code: "too-many" })
    expect(invalid.message.length).toBeGreaterThan(0)
  })
})

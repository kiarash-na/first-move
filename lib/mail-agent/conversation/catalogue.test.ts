// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { businessPlanCatalogue, quickCheckCatalogue, scopeCatalogue } from "./catalogue"
import { loadTexts, type MailTexts } from "./texts"

let t: MailTexts
beforeAll(async () => {
  t = await loadTexts("en")
})

describe("quickCheckCatalogue", () => {
  it("offers the project name and every Quick Check input, no parameter overrides", () => {
    const ids = quickCheckCatalogue(t).fields.map((field) => field.id)
    expect(ids[0]).toBe("meta.name")
    expect(ids).toContain("buildings.total")
    expect(ids).toContain("buildings.shares.residential.1961_1990")
    expect(ids).toContain("sources.potentials.ground_water")
    expect(ids).toContain("quickCheck.networkLengthM")
    expect(ids.some((id) => id.startsWith("quickCheck.overrides"))).toBe(false)
  })
})

describe("scopeCatalogue", () => {
  it("joins the Quick Check and the Business Plan steps in play", () => {
    const ids = scopeCatalogue({ quickCheck: true, bpSteps: ["implementation"] }, t).fields.map((field) => field.id)
    expect(ids).toContain("buildings.total")
    expect(ids).toContain("businessPlan.nextSteps.pilots")
    expect(ids).not.toContain("businessPlan.canvas.channels")
    expect(scopeCatalogue({ quickCheck: false, bpSteps: [] }, t).fields).toEqual([])
  })
})

describe("businessPlanCatalogue", () => {
  it("offers one step's fields, with row properties for lists", () => {
    const ids = businessPlanCatalogue(t, ["reality-check"]).fields.map((field) => field.id)
    expect(ids).toContain("businessPlan.assumptions.tariffs")
    expect(ids).toContain("businessPlan.risks[].dealBreaker")
    expect(ids).not.toContain("site.name")
  })
})

import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/quick-check.json"
import { getExample, localizeExample } from "@/lib/examples"
import { lookup } from "@/lib/i18n/lookup"
import { applyPatch, createProject } from "@/lib/project"
import { QUICK_CHECK_STEPS } from "@/lib/project/fields/steps"
import { quickCheckInputs } from "./quick-check-inputs"

const example = () => localizeExample(getExample("housing-cooperatives")!, "en")
const empty = () => createProject({ modules: { quickCheck: true }, now: new Date("2026-10-24T08:00:00Z") })

describe("quickCheckInputs (PLAN-DASH-13)", () => {
  it("lists the four input steps in order, every label resolving to copy", () => {
    const steps = quickCheckInputs(example())
    expect(steps.map((entry) => entry.step)).toEqual([...QUICK_CHECK_STEPS])
    for (const { inputs } of steps) {
      expect(inputs.length).toBeGreaterThan(0)
      for (const input of inputs) for (const part of input.label) expect(lookup(en, part.key), part.key).not.toBeNull()
    }
  })

  it("prints the area with its hectares and the building count as numbers", () => {
    const area = quickCheckInputs(example()).find((entry) => entry.step === "area")!.inputs
    expect(area.find((input) => input.id === "buildings.areaM2")?.value).toMatchObject({ kind: "number", unit: "m²", hectares: true })
    expect(area.find((input) => input.id === "buildings.total")?.value).toMatchObject({ kind: "number", hectares: false })
  })

  it("lists only the building shares above 0, each with its type and period", () => {
    const project = example()
    const shares = quickCheckInputs(project).find((entry) => entry.step === "buildings")!.inputs
    expect(shares.length).toBeGreaterThan(0)
    for (const share of shares) {
      expect(share.label).toHaveLength(2)
      expect(share.value.kind).toBe("percent")
      if (share.value.kind === "percent") expect(share.value.value).toBeGreaterThan(0)
    }
    const total = shares.reduce((sum, share) => sum + (share.value.kind === "percent" ? share.value.value : 0), 0)
    expect(total).toBeCloseTo(100)
  })

  it("says what an empty value stands for: not entered, not selected or estimated", () => {
    const steps = quickCheckInputs(empty())
    const byId = new Map(steps.flatMap((entry) => entry.inputs).map((input) => [input.id, input.value]))
    expect(byId.get("buildings.total")).toEqual({ kind: "empty", means: "not-entered" })
    expect(byId.get("buildings.shares")).toEqual({ kind: "empty", means: "not-entered" })
    expect(byId.get("sources.potentials.geothermal")).toEqual({ kind: "empty", means: "not-selected" })
    expect(byId.get("quickCheck.networkLengthM")).toEqual({ kind: "empty", means: "estimated" })
    expect(byId.get("quickCheck.manualDemand.heatingKwhPerYear")).toEqual({ kind: "empty", means: "estimated" })
  })

  it("names a chosen potential by its option and PV as yes or no", () => {
    const { project } = applyPatch(empty(), { "sources.potentials.waste_heat": "high", "sources.pv": true })
    const byId = new Map(quickCheckInputs(project).flatMap((entry) => entry.inputs).map((input) => [input.id, input.value]))
    expect(byId.get("sources.potentials.waste_heat")).toEqual({ kind: "choice", option: { area: "quick-check", key: "potentials.high.label" } })
    expect(byId.get("sources.pv")).toEqual({ kind: "boolean", value: true })
  })

  it("leaves the parameter overrides to the tables", () => {
    const ids = quickCheckInputs(example()).flatMap((entry) => entry.inputs.map((input) => input.id))
    expect(ids.some((id) => id.startsWith("quickCheck.overrides"))).toBe(false)
  })
})

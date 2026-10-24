// @vitest-environment node
import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import { inputStatus } from "./input-status"

const base = () => createProject({ modules: { quickCheck: true, businessPlan: true } })

describe("inputStatus", () => {
  it("lists what an empty Quick Check still needs, by step", () => {
    expect(inputStatus(base(), "quickCheck")).toEqual({
      complete: false,
      missing: ["buildings.total", "buildings.areaM2", "buildings.shares", "sources.potentials"],
      incompleteSteps: ["area", "buildings", "sources"],
    })
  })

  it("is complete with buildings, area, shares of 100 % and a source", () => {
    const project = applyPatch(base(), {
      "buildings.total": 10,
      "buildings.areaM2": 20_000,
      "buildings.shares.residential.2011_today": 100,
      "sources.potentials.ground_water": "medium",
    }).project
    expect(inputStatus(project, "quickCheck")).toEqual({ complete: true, missing: [], incompleteSteps: [] })
  })

  it("stays incomplete while the shares do not add up to 100 (R-03)", () => {
    const project = applyPatch(base(), {
      "buildings.total": 10,
      "buildings.areaM2": 20_000,
      "buildings.shares.residential.2011_today": 90,
      "sources.potentials.ground_water": "medium",
    }).project
    expect(inputStatus(project, "quickCheck")).toMatchObject({ complete: false, missing: ["buildings.shares"] })
  })

  it("has no required Business Plan inputs (D-27)", () => {
    expect(inputStatus(base(), "businessPlan")).toEqual({ complete: true, missing: [], incompleteSteps: [] })
  })
})

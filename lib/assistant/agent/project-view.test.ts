import { describe, expect, it } from "vitest"
import { applyPatch, createProject } from "@/lib/project"
import { run } from "@/lib/quick-check"
import { projectView } from "./project-view"
import { dashboardTexts, exampleProject } from "./test-utils/context"

describe("projectView", () => {
  it("shows the filled inputs with labels, units and the engine's result (en)", async () => {
    const project = exampleProject("en")
    const view = projectView(project, await dashboardTexts("en"), "en")
    expect(view.name).toBe(project.meta.name)
    expect(view.modules).toEqual({ quickCheck: true, businessPlan: true })
    const buildings = view.filled.find((field) => field.id === "buildings.total")
    expect(buildings).toMatchObject({ value: project.buildings.total, section: "Quick Check · Project area" })
    expect(buildings?.label).toBeTruthy()
    const area = view.filled.find((field) => field.id === "buildings.areaM2")
    expect(area?.unit).toBe("m²")
    const result = run(project)
    expect(result.status).toBe("complete")
    expect(view.quickCheck).toMatchObject({ status: "complete", level: result.status === "complete" ? result.assessment.level : null })
    expect(view.quickCheck.status === "complete" && view.quickCheck.levelLabel).toBeTruthy()
  })

  it("uses the UI language for labels (de)", async () => {
    const view = projectView(exampleProject("de"), await dashboardTexts("de"), "de")
    expect(view.filled.find((field) => field.id === "buildings.total")?.section).toBe("Quick Check · Projektgebiet")
  })

  it("lists empty inputs, required first, and says when the Quick Check is incomplete", async () => {
    const project = createProject({ id: "00000000-0000-4000-9000-000000000001", name: "Empty", modules: { quickCheck: true, businessPlan: false }, now: new Date("2026-10-25T08:00:00.000Z") })
    const view = projectView(project, await dashboardTexts("en"), "en")
    expect(view.filled.every((field) => typeof field.value === "boolean")).toBe(true)
    expect(view.empty[0].required).toBe(true)
    expect(view.quickCheck).toMatchObject({ status: "incomplete" })
    expect(view.aiPlanScore).toBeNull()
  })

  it("marks AI-proposed values and cuts long texts", async () => {
    const base = exampleProject("en")
    const long = "x".repeat(2000)
    const { project } = applyPatch(base, { "site.ownership": long }, { provenance: { by: "assistant", model: "test/model" } })
    const field = projectView(project, await dashboardTexts("en"), "en").filled.find((entry) => entry.id === "site.ownership")
    expect(field?.ai).toBe(true)
    expect(String(field?.value).length).toBeLessThan(700)
  })
})

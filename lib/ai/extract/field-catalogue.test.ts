import { describe, expect, it } from "vitest"
import { fieldsOf } from "@/lib/project"
import { fieldCatalogue } from "./field-catalogue"
import { EN_TEXTS } from "./test-utils/texts"

const byId = (scope: Parameters<typeof fieldCatalogue>[0]) => new Map(fieldCatalogue(scope, "en", EN_TEXTS).fields.map((field) => [field.id, field]))

describe("fieldCatalogue", () => {
  it("lists a module's input fields in registry order, without the parameter playground by default", () => {
    const catalogue = fieldCatalogue({ modules: ["quickCheck"] }, "en", EN_TEXTS)
    expect(catalogue.lang).toBe("en")
    expect(catalogue.fields.map((field) => field.id)).toEqual(fieldsOf({ module: "quickCheck" }).filter((field) => field.step !== "assumptions").map((field) => field.id))
  })

  it("includes the steps it is asked for", () => {
    const fields = fieldCatalogue({ modules: ["quickCheck"], steps: ["assumptions"] }, "en", EN_TEXTS).fields
    expect(fields.length).toBeGreaterThan(0)
    expect(fields.every((field) => field.step === "assumptions" && field.section === "Quick Check · Assumptions")).toBe(true)
  })

  it("describes numbers with unit and bounds, and keeps required and requirement IDs", () => {
    const fields = byId({ modules: ["quickCheck"] })
    expect(fields.get("buildings.total")).toMatchObject({
      kind: "integer",
      min: 1,
      max: 100_000,
      required: true,
      requirements: ["QCT-IN-01"],
      section: "Quick Check · Project area",
      help: "All buildings in the project area, including industrial buildings.",
    })
    expect(fields.get("buildings.areaM2")).toMatchObject({ kind: "number", unit: "m²", exclusiveMin: 0 })
  })

  it("gives grid cells the group's text once, not a copy of it as their help", () => {
    const cell = byId({ modules: ["quickCheck"] }).get("buildings.shares.residential.until_1919")
    expect(cell).toMatchObject({ kind: "percent", unit: "%", group: { id: "buildings.shares", label: "Share of buildings" } })
    expect(cell?.help).toBeUndefined()
    expect(cell?.group?.help).toContain("100")
  })

  it("lists choice options with their labels", () => {
    expect(byId({ modules: ["quickCheck"] }).get("sources.potentials.geothermal")?.options).toEqual([
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "unknown", label: "Unknown" },
    ])
  })

  it("expands item lists into one entry per row property, and keeps text lists whole", () => {
    const fields = byId({ modules: ["businessPlan"] })
    expect(fields.get("businessPlan.risks[].title")).toMatchObject({
      fieldId: "businessPlan.risks",
      property: "title",
      kind: "text",
      maxItems: 30,
      listLabel: expect.any(String),
    })
    expect(fields.get("businessPlan.risks[].dealBreaker")).toMatchObject({ kind: "boolean" })
    expect(fields.has("businessPlan.risks")).toBe(false)
    expect(fields.get("site.stakeholders")).toMatchObject({ kind: "textList", maxLength: 200, maxItems: 30 })
  })
})

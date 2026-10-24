import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import type { Project } from "@/lib/project/schema/project"
import { isFieldFilled, isTextFilled, rowsStatus } from "./filled"

const empty = () => createProject({ modules: { businessPlan: true } })

function patched(patch: Record<string, unknown>): Project {
  const result = applyPatch(empty(), patch, { atomic: true })
  expect(result.errors).toEqual([])
  return result.project
}

describe("isTextFilled", () => {
  it("needs a visible character, but never changes the text", () => {
    expect(isTextFilled("")).toBe(false)
    expect(isTextFilled("  \n ")).toBe(false)
    expect(isTextFilled(" Heat ")).toBe(true)
    expect(isTextFilled(null)).toBe(false)
    expect(isTextFilled(3)).toBe(false)
  })
})

describe("rowsStatus", () => {
  const risk = (patch: Record<string, string>) => ({ id: "r1", title: "", description: "", dealBreaker: false, validation: "", ...patch })

  it("counts complete rows and half-filled rows, and ignores blank rows", () => {
    const project = patched({
      "businessPlan.risks": [
        risk({ id: "a", title: "Few connect", description: "Low rate", validation: "Survey" }),
        risk({ id: "b", title: "Only a title" }),
        risk({ id: "c" }),
      ],
    })
    expect(rowsStatus(project, "businessPlan.risks")).toEqual({ complete: 1, partial: 1 })
  })

  it("treats the deal-breaker flag as not part of completeness", () => {
    const project = patched({ "businessPlan.risks": [risk({ title: "t", description: "d", validation: "v" })] })
    expect(rowsStatus(project, "businessPlan.risks").complete).toBe(1)
  })

  it("is empty for an empty project", () => {
    expect(rowsStatus(empty(), "businessPlan.allocation")).toEqual({ complete: 0, partial: 0 })
  })
})

describe("isFieldFilled", () => {
  it("handles each kind of field", () => {
    const project = patched({
      "site.name": "Village",
      "site.stakeholders": ["", "Hotel"],
      "businessPlan.scenarioId": "custom",
      "businessPlan.criticalAssumptions": [{ id: "a", statement: "Owners connect", validation: "" }],
    })
    expect(isFieldFilled(project, "site.name", "text")).toBe(true)
    expect(isFieldFilled(project, "site.location", "text")).toBe(false)
    expect(isFieldFilled(project, "site.stakeholders", "textList")).toBe(true)
    expect(isFieldFilled(project, "site.partners", "textList")).toBe(false)
    expect(isFieldFilled(project, "businessPlan.scenarioId", "choice")).toBe(true)
    expect(isFieldFilled(empty(), "businessPlan.scenarioId", "choice")).toBe(false)
    // a half-filled row keeps the list from counting as done (validation for each assumption)
    expect(isFieldFilled(project, "businessPlan.criticalAssumptions", "items")).toBe(false)
  })
})

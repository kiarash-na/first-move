import { describe, expect, it } from "vitest"
import { EXAMPLES, localizeExample } from "@/lib/examples"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import { fieldsOf } from "@/lib/project/fields/registry"
import { BUSINESS_PLAN_STEPS } from "@/lib/project/fields/steps"
import { OPTIONAL_FIELDS, allProgress, overallProgress, stepProgress } from "./progress"

const empty = () => createProject({ modules: { businessPlan: true } })

describe("step progress (BM-SCOPE-11, D-28)", () => {
  it("is zero for an empty project and counts the registry fields of each step", () => {
    const project = empty()
    for (const step of BUSINESS_PLAN_STEPS) {
      const progress = stepProgress(project, step)
      expect(progress.done).toBe(0)
      expect(progress.fraction).toBe(0)
      const fields = fieldsOf({ module: "businessPlan", step }).filter((field) => !OPTIONAL_FIELDS.includes(field.id))
      expect(progress.total).toBe(fields.length)
    }
    expect(overallProgress(allProgress(project))).toBe(0)
  })

  it("moves with each patched field and is independent per step", () => {
    const first = applyPatch(empty(), { "businessPlan.opportunity.painPoint": "High gas bills", "site.name": "Village" }).project
    const progress = stepProgress(first, "opportunity")
    expect(progress.done).toBe(2)
    expect(progress.missing).not.toContain("site.name")
    expect(progress.missing).toContain("businessPlan.opportunity.needs")
    expect(stepProgress(first, "business-logic").done).toBe(0)
    expect(stepProgress(first, "implementation").done).toBe(0)
  })

  it("does not require optional fields, but counts them when filled", () => {
    const base = empty()
    expect(stepProgress(base, "opportunity").missing).not.toContain("site.currentSupply")
    expect(stepProgress(base, "opportunity").missing).not.toContain("site.partners")
    const filled = applyPatch(base, { "site.partners": ["Municipality"] }).project
    expect(stepProgress(filled, "opportunity").done).toBe(1)
    expect(stepProgress(filled, "opportunity").total).toBe(stepProgress(base, "opportunity").total + 1)
  })

  it("counts a list of rows only when a row is complete and none is half filled", () => {
    const row = (patch: Record<string, string>) => ({ id: "x1", statement: "", validation: "", ...patch })
    const half = applyPatch(empty(), { "businessPlan.criticalAssumptions": [row({ statement: "Owners connect" })] }).project
    expect(stepProgress(half, "reality-check").missing).toContain("businessPlan.criticalAssumptions")
    const done = applyPatch(half, { "businessPlan.criticalAssumptions.0.validation": "Ask the owners" }).project
    expect(stepProgress(done, "reality-check").missing).not.toContain("businessPlan.criticalAssumptions")
  })

  it.each(EXAMPLES.map((example) => example.id))("is complete for the example %s", (id) => {
    const project = localizeExample(EXAMPLES.find((example) => example.id === id)!, "en")
    for (const progress of allProgress(project)) expect(progress.missing, `${id}: ${progress.step}`).toEqual([])
    expect(overallProgress(allProgress(project))).toBe(1)
  })
})

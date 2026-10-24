import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/business-plan.json"
import { EXAMPLES, localizeExample } from "@/lib/examples"
import { lookup } from "@/lib/i18n/lookup"
import { applyPatch, createListItem, createProject } from "@/lib/project"
import { BUSINESS_PLAN_STEPS } from "@/lib/project/fields/steps"
import { businessPlanEntries } from "./business-plan-entries"

const empty = () => createProject({ modules: { businessPlan: true }, now: new Date("2026-10-24T08:00:00Z") })
const withPlan = () =>
  EXAMPLES.map((example) => localizeExample(example, "en")).find((project) => project.meta.modules.businessPlan)!

describe("businessPlanEntries (PLAN-DASH-13)", () => {
  it("has the four steps in order, with nothing for an empty plan", () => {
    const steps = businessPlanEntries(empty())
    expect(steps.map((entry) => entry.step)).toEqual([...BUSINESS_PLAN_STEPS])
    for (const step of steps) {
      expect(step.entries).toEqual([])
      expect(step.progress.done).toBe(0)
    }
  })

  it("prints what an example plan holds, every label resolving to copy", () => {
    const steps = businessPlanEntries(withPlan())
    expect(steps.some((step) => step.entries.length > 0)).toBe(true)
    for (const step of steps) {
      for (const entry of step.entries) {
        expect(lookup(en, entry.label.key), entry.label.key).not.toBeNull()
        if (entry.answer.kind === "rows")
          for (const row of entry.answer.rows) for (const cell of row.cells) expect(lookup(en, cell.label.key), cell.label.key).not.toBeNull()
        if (entry.answer.kind === "choice") expect(lookup(en, entry.answer.option.key)).not.toBeNull()
      }
    }
  })

  it("keeps text as typed, drops blank list entries and blank rows, and prints a deal breaker only when set", () => {
    let project = empty()
    project = applyPatch(project, {
      "businessPlan.opportunity.needs": "  Cheaper heat\nfor 40 homes ",
      "site.stakeholders": ["Municipality", " ", "Cooperative"],
      "businessPlan.risks": [
        { ...createListItem("businessPlan.risks"), title: "Permits", dealBreaker: true },
        { ...createListItem("businessPlan.risks"), title: "", description: " " },
        { ...createListItem("businessPlan.risks"), title: "Prices", dealBreaker: false },
      ],
    }).project
    const entries = new Map(businessPlanEntries(project).flatMap((step) => step.entries).map((entry) => [entry.id, entry.answer]))
    expect(entries.get("businessPlan.opportunity.needs")).toEqual({ kind: "text", text: "  Cheaper heat\nfor 40 homes " })
    expect(entries.get("site.stakeholders")).toEqual({ kind: "list", items: ["Municipality", "Cooperative"] })
    const risks = entries.get("businessPlan.risks")
    expect(risks?.kind).toBe("rows")
    if (risks?.kind !== "rows") return
    expect(risks.rows).toHaveLength(2)
    expect(risks.rows[0].cells.map((cell) => cell.value)).toEqual(["Permits", true])
    expect(risks.rows[1].cells.map((cell) => cell.value)).toEqual(["Prices"])
  })
})

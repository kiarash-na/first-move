import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import businessPlan from "@/dictionaries/en/business-plan.json"
import { EXAMPLES, localizeExample } from "@/lib/examples"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import { getField } from "@/lib/project/fields/registry"
import { nextCheck, pitchReadiness } from "./readiness"
import { CHECKS, JURY_CRITERIA, PITCH_SECTIONS } from "./readiness-checks"

const empty = () => createProject({ modules: { businessPlan: true } })
const doc = (path: string) => readFileSync(join(process.cwd(), "docs", path), "utf8")

describe("pitch readiness definitions", () => {
  it("has the six pitch sections of BM-SCOPE-07 and the five V01 jury criteria of BM-SCOPE-08", () => {
    expect(PITCH_SECTIONS).toHaveLength(6)
    expect(JURY_CRITERIA).toHaveLength(5)
    const pitch = doc("20_business-models/00_scope/bm-scope-07_deliverables.md")
    for (const name of ["Use Case & Value Proposition", "Business Model", "Economic & Practical Feasibility", "Reality Check", "Scalability & Replicability", "Next Steps"]) {
      expect(pitch).toContain(`- ${name}:`)
    }
    expect(doc("20_business-models/00_scope/bm-scope-08_jury-criteria_v01.md").match(/^- /gm)).toHaveLength(5)
  })

  it("points every check at a real registry field, and every id has EN copy", () => {
    for (const [id, check] of Object.entries(CHECKS)) {
      expect(getField(check.field), id).toBeDefined()
      expect(getField(check.field)!.step, id).toBe(check.step)
      expect((businessPlan.readiness.checks as Record<string, string>)[id], id).toBeTruthy()
    }
  })

  it("has copy for every section and criterion", () => {
    for (const section of PITCH_SECTIONS) {
      const copy = businessPlan.readiness.sections[section.id]
      expect(copy.label && copy.question).toBeTruthy()
    }
    for (const criterion of JURY_CRITERIA) expect(businessPlan.readiness.jury[criterion.id].label).toBeTruthy()
    expect(businessPlan.readiness.jury.note).toMatch(/not an official/)
    expect(businessPlan.readiness.unofficial).toBe("Unofficial")
  })

  it("uses only known checks and every check is used at least once", () => {
    const used = new Set<string>([...PITCH_SECTIONS, ...JURY_CRITERIA].flatMap((entry) => entry.checks))
    for (const id of Object.keys(CHECKS)) expect(used.has(id), `${id} is unused`).toBe(true)
  })
})

describe("pitchReadiness", () => {
  it("is not started for an empty project", () => {
    const readiness = pitchReadiness(empty())
    expect(readiness.level).toBe("not-started")
    expect(readiness.score).toBe(0)
    expect(readiness.sections).toHaveLength(6)
    expect(readiness.jury).toHaveLength(5)
    expect(readiness.sections.every((section) => section.met === 0 && section.total > 0)).toBe(true)
    expect(nextCheck(readiness)?.id).toBe("site")
  })

  it("scores a section by the share of its checks that are met", () => {
    const project = applyPatch(empty(), {
      "businessPlan.scalability.geographical": "Other valleys",
      "businessPlan.scalability.economic": "Higher gas price",
    }).project
    const scalability = pitchReadiness(project).sections.find((section) => section.id === "scalability")!
    expect(scalability.met).toBe(2)
    expect(scalability.total).toBe(3)
    expect(scalability.score).toBeCloseTo(2 / 3)
    expect(pitchReadiness(project).level).toBe("in-progress")
    // the score is the mean of the six sections
    expect(pitchReadiness(project).score).toBeCloseTo(2 / 3 / 6)
  })

  it("moves the V01 criteria with the same fields", () => {
    const project = applyPatch(empty(), {
      "businessPlan.scalability.geographical": "x",
      "businessPlan.scalability.economic": "x",
      "businessPlan.scalability.organisational": "x",
      "businessPlan.refinements.changes": "x",
    }).project
    const criterion = pitchReadiness(project).jury.find((entry) => entry.id === "scalabilityClarity")!
    expect(criterion.score).toBe(1)
  })

  it("needs a complete row, no half-filled row, and one flagged deal-breaker for the reality check", () => {
    const risk = (patch: object) => ({ id: "a", title: "Few connect", description: "Low rate", validation: "Survey", dealBreaker: false, ...patch })
    const section = (project: ReturnType<typeof empty>) => pitchReadiness(project).sections.find((entry) => entry.id === "realityCheck")!
    const base = applyPatch(empty(), { "businessPlan.risks": [risk({})] }).project
    expect(section(base).checks.find((check) => check.id === "risks")!.met).toBe(true)
    expect(section(base).checks.find((check) => check.id === "dealBreaker")!.met).toBe(false)
    const marked = applyPatch(base, { "businessPlan.risks.0.dealBreaker": true }).project
    expect(section(marked).checks.find((check) => check.id === "dealBreaker")!.met).toBe(true)
    const half = applyPatch(marked, { "businessPlan.risks": [risk({ dealBreaker: true }), risk({ id: "b", validation: "", description: "" })] }).project
    expect(section(half).checks.find((check) => check.id === "risks")!.met).toBe(false)
  })

  it("never judges text: blank spaces do not count", () => {
    const project = applyPatch(empty(), { "businessPlan.opportunity.painPoint": "   " }).project
    expect(pitchReadiness(project).sections[0].checks.find((check) => check.id === "painPoint")!.met).toBe(false)
  })

  it.each(EXAMPLES.map((example) => example.id))("shows full readiness for the example %s", (id) => {
    const project = localizeExample(EXAMPLES.find((example) => example.id === id)!, "en")
    const readiness = pitchReadiness(project)
    for (const section of readiness.sections) expect(section.checks.filter((check) => !check.met).map((check) => check.id), `${id}: ${section.id}`).toEqual([])
    expect(readiness.score).toBe(1)
    expect(readiness.level).toBe("ready")
    expect(readiness.jury.every((criterion) => criterion.score === 1)).toBe(true)
    expect(nextCheck(readiness)).toBeNull()
  })
})

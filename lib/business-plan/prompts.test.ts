import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import businessPlan from "@/dictionaries/en/business-plan.json"
import { BUSINESS_PLAN_STEPS } from "@/lib/project/fields/steps"
import { INFO_LINK_5GDHC, PROMPTS, promptsFor } from "./prompts"

const doc = (path: string) => readFileSync(join(process.cwd(), "docs", path), "utf8")

describe("guiding prompts", () => {
  it("have EN copy for every prompt, kind and heading (D-32)", () => {
    for (const prompt of PROMPTS) {
      expect(typeof (businessPlan.prompts as Record<string, unknown>)[prompt.id], prompt.id).toBe("string")
      expect(businessPlan.prompts.kind[prompt.kind]).toBeTruthy()
    }
    const ids = PROMPTS.map((prompt) => prompt.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("give every step prompts, in the step order", () => {
    for (const step of BUSINESS_PLAN_STEPS) expect(promptsFor(step).length).toBeGreaterThanOrEqual(4)
    expect(promptsFor("opportunity")[0].id).toBe("motivation")
  })

  it("cover each key question of BM-SCOPE-03 that a step can answer", () => {
    const sources = new Set(PROMPTS.filter((prompt) => prompt.source === "BM-SCOPE-03").map((prompt) => prompt.id))
    // questions 1-7 of BM-SCOPE-03 (plus the V01 one) and the steps they belong to
    expect(["motivation", "resilience", "whoPays", "whoOperates", "distribution", "framework", "reliability", "scaleHere"].every((id) => sources.has(id))).toBe(true)
    expect(doc("20_business-models/00_scope/bm-scope-03_key-questions.md")).toContain("Who benefits and who pays?")
  })

  it("cite sources that exist in docs/", () => {
    const known = [
      "20_business-models/00_scope/bm-scope-03_key-questions.md",
      "20_business-models/00_scope/bm-scope-09_expected-outcome.md",
      "01_shared/alg-project/organisational-learnings.md",
      "01_shared/alg-project/use-case-learnings.md",
      "01_shared/alg-project/tips-for-the-challenge.md",
      "01_shared/alg-project/project-focus.md",
      "01_shared/alg-project/what-is-5gdhc.md",
      "01_shared/alg-project/vienna-heating-plan.md",
      "01_shared/alg-project/examples-in-practice.md",
      "01_shared/5gdhc-context.md",
      "20_business-models/00_scope/bm-scope-10_tips-and-templates_v01.md",
    ].map(doc)
    for (const source of new Set(PROMPTS.map((prompt) => prompt.source))) {
      expect(known.some((text) => text.includes(`id: ${source}`)), source).toBe(true)
    }
  })

  it("use the covered project knowledge: ALG-07, ALG-08, SHARED-CONTEXT and the BM-SCOPE-10 tip with its information link", () => {
    const sources = new Set(PROMPTS.map((prompt) => prompt.source))
    for (const id of ["ALG-07", "ALG-08", "SHARED-CONTEXT", "BM-SCOPE-10"]) expect(sources.has(id), id).toBe(true)
    expect(PROMPTS.find((prompt) => prompt.source === "ALG-08")?.step).toBe("implementation")
    expect(doc("20_business-models/00_scope/bm-scope-10_tips-and-templates_v01.md")).toContain(INFO_LINK_5GDHC)
    for (const prompt of PROMPTS.filter((item) => item.href)) {
      expect((businessPlan.prompts.links as Record<string, string>)[prompt.id], prompt.id).toBeTruthy()
    }
  })
})

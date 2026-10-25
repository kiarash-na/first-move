import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { lookup } from "@/lib/i18n/lookup"
import { navSections, routeModule } from "./nav"

const both = { quickCheck: true, businessPlan: true }

describe("navSections (D-07)", () => {
  it("lists overview, the Quick Check steps and results, the Business Plan steps and assumptions", () => {
    const ids = navSections(both).map((section) => [section.id, section.items.map((item) => item.id)])
    expect(ids).toEqual([
      ["project", ["overview", "assumptions"]],
      ["quickCheck", ["quickCheck.area", "quickCheck.buildings", "quickCheck.sources", "quickCheck.options", "quickCheck.results"]],
      [
        "businessPlan",
        [
          "businessPlan.opportunity",
          "businessPlan.business-logic",
          "businessPlan.reality-check",
          "businessPlan.implementation",
          "businessPlan.aiScore",
        ],
      ],
    ])
  })

  it("numbers input steps only", () => {
    const qc = navSections(both)[1]
    expect(qc.items.map((item) => item.step)).toEqual([1, 2, 3, 4, null])
  })

  it("shows a module section only when the module is on", () => {
    expect(navSections({ quickCheck: false, businessPlan: true }).map((section) => section.id)).toEqual(["project", "businessPlan"])
    const qcOnly = navSections({ quickCheck: true, businessPlan: false })
    expect(qcOnly.map((section) => section.id)).toEqual(["project", "quickCheck"])
    expect(qcOnly[0].items.map((item) => item.id)).toEqual(["overview", "assumptions"])
  })

  it("ends the Business Plan section with the AI Plan Score, without a step number (D-71)", () => {
    const bp = navSections(both)[2]
    expect(bp.items.at(-1)).toEqual({ id: "businessPlan.aiScore", route: { page: "ai-score" }, tone: "hot", step: null })
    expect(bp.items.map((item) => item.step)).toEqual([1, 2, 3, 4, null])
  })

  it("uses the brand role of each module", () => {
    expect(navSections(both).map((section) => section.tone)).toEqual(["neutral", "cool", "hot"])
  })

  it("has EN copy for every section and item", () => {
    for (const section of navSections(both)) {
      expect(lookup(shell, `nav.sections.${section.id}`), section.id).not.toBeNull()
      for (const item of section.items) expect(lookup(shell, `nav.items.${item.id}`), item.id).not.toBeNull()
    }
  })

  it("knows the module of each route", () => {
    expect(routeModule({ page: "overview" })).toBeNull()
    expect(routeModule({ page: "start" })).toBeNull()
    expect(routeModule({ page: "assumptions" })).toBe("quickCheck")
    expect(routeModule({ page: "quick-check", step: "area" })).toBe("quickCheck")
    expect(routeModule({ page: "business-plan", step: "opportunity" })).toBe("businessPlan")
    expect(routeModule({ page: "ai-score" })).toBe("businessPlan")
  })
})

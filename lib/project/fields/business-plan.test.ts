// @vitest-environment node
import { describe, expect, it } from "vitest"
import { BUSINESS_PLAN_STEPS } from "./steps"
import { BUSINESS_PLAN_FIELDS, BUSINESS_PLAN_GROUPS } from "./business-plan"

const field = (id: string) => BUSINESS_PLAN_FIELDS.find((entry) => entry.id === id)!
const ofStep = (step: string) => BUSINESS_PLAN_FIELDS.filter((entry) => entry.step === step)

describe("Business Plan fields", () => {
  it("fills every step, citing its BM-STEP requirement", () => {
    BUSINESS_PLAN_STEPS.forEach((step, index) => {
      expect(ofStep(step).length, step).toBeGreaterThan(0)
      expect(ofStep(step).some((entry) => entry.requirements.includes(`BM-STEP-0${index + 1}`)), step).toBe(true)
    })
  })

  it("keeps the site facts a scenario can prefill (OQ-25)", () => {
    for (const id of ["site.siteType", "site.ownership", "site.units", "site.currentSupply", "site.stakeholders", "site.partners"]) {
      expect(field(id).requirements, id).toContain("BM-SCN-01")
      expect(field(id).openQuestions, id).toEqual(["OQ-25"])
    }
    expect(field("businessPlan.scenarioId")).toMatchObject({ kind: "choice", nullable: true })
  })

  it("has a ten-block canvas and the stakeholder allocation (BM-STEP-02)", () => {
    expect(BUSINESS_PLAN_FIELDS.filter((entry) => entry.group === "businessPlan.canvas")).toHaveLength(10)
    const allocation = field("businessPlan.allocation")
    expect(allocation.kind === "items" && allocation.properties.map((property) => property.key)).toEqual([
      "stakeholder",
      "investment",
      "risk",
      "benefit",
    ])
  })

  it("has a risk register with a deal-breaker flag and validation (BM-STEP-03)", () => {
    const risks = field("businessPlan.risks")
    expect(risks.kind).toBe("items")
    if (risks.kind !== "items") return
    expect(risks.properties.find((property) => property.key === "dealBreaker")?.kind).toBe("boolean")
    expect(risks.properties.find((property) => property.key === "validation")?.text.key).toBe(
      "fields.businessPlan.risks.item.validation",
    )
  })

  it("stores all text as typed: never null, never required (D-27)", () => {
    const textual = BUSINESS_PLAN_FIELDS.filter((entry) => entry.id !== "businessPlan.scenarioId")
    expect(textual.every((entry) => !entry.nullable && !entry.required)).toBe(true)
  })

  it("groups step fields into section cards", () => {
    expect(BUSINESS_PLAN_GROUPS.every((group) => group.layout === "section")).toBe(true)
  })
})

import { describe, expect, it } from "vitest"
import { getExample, localizeExample } from "@/lib/examples"
import { applyPatch } from "@/lib/project"
import { dealBreaker, namedRisks, topRisks } from "./risks"

const project = localizeExample(getExample("housing-cooperatives")!, "en")

function withRisks(risks: { title: string; dealBreaker: boolean }[]) {
  const result = applyPatch(
    project,
    { "businessPlan.risks": risks.map((risk, index) => ({ id: `r${index}`, description: "", validation: "", ...risk })) },
    { atomic: true },
  )
  expect(result.ok).toBe(true)
  return result.project
}

describe("overview risks", () => {
  it("finds exactly one deal-breaker in every example", () => {
    expect(dealBreaker(project)).not.toBeNull()
    expect(topRisks(project)[0].dealBreaker).toBe(true)
  })

  it("skips risks without a title and puts the deal-breaker first", () => {
    const edited = withRisks([
      { title: "  ", dealBreaker: false },
      { title: "Tariff acceptance", dealBreaker: false },
      { title: "Grid connection", dealBreaker: true },
      { title: "Permits", dealBreaker: false },
      { title: "Supply", dealBreaker: false },
    ])
    expect(namedRisks(edited).map((risk) => risk.title)).toEqual(["Tariff acceptance", "Grid connection", "Permits", "Supply"])
    expect(topRisks(edited).map((risk) => risk.title)).toEqual(["Grid connection", "Tariff acceptance", "Permits"])
    expect(topRisks(edited, 2)).toHaveLength(2)
  })

  it("has no deal-breaker when none is flagged", () => {
    const edited = withRisks([{ title: "Permits", dealBreaker: false }])
    expect(dealBreaker(edited)).toBeNull()
    expect(topRisks(withRisks([]))).toEqual([])
  })
})

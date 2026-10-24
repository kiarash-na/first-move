import { describe, expect, it } from "vitest"
import { applyPatch, createProject } from "@/lib/project"
import { shareSum } from "./share-sum"

const withShares = (patch: Record<string, number | null>) =>
  applyPatch(createProject({ modules: { quickCheck: true } }), patch, { atomic: true }).project

describe("shareSum (QCT-IN-04, R-03)", () => {
  it("is empty when nothing is entered", () => {
    expect(shareSum(withShares({}))).toMatchObject({ sum: 0, state: "empty", remaining: 100 })
  })

  it("is under 100 while shares are missing", () => {
    const sum = shareSum(withShares({ "buildings.shares.residential.1991_2010": 50, "buildings.shares.category_a.2011_today": 0 }))
    expect(sum).toMatchObject({ sum: 50, state: "under", remaining: 50 })
    expect(sum.rows.residential).toBe(50)
    expect(sum.columns["1991_2010"]).toBe(50)
  })

  it("is exact at 100, also with float noise", () => {
    const sum = shareSum(
      withShares({
        "buildings.shares.residential.1991_2010": 33.3,
        "buildings.shares.residential.2011_today": 33.3,
        "buildings.shares.category_a.2011_today": 33.4,
      }),
    )
    expect(sum.state).toBe("exact")
  })

  it("is over 100 with a negative remainder", () => {
    const sum = shareSum(withShares({ "buildings.shares.residential.1991_2010": 80, "buildings.shares.industry.2011_today": 30 }))
    expect(sum).toMatchObject({ sum: 110, state: "over", remaining: -10 })
    expect(sum.rows.industry).toBe(30)
  })
})

import { describe, expect, it } from "vitest"
import { firstRoute, modulesFor, START_PATHS } from "./start-paths"

describe("start paths (D-03)", () => {
  it("maps each tile to its modules", () => {
    expect(START_PATHS).toEqual(["quick-check", "business-plan", "both"])
    expect(modulesFor("quick-check")).toEqual({ quickCheck: true, businessPlan: false })
    expect(modulesFor("business-plan")).toEqual({ quickCheck: false, businessPlan: true })
    expect(modulesFor("both")).toEqual({ quickCheck: true, businessPlan: true })
  })

  it("returns a fresh object each time", () => {
    const a = modulesFor("both")
    a.quickCheck = false
    expect(modulesFor("both").quickCheck).toBe(true)
  })

  it("opens the first step of the first module", () => {
    expect(firstRoute(modulesFor("quick-check"))).toEqual({ page: "quick-check", step: "area" })
    expect(firstRoute(modulesFor("business-plan"))).toEqual({ page: "business-plan", step: "opportunity" })
    expect(firstRoute(modulesFor("both"))).toEqual({ page: "quick-check", step: "area" })
    expect(firstRoute({ quickCheck: false, businessPlan: false })).toEqual({ page: "overview" })
  })
})

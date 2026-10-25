import { describe, expect, it } from "vitest"
import {
  BUSINESS_PLAN_PAGES,
  DASHBOARD_ROUTES,
  dashboardHref,
  isActivePath,
  isBusinessPlanPage,
  isQuickCheckPage,
  QUICK_CHECK_PAGES,
} from "./routes"

describe("dashboard routes (PLAN-DASH-00)", () => {
  it("lists the Quick Check steps plus results and the four Business Plan steps", () => {
    expect(QUICK_CHECK_PAGES).toEqual(["area", "buildings", "sources", "options", "results"])
    expect(BUSINESS_PLAN_PAGES).toEqual(["opportunity", "business-logic", "reality-check", "implementation"])
  })

  it("builds localized paths", () => {
    expect(dashboardHref("en")).toBe("/en/dashboard")
    expect(dashboardHref("de", { page: "overview" })).toBe("/de/dashboard/overview")
    expect(dashboardHref("en", { page: "quick-check", step: "results" })).toBe("/en/dashboard/quick-check/results")
    expect(dashboardHref("en", { page: "business-plan", step: "reality-check" })).toBe("/en/dashboard/business-plan/reality-check")
    expect(dashboardHref("en", { page: "assumptions" })).toBe("/en/dashboard/assumptions")
    expect(dashboardHref("de", { page: "report" })).toBe("/de/dashboard/report")
    expect(dashboardHref("en", { page: "ai-score" })).toBe("/en/dashboard/ai-score")
  })

  it("has one unique path per route", () => {
    const paths = DASHBOARD_ROUTES.map((route) => dashboardHref("en", route))
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths).toHaveLength(1 + 1 + 5 + 4 + 1 + 1 + 1)
  })

  it("guards step params", () => {
    expect(isQuickCheckPage("sources")).toBe(true)
    expect(isQuickCheckPage("opportunity")).toBe(false)
    expect(isBusinessPlanPage("implementation")).toBe(true)
    expect(isBusinessPlanPage(undefined)).toBe(false)
  })

  it("matches the active path exactly, ignoring a trailing slash", () => {
    expect(isActivePath("/en/dashboard/", "/en/dashboard")).toBe(true)
    expect(isActivePath("/en/dashboard/overview", "/en/dashboard")).toBe(false)
    expect(isActivePath(null, "/en/dashboard")).toBe(false)
  })
})

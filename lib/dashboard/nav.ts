import type { ProjectModules } from "@/lib/project"
import { BUSINESS_PLAN_PAGES, QUICK_CHECK_PAGES, type DashboardRoute } from "./routes"

/** Which brand role a nav entry carries: cyan = Quick Check, orange = Business Plan (DESIGN-TOKENS §1). */
export type NavTone = "neutral" | "cool" | "hot"

export interface NavItem {
  /** Copy key under `shell.nav.items`. */
  id: string
  route: DashboardRoute
  tone: NavTone
  /** Step number shown in front of input steps (1-based). */
  step: number | null
}

export interface NavSection {
  /** Copy key under `shell.nav.sections`. */
  id: "project" | "quickCheck" | "businessPlan"
  tone: NavTone
  items: NavItem[]
}

/**
 * The sidebar of an open project (D-07): Overview, the Quick Check steps and Results, the
 * Business Plan steps, Assumptions. A module section shows only when the module is on.
 * Assumptions are the Quick Check defaults and parameter playground (D-10), so they follow it.
 */
export function navSections(modules: ProjectModules): NavSection[] {
  const sections: NavSection[] = [
    { id: "project", tone: "neutral", items: [{ id: "overview", route: { page: "overview" }, tone: "neutral", step: null }] },
  ]
  if (modules.quickCheck) {
    sections.push({
      id: "quickCheck",
      tone: "cool",
      items: QUICK_CHECK_PAGES.map((step, index) => ({
        id: `quickCheck.${step}`,
        route: { page: "quick-check", step },
        tone: "cool",
        step: step === "results" ? null : index + 1,
      })),
    })
  }
  if (modules.businessPlan) {
    sections.push({
      id: "businessPlan",
      tone: "hot",
      items: BUSINESS_PLAN_PAGES.map((step, index) => ({
        id: `businessPlan.${step}`,
        route: { page: "business-plan", step },
        tone: "hot",
        step: index + 1,
      })),
    })
  }
  if (modules.quickCheck) {
    sections[0].items.push({ id: "assumptions", route: { page: "assumptions" }, tone: "neutral", step: null })
  }
  return sections
}

/** The module a route belongs to, or null for project-wide pages. */
export function routeModule(route: DashboardRoute): keyof ProjectModules | null {
  if (route.page === "quick-check" || route.page === "assumptions") return "quickCheck"
  if (route.page === "business-plan") return "businessPlan"
  return null
}

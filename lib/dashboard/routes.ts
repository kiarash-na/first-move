import type { Locale } from "@/lib/i18n/locales"
import { BUSINESS_PLAN_STEPS, QUICK_CHECK_STEPS, type BusinessPlanStep } from "@/lib/project/fields/steps"

/**
 * The dashboard routes of PLAN-DASH-00. The active project is never in the URL; every route
 * reads it from the store on the client.
 */

/** Quick Check pages: the four input steps (QCT-IN-00) and the results page. */
export const QUICK_CHECK_PAGES = [...QUICK_CHECK_STEPS, "results"] as const
export type QuickCheckPage = (typeof QUICK_CHECK_PAGES)[number]

export const BUSINESS_PLAN_PAGES = BUSINESS_PLAN_STEPS
export type BusinessPlanPage = BusinessPlanStep

export type DashboardRoute =
  | { page: "start" }
  | { page: "overview" }
  | { page: "quick-check"; step: QuickCheckPage }
  | { page: "business-plan"; step: BusinessPlanPage }
  | { page: "assumptions" }

export function isQuickCheckPage(value: unknown): value is QuickCheckPage {
  return typeof value === "string" && (QUICK_CHECK_PAGES as readonly string[]).includes(value)
}

export function isBusinessPlanPage(value: unknown): value is BusinessPlanPage {
  return typeof value === "string" && (BUSINESS_PLAN_PAGES as readonly string[]).includes(value)
}

/** The path of a dashboard route in a language: `/en/dashboard/quick-check/area`. */
export function dashboardHref(lang: Locale, route: DashboardRoute = { page: "start" }): string {
  const base = `/${lang}/dashboard`
  switch (route.page) {
    case "start":
      return base
    case "quick-check":
    case "business-plan":
      return `${base}/${route.page}/${route.step}`
    default:
      return `${base}/${route.page}`
  }
}

/** Every dashboard route, e.g. for tests that each one has a page. */
export const DASHBOARD_ROUTES: readonly DashboardRoute[] = [
  { page: "start" },
  { page: "overview" },
  ...QUICK_CHECK_PAGES.map((step) => ({ page: "quick-check" as const, step })),
  ...BUSINESS_PLAN_PAGES.map((step) => ({ page: "business-plan" as const, step })),
  { page: "assumptions" },
]

/** True when `pathname` is the page of `href` (exact match, a trailing slash is ignored). */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  const clean = pathname.replace(/\/+$/, "")
  return clean === href
}

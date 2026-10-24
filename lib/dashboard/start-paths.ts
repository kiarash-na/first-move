import type { ProjectModules } from "@/lib/project"
import type { DashboardRoute } from "./routes"

/** The path tiles of the start screen (D-03): which modules a new project gets. */
export const START_PATHS = ["quick-check", "business-plan", "both"] as const
export type StartPath = (typeof START_PATHS)[number]

const MODULES: Record<StartPath, ProjectModules> = {
  "quick-check": { quickCheck: true, businessPlan: false },
  "business-plan": { quickCheck: false, businessPlan: true },
  both: { quickCheck: true, businessPlan: true },
}

/** The modules a project created from a path tile has. */
export function modulesFor(path: StartPath): ProjectModules {
  return { ...MODULES[path] }
}

/**
 * Where a new project opens: its first input step. With both modules the Quick Check comes
 * first, because Business Plan step 1 shows its numbers read-only (ALG-09).
 */
export function firstRoute(modules: ProjectModules): DashboardRoute {
  if (modules.quickCheck) return { page: "quick-check", step: "area" }
  if (modules.businessPlan) return { page: "business-plan", step: "opportunity" }
  return { page: "overview" }
}

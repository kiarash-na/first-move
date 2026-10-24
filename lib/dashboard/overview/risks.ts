import type { Project } from "@/lib/project"

export interface OverviewRisk {
  id: string
  title: string
  dealBreaker: boolean
}

/** Risks with a title, as entered (BM-STEP-03.3/4). */
export function namedRisks(project: Project): OverviewRisk[] {
  return project.businessPlan.risks
    .filter((risk) => risk.title.trim().length > 0)
    .map((risk) => ({ id: risk.id, title: risk.title.trim(), dealBreaker: risk.dealBreaker }))
}

/** The risks the overview shows: the deal-breaker first, then the others in entry order. */
export function topRisks(project: Project, max = 3): OverviewRisk[] {
  const risks = namedRisks(project)
  return [...risks.filter((risk) => risk.dealBreaker), ...risks.filter((risk) => !risk.dealBreaker)].slice(0, max)
}

/** The potential deal-breaker (the first flagged risk with a title), or null. */
export function dealBreaker(project: Project): OverviewRisk | null {
  return namedRisks(project).find((risk) => risk.dealBreaker) ?? null
}

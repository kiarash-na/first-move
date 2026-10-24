import { getAt, parsePath } from "@/lib/project/path"
import type { Project } from "@/lib/project/schema/project"
import { isFieldFilled, isTextFilled } from "./filled"
import {
  CHECKS,
  JURY_CRITERIA,
  PITCH_SECTIONS,
  type CheckId,
  type JuryCriterionId,
  type PitchSectionId,
  type ReadinessCheck,
} from "./readiness-checks"

export interface CheckResult {
  id: CheckId
  met: boolean
  /** The step to open to meet it. */
  step: ReadinessCheck["step"]
  /** Registry id of the field to fill. */
  field: string
}

export interface ReadinessGroup<Id extends string> {
  id: Id
  checks: CheckResult[]
  met: number
  total: number
  /** 0..1 */
  score: number
}

export type PitchReadinessLevel = "not-started" | "in-progress" | "ready"

export interface PitchReadiness {
  /** The six pitch sections (BM-SCOPE-07). */
  sections: ReadinessGroup<PitchSectionId>[]
  /** The V01 jury criteria (BM-SCOPE-08), unofficial (D-30). */
  jury: ReadinessGroup<JuryCriterionId>[]
  /** Mean of the six section scores, 0..1 (every section weighs the same). */
  score: number
  level: PitchReadinessLevel
}

function isMet(project: Project, check: ReadinessCheck): boolean {
  switch (check.kind) {
    case "text":
      return isTextFilled(getAt(project, parsePath(check.field) ?? []))
    case "list":
      return isFieldFilled(project, check.field, "textList")
    case "rows":
      return isFieldFilled(project, check.field, "items")
    case "dealBreaker": {
      const risks = (getAt(project, parsePath(check.field) ?? []) as { dealBreaker: boolean }[] | undefined) ?? []
      return risks.some((risk) => risk.dealBreaker)
    }
  }
}

function group<Id extends string>(
  id: Id,
  checkIds: readonly CheckId[],
  results: ReadonlyMap<CheckId, CheckResult>,
): ReadinessGroup<Id> {
  const checks = checkIds.map((checkId) => results.get(checkId)!)
  const met = checks.filter((check) => check.met).length
  return { id, checks, met, total: checks.length, score: checks.length === 0 ? 0 : met / checks.length }
}

/**
 * Pitch readiness (D-30, PLAN-DASH-10 step 5), computed only from filled fields: the six pitch
 * sections of BM-SCOPE-07 and, next to them, the V01 jury criteria of BM-SCOPE-08 (unofficial).
 * It says how much of the pitch has content, not how good the content is.
 */
export function pitchReadiness(project: Project): PitchReadiness {
  const results = new Map<CheckId, CheckResult>(
    (Object.keys(CHECKS) as CheckId[]).map((id) => [
      id,
      { id, met: isMet(project, CHECKS[id]), step: CHECKS[id].step, field: CHECKS[id].field },
    ]),
  )
  const sections = PITCH_SECTIONS.map((section) => group(section.id, section.checks, results))
  const jury = JURY_CRITERIA.map((criterion) => group(criterion.id, criterion.checks, results))
  const score = sections.reduce((sum, section) => sum + section.score, 0) / sections.length
  const anyMet = sections.some((section) => section.met > 0)
  const level: PitchReadinessLevel = sections.every((section) => section.met === section.total)
    ? "ready"
    : anyMet
      ? "in-progress"
      : "not-started"
  return { sections, jury, score, level }
}

/** The first unmet check of a group, to point at what to fill next. */
export function nextCheck(readiness: PitchReadiness): CheckResult | null {
  for (const section of readiness.sections) {
    const open = section.checks.find((check) => !check.met)
    if (open) return open
  }
  return null
}

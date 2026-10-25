import { isTextFilled } from "@/lib/business-plan"
import { getAt, parsePath, type Project } from "@/lib/project"
import { JUDGEMENTS, type Judgement } from "./judgements"
import type { QuickCheckSignal } from "./quick-check-signal"

/**
 * What Jev reads in every turn (PLAN-AI-SCORE-00 § Method): the whole plan, so cross-field gates
 * work, plus the scenario, the Quick Check signal and the decisions of earlier turns. Only filled
 * judgements are sent; empty ones score 0 without AI and never leave the browser.
 */

/** A row list without ids and blank cells; rows with no text at all are dropped. */
function rowsValue(rows: readonly Record<string, unknown>[]) {
  return rows
    .map((row) =>
      Object.fromEntries(
        Object.entries(row).filter(([key, value]) => key !== "id" && (typeof value === "boolean" || (typeof value === "string" && value.trim() !== ""))),
      ),
    )
    .filter((row) => Object.values(row).some((value) => typeof value === "string"))
}

/** A field's value as Jev reads it: trimmed text, a list without blank entries, rows without ids. */
function fieldValue(project: Project, id: string): unknown {
  const value = getAt(project, parsePath(id) ?? [])
  if (Array.isArray(value)) {
    if (value.every((entry) => typeof entry === "string")) return (value as string[]).map((entry) => entry.trim()).filter(Boolean)
    return rowsValue(value as Record<string, unknown>[])
  }
  return typeof value === "string" ? value.trim() : ""
}

const hasContent = (value: unknown) => (Array.isArray(value) ? value.length > 0 : isTextFilled(value))

/** True when at least one field of the judgement has content. */
export function isJudgementFilled(project: Project, judgement: Judgement): boolean {
  return judgement.fields.some((field) => hasContent(fieldValue(project, field.id)))
}

/** One field: its value; several: the filled ones by their sub-label. */
export function judgementValue(project: Project, judgement: Judgement): unknown {
  if (judgement.fields.length === 1) return fieldValue(project, judgement.fields[0].id)
  return Object.fromEntries(judgement.fields.map((field) => [field.label, fieldValue(project, field.id)]).filter(([, value]) => hasContent(value)))
}

export interface PlanState {
  [key: string]: unknown
  scenario: string | null
  plan: { key: string; label: string; value: unknown }[]
  quickCheck: QuickCheckSignal | null
  decisions: Record<string, string>
}

/** Jev's limit is 32,000 tokens for the state plus the longest question; we stay well below. */
export const STATE_TOKEN_BUDGET = 20_000
/** About three characters a token, as the email guard estimates (lib/mail-agent/guard). */
export const estimateTokens = (value: unknown) => Math.ceil(JSON.stringify(value).length / 3)

function clip(value: unknown, max: number): unknown {
  if (typeof value === "string") return value.length > max ? `${value.slice(0, max)}…` : value
  if (Array.isArray(value)) return value.map((entry) => clip(entry, max))
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, clip(inner, max)]))
  return value
}

export function buildState(project: Project, quickCheck: QuickCheckSignal | null, decisions: Record<string, string>): PlanState {
  const plan = JUDGEMENTS.filter((judgement) => isJudgementFilled(project, judgement)).map((judgement) => ({
    key: judgement.id,
    label: judgement.label,
    value: judgementValue(project, judgement),
  }))
  let state: PlanState = { scenario: project.businessPlan.scenarioId, plan, quickCheck, decisions }
  // Very long plans are cut per text, from generous to tight, until they fit.
  for (const max of [1500, 1000, 600, 300]) {
    if (estimateTokens(state) <= STATE_TOKEN_BUDGET) break
    state = { ...state, plan: plan.map((entry) => ({ ...entry, value: clip(entry.value, max) })) }
  }
  return state
}

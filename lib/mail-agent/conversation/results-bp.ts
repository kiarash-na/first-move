import "server-only"
import type { Block, Section, ValueRow } from "@/emails/model"
import { isTextFilled } from "@/lib/business-plan/filled"
import { pitchReadiness } from "@/lib/business-plan/readiness"
import { formatIndicator } from "@/lib/dashboard/indicator-format"
import { interpolate } from "@/lib/i18n/interpolate"
import { lookup } from "@/lib/i18n/lookup"
import { BUSINESS_PLAN_STEPS, getAt, parsePath, type FieldDef, type Project } from "@/lib/project"
import type { QuickCheckRun } from "@/lib/quick-check"
import { fieldName, formatFieldValue } from "./format-value"
import { stepFields } from "./questions-bp"
import type { MailTexts } from "./texts"

const valueOf = (project: Project, id: string) => getAt(project, parsePath(id) ?? [])

function isFilled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === "string") return isTextFilled(value)
  return value !== null && value !== undefined
}

/** One row per filled field; an item list gets one row per entry, a deal-breaker risk in orange. */
function rowsOf(field: FieldDef, project: Project, t: MailTexts): ValueRow[] {
  const value = valueOf(project, field.id)
  if (!isFilled(value)) return []
  const name = fieldName(field.id, t)
  if (field.kind !== "items") return [{ label: name, value: formatFieldValue(field.id, value, t) }]
  const { businessPlan } = t.mail.conversation
  return (value as Record<string, unknown>[]).map((row, index) => ({
    label: `${name} · ${interpolate(businessPlan.entry, { number: index + 1 })}`,
    value: formatFieldValue(field.id, [row], t),
    ...(row.dealBreaker === true && { note: businessPlan.dealBreaker, tone: "hot" as const }),
  }))
}

/** The pitch's six parts and how many of their points have content (D-30, unofficial, D-37). */
function readinessRows(project: Project, t: MailTexts): { rows: ValueRow[]; met: number; total: number } {
  const readiness = pitchReadiness(project)
  const rows = readiness.sections.map((section) => ({
    label: lookup(t.businessPlan, `readiness.sections.${section.id}.label`) ?? section.id,
    value: `${section.met}/${section.total}`,
  }))
  return { rows, met: readiness.sections.reduce((sum, section) => sum + section.met, 0), total: readiness.sections.reduce((sum, section) => sum + section.total, 0) }
}

/** A few Quick Check numbers for context, read-only (the Business Plan never changes them). */
function quickCheckRows(result: QuickCheckRun, t: MailTexts): ValueRow[] {
  if (result.status !== "complete") return []
  const copy = t.quickCheck
  const { conversation } = t.mail
  return [
    { label: copy.ui.results.overall, value: copy.results.levels[result.assessment.level].label },
    { label: conversation.results.heatingCoverage, value: formatIndicator("coverage", result.values.heatingCoverage, t.locale) },
    { label: copy.ui.results.indicators.buildingDensity, value: `${formatIndicator("buildingDensity", result.values.buildingDensity, t.locale)} ${copy.ui.results.indicators.densityUnit}` },
    {
      label: copy.ui.results.indicators.economic,
      value: result.values.economicRatio === null ? copy.results.classes.notApplicable.label : interpolate(copy.ui.results.indicators.ratio, { value: formatIndicator("economic", result.values.economicRatio, t.locale) }),
    },
  ]
}

/**
 * The Business Plan by email (PLAN-AGENT-07 step 9): the filled fields of each step in the
 * person's own words (D-27), risks with the deal-breaker marked, pitch completeness labelled
 * unofficial (D-30, D-37), and the Quick Check's main numbers read-only when both modules are on.
 */
export function bpSummarySection(project: Project, qc: QuickCheckRun | null, t: MailTexts, { updated }: { updated: boolean }): Section {
  const { conversation } = t.mail
  const copy = conversation.businessPlan
  const steps: Block[] = BUSINESS_PLAN_STEPS.flatMap((step): Block[] => {
    const rows = stepFields(step).flatMap((field) => rowsOf(field, project, t))
    return rows.length ? [{ type: "rows", title: conversation.bp.steps[step], rows }] : []
  })
  const readiness = readinessRows(project, t)
  const qcRows = qc ? quickCheckRows(qc, t) : []
  return {
    kicker: conversation.kicker.businessPlan,
    title: copy.title,
    accent: "hot",
    blocks: [
      ...(updated ? [{ type: "text" as const, text: conversation.results.updated, tone: "strong" as const }] : []),
      { type: "text", text: copy.lead, tone: "muted" },
      ...(steps.length ? steps : [{ type: "text" as const, text: copy.empty }]),
      { type: "text", text: copy.readiness, tone: "strong" },
      { type: "text", text: `${copy.readinessLead} ${interpolate(copy.readinessSummary, { met: readiness.met, total: readiness.total })}`, tone: "muted" },
      { type: "rows", rows: readiness.rows },
      ...(qcRows.length ? [{ type: "text" as const, text: copy.quickCheck, tone: "strong" as const }, { type: "rows" as const, title: copy.quickCheckLead, rows: qcRows }] : []),
    ],
  }
}

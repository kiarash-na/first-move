import { fieldLabel, optionLabel, type Texts } from "@/lib/ai/extract/field-label"
import { aiScoreStatus, displayScore } from "@/lib/business-plan"
import { reasonText } from "@/lib/dashboard/result-text"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { lookup } from "@/lib/i18n/lookup"
import type { Locale } from "@/lib/i18n/locales"
import { fieldsOf, getAt, parsePath, type FieldDef, type Project } from "@/lib/project"
import { run } from "@/lib/quick-check"

/** Characters of one text value the model sees; the rest is cut (the field holds it all). */
const TEXT_CAP = 600

/** One filled input as the model sees it: id (the patch key), where it is, its label and value. */
export interface ViewField {
  id: string
  section: string
  label: string
  value: unknown
  unit?: string
  /** The option's label for a choice. */
  shown?: string
  /** Proposed by an AI and not edited since (schema v2 provenance). */
  ai?: true
}

export interface ProjectView {
  name: string
  modules: { quickCheck: boolean; businessPlan: boolean }
  filled: ViewField[]
  /** Inputs still empty: required ones first, so the model can say what is missing. */
  empty: { id: string; label: string; required: boolean }[]
  quickCheck:
    | { status: "off" }
    | { status: "incomplete"; missingSteps: string[] }
    | { status: "complete"; level: string; levelLabel: string | null; reasons: string[]; values: Record<string, number | null> }
  aiPlanScore: { score: number; level: string; outdated: boolean } | null
}

const isEmpty = (value: unknown) => value === null || value === "" || value === false || (Array.isArray(value) && value.length === 0)

const cap = (value: unknown): unknown => {
  if (typeof value === "string") return value.length > TEXT_CAP ? `${value.slice(0, TEXT_CAP)}…` : value
  if (Array.isArray(value)) return value.map(cap)
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cap(entry)]))
  return value
}

function section(field: FieldDef, texts: Texts): string {
  const name = lookup(texts.shell, `nav.sections.${field.module}`) ?? field.module
  const step = lookup(texts.shell, field.step === "assumptions" ? "nav.items.assumptions" : `nav.items.${field.module}.${field.step}`) ?? field.step
  return `${name} · ${step}`
}

/** The Quick Check numbers worth talking about, rounded as the result page shows them. */
const round = (value: number | null, digits = 2) => (value === null || !Number.isFinite(value) ? null : Math.round(value * 10 ** digits) / 10 ** digits)

/**
 * A compact, read-only view of the open project for the assistant (PLAN-AGENT-05 step 7): the
 * filled inputs of the modules that are on, with labels in the UI language and raw values, the
 * empty ones, and the Quick Check result from the engine (the model never computes it). Only
 * this project, never others.
 */
export function projectView(project: Project, texts: Texts, lang: Locale): ProjectView {
  const modules = { quickCheck: project.meta.modules.quickCheck, businessPlan: project.meta.modules.businessPlan }
  const fields = (["quickCheck", "businessPlan"] as const).filter((module) => modules[module]).flatMap((module) => fieldsOf({ module }))
  const marks = project.provenance.ai
  const filled: ViewField[] = []
  const empty: ProjectView["empty"] = []
  for (const field of fields) {
    const value = getAt(project, parsePath(field.id) ?? [])
    const label = fieldLabel(field, texts)
    if (isEmpty(value) && field.kind !== "boolean") {
      empty.push({ id: field.id, label, required: field.required })
      continue
    }
    const shown = field.kind === "choice" && typeof value === "string" ? optionLabel(field, value, texts) : null
    filled.push({
      id: field.id,
      section: section(field, texts),
      label,
      value: cap(value),
      ...("unit" in field && field.unit && { unit: field.unit }),
      ...(shown && { shown }),
      ...(Object.keys(marks).some((key) => key === field.id || key.startsWith(`${field.id}.`)) && { ai: true as const }),
    })
  }
  empty.sort((a, b) => Number(b.required) - Number(a.required))

  let quickCheck: ProjectView["quickCheck"] = { status: "off" }
  if (modules.quickCheck) {
    const result = run(project)
    if (result.status === "incomplete") quickCheck = { status: "incomplete", missingSteps: result.incompleteSteps }
    else {
      const copy = texts["quick-check"] as Dictionary<"quick-check"> | undefined
      const values = result.values
      quickCheck = {
        status: "complete",
        level: result.assessment.level,
        levelLabel: lookup(copy, `results.levels.${result.assessment.level}.label`),
        reasons: copy ? result.assessment.reasons.map((reason) => reasonText(reason, copy, lang)) : [],
        values: {
          heatingDemandMwhPerYear: round(values.heatingDemandKwh / 1000, 1),
          coolingDemandMwhPerYear: round(values.coolingDemandKwh / 1000, 1),
          buildingDensityPerHa: round(values.buildingDensity),
          networkLengthM: round(values.networkLengthM, 0),
          heatDensityMwhPerM: round(values.heatDensityMwhPerM, 3),
          heatingCoverage: round(values.heatingCoverage, 3),
          coolingCoverage: round(values.coolingCoverage, 3),
          economicRatio: round(values.economicRatio, 3),
          overallInvestmentEur: round(values.overallInvestment, 0),
          annualCostsEurPerYear: round(values.annualCosts, 0),
          overallRevenueEurPerYear: round(values.overallRevenue, 0),
        },
      }
    }
  }

  const score = modules.businessPlan ? aiScoreStatus(project) : null
  const aiPlanScore = score?.score
    ? { score: displayScore(score.score.score, score.score.sd).score, level: score.score.level, outdated: score.state === "outdated" }
    : null

  return { name: project.meta.name, modules, filled, empty, quickCheck, aiPlanScore }
}

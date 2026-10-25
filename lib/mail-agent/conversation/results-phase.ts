import "server-only"
import type { Section } from "@/emails/model"
import { run } from "@/lib/quick-check"
import { isQuickCheckKey, missingQuestions, stepOf, withAsked, type PhaseInput, type PhaseOutput } from "./phase"
import { includesBusinessPlan, includesQuickCheck } from "./plan-turn"
import { qcQuestionsSection } from "./questions-qc"
import { bpSummarySection } from "./results-bp"
import { qcResultSections } from "./results-qc"
import { reminderSection } from "./sections"
import type { MailTexts } from "./texts"

/**
 * After the results (PLAN-AGENT-07 step 9): a corrected value or a new project file computes
 * again with the same engine and sends what changed, marked as updated; anything else gets one
 * line that the results are in the last email. A file that leaves the Quick Check without its
 * inputs goes back to the questions.
 */
export function resultsPhase({ state, applied, imported, docsUrl }: PhaseInput, t: MailTexts): PhaseOutput {
  if (!applied.length && !imported) return { state, sections: [reminderSection("results", t)], kind: "reminder", results: false }
  const qc = includesQuickCheck(state.module) ? run(state.project) : null
  if (qc?.status === "incomplete") {
    const ids = missingQuestions(qc)
    const back = withAsked({ ...state, phase: "collect" }, ids.map((id) => `qc:${id}`), true)
    return { state: back, sections: [qcQuestionsSection(ids, t, { followUp: true, askFile: false })], kind: "questions", results: false }
  }
  const qcChanged = imported || applied.some(isQuickCheckKey)
  const bpChanged = imported || applied.some((key) => stepOf(key) !== null)
  const sections: Section[] = []
  if (qc && (qcChanged || !bpChanged)) sections.push(...qcResultSections(qc, state.project, t, { docsUrl, updated: true }))
  if (includesBusinessPlan(state.module) && (bpChanged || !qcChanged)) sections.push(bpSummarySection(state.project, qc, t, { updated: true }))
  return { state: withAsked(state, []), sections, kind: "results", results: true }
}

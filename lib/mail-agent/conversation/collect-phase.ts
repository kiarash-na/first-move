import "server-only"
import type { Section } from "@/emails/model"
import { BUSINESS_PLAN_STEPS } from "@/lib/project"
import { run } from "@/lib/quick-check"
import { isQuickCheckKey, missingQuestions, QC_ASKED, stepOf, withAsked, type PhaseInput, type PhaseOutput } from "./phase"
import { includesBusinessPlan, includesQuickCheck } from "./plan-turn"
import { bpQuestionsSection } from "./questions-bp"
import { QC_QUESTION_IDS, qcQuestionsSection, questionFor } from "./questions-qc"
import { bpSummarySection } from "./results-bp"
import { qcResultSections } from "./results-qc"
import { reminderSection } from "./sections"
import type { MailTexts } from "./texts"

const bpNote = (text: string, t: MailTexts): Section => ({ kicker: t.mail.conversation.kicker.businessPlan, accent: "hot", blocks: [{ type: "text", text, tone: "strong" }] })

/**
 * The collect phase (PLAN-AGENT-07 steps 7 and 9): the Quick Check questions until the engine has
 * what it needs (the full list once, then only what is missing), its result as soon as it runs,
 * then the Business Plan one step at a time. A step moves on when the email filled one of its
 * fields or said "next". A question or small talk gets one line on where things stand instead.
 */
export function collectPhase({ plan, state, applied, imported, docsUrl }: PhaseInput, t: MailTexts): PhaseOutput {
  const engaged = plan.chose !== null || plan.extract !== null || plan.next || imported
  const reminder: PhaseOutput = { state, sections: [reminderSection("collect", t)], kind: "reminder", results: false }
  const askFile = state.wantsFile === null
  const qc = includesQuickCheck(state.module) ? run(state.project) : null

  if (qc?.status === "incomplete") {
    if (!engaged) return reminder
    const first = !state.asked.includes(QC_ASKED)
    const answered = new Set(applied.map(questionFor))
    const ids = first ? QC_QUESTION_IDS.filter((id) => !answered.has(id)) : missingQuestions(qc)
    const next = withAsked(state, ids.map((id) => `qc:${id}`), true)
    return { state: next, sections: [qcQuestionsSection(ids, t, { followUp: !first, askFile })], kind: "questions", results: false }
  }

  const sections: Section[] = []
  const wasDone = includesQuickCheck(plan.state.module) && run(plan.state.project).status === "complete"
  if (qc?.status === "complete" && (!wasDone || imported || applied.some(isQuickCheckKey))) {
    sections.push(...qcResultSections(qc, state.project, t, { docsUrl, updated: wasDone }))
  }
  if (!includesBusinessPlan(state.module)) return { state: withAsked({ ...state, phase: "results" }, []), sections, kind: "results", results: true }

  let step = state.bpStep
  if (step === null) step = 0
  else if (plan.next || applied.some((key) => stepOf(key) === BUSINESS_PLAN_STEPS[step!])) {
    sections.push(bpNote(t.mail.conversation.bp.next, t))
    step += 1
  } else if (!engaged) return reminder
  else if (plan.extract && sections.length === 0 && !imported) sections.push(bpNote(t.mail.conversation.bp.nothing, t))

  if (step >= BUSINESS_PLAN_STEPS.length) {
    sections.push(bpSummarySection(state.project, qc, t, { updated: false }))
    return { state: withAsked({ ...state, bpStep: step, phase: "results" }, []), sections, kind: "results", results: true }
  }
  sections.push(bpQuestionsSection(BUSINESS_PLAN_STEPS[step], t, { askFile }))
  return { state: withAsked({ ...state, bpStep: step }, [`bp:${BUSINESS_PLAN_STEPS[step]}`]), sections, kind: "questions", results: false }
}

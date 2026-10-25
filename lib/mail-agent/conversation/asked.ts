import "server-only"
import { BUSINESS_PLAN_STEPS, type BusinessPlanStep } from "@/lib/project"
import type { AskedQuestion } from "../text/extract"
import { bpQuestions, stepFields } from "./questions-bp"
import { QC_QUESTION_IDS, QC_QUESTIONS, qcQuestions, type QcQuestionId } from "./questions-qc"
import type { MailTexts } from "./texts"

const isQcId = (id: string): id is QcQuestionId => (QC_QUESTION_IDS as readonly string[]).includes(id)
const isStep = (id: string): id is BusinessPlanStep => (BUSINESS_PLAN_STEPS as readonly string[]).includes(id)

/**
 * The numbered questions the last reply asked, with the fields each one fills (PLAN-AGENT-07
 * step 8), so the extractor maps "3: 40" to the third question of that email, not of the list.
 */
export function askedQuestions(asked: readonly string[], t: MailTexts): AskedQuestion[] {
  const qcIds = asked.flatMap((entry) => (entry.startsWith("qc:") ? [entry.slice(3)] : [])).filter(isQcId)
  if (qcIds.length) {
    return qcQuestions(qcIds, t).map((question, index) => ({ number: question.number, text: question.text, fields: QC_QUESTIONS.find((entry) => entry.id === qcIds[index])!.fields }))
  }
  const step = asked.find((entry) => entry.startsWith("bp:"))?.slice(3)
  if (!step || !isStep(step)) return []
  const fields = stepFields(step)
  return bpQuestions(step, t).map((question, index) => ({ number: question.number, text: question.text, fields: [fields[index].id] }))
}

import "server-only"
import type { Section } from "@/emails/model"
import { BUSINESS_PLAN_STEPS, type BusinessPlanStep } from "@/lib/project"
import type { QuickCheckIncomplete } from "@/lib/quick-check"
import type { TurnStep } from "./plan-turn"
import { stepFields } from "./questions-bp"
import { QC_QUESTION_IDS, questionFor, type QcQuestionId } from "./questions-qc"
import type { ConversationState } from "./state"

/** Recorded in `asked` once the full Quick Check list went out; later emails ask only what is missing. */
export const QC_ASKED = "qc:all"

/** Without these the Quick Check cannot run (R-03); the others are optional. */
const REQUIRED: readonly QcQuestionId[] = ["buildings", "area", "mix", "sources"]

/** What one phase of the conversation gets from a turn. */
export interface PhaseInput {
  plan: TurnStep
  /** The draft after this email's project file and values. */
  state: ConversationState
  /** Field ids of the values taken from this email. */
  applied: readonly string[]
  /** A project file replaced the draft. */
  imported: boolean
  docsUrl: string
}

export interface PhaseOutput {
  state: ConversationState
  sections: Section[]
  /** For the log and the stored reply: menu, questions, results, reminder. */
  kind: string
  /** The final results went out: the project file goes with them or is offered. */
  results: boolean
}

/** The Business Plan step a field id belongs to (lists match by their id). */
export function stepOf(key: string): BusinessPlanStep | null {
  const matches = (id: string) => key === id || key.startsWith(`${id}.`) || key.startsWith(`${id}[`)
  return BUSINESS_PLAN_STEPS.find((step) => stepFields(step).some((field) => matches(field.id))) ?? null
}

export const isQuickCheckKey = (key: string) => questionFor(key) !== null

/**
 * Records what this reply asks (`qc:<question>` or `bp:<step>`), so the next email's numbered
 * answers map to their fields; keeps the mark that the full Quick Check list went out.
 */
export function withAsked(state: ConversationState, entries: readonly string[], qcSent = false): ConversationState {
  const sent = qcSent || state.asked.includes(QC_ASKED)
  return { ...state, asked: [...(sent ? [QC_ASKED] : []), ...entries] }
}

/** The questions for what the engine still misses (R-03), in the order of the full list. */
export function missingQuestions(run: QuickCheckIncomplete): QcQuestionId[] {
  const ids = new Set(run.missing.map(questionFor))
  const list = QC_QUESTION_IDS.filter((id) => ids.has(id))
  return list.length ? list : [...REQUIRED]
}

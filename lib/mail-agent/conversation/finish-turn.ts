import "server-only"
import type { Section } from "@/emails/model"
import type { Proposal } from "@/lib/ai/extract/propose"
import type { FileReport } from "../attachments/read"
import type { ReplyAttachment } from "../outbound/send"
import type { Applied } from "./apply"
import { collectPhase } from "./collect-phase"
import type { PhaseOutput } from "./phase"
import type { TurnStep } from "./plan-turn"
import { progressSection } from "./progress"
import { projectAttachment } from "./project-file"
import { resultsPhase } from "./results-phase"
import { answerSection, fileNoteSection, filesSection, limitSection, menuSection, reminderSection, restartedSection } from "./sections"
import type { ConversationState } from "./state"
import type { MailTexts } from "./texts"

/** What the models and the files made of one email; each part is absent when it did not run. */
export interface TurnOutcome {
  answer: { text: string | null; page: { title: string; url: string } | null } | null
  files: readonly FileReport[]
  extraction: { applied: Applied; proposal: Proposal; notes: readonly string[] } | null
  imported: boolean
}

export interface TurnLinks {
  docsUrl: string
  dashboardUrl: string
}

export interface FinishedTurn {
  state: ConversationState
  sections: Section[]
  kind: string
  attachment: ReplyAttachment | null
}

/** The menu: in full for a new conversation or a reply that chose nothing, else one line. */
function menuPhase(plan: TurnStep, state: ConversationState, t: MailTexts): PhaseOutput {
  const fresh = state.rounds === 1 || plan.restarted
  if (!fresh && !plan.menuAgain) return { state, sections: [reminderSection("menu", t)], kind: "reminder", results: false }
  return { state, sections: [menuSection(t, { again: plan.menuAgain, askFile: state.wantsFile === null })], kind: "menu", results: false }
}

/**
 * Writes the reply to one email (PLAN-AGENT-07 steps 6 to 11) once the models have run: what
 * restarted, the answer to a question, what happened to each file, the values understood and
 * what was unclear, then the phase's own part (menu, questions, results), and last the project
 * file when the sender wants it with the results or asked for it. Pure: it returns the next
 * state, and `respond` saves it with the reply in one write.
 */
export function finishTurn(plan: TurnStep, state: ConversationState, outcome: TurnOutcome, t: MailTexts, links: TurnLinks, now: number): FinishedTurn {
  const sections: Section[] = plan.restarted ? [restartedSection(t)] : []
  const fileNote = (attachment: ReplyAttachment | null) =>
    fileNoteSection(t, { attached: attachment !== null, fileName: attachment?.filename ?? "", dashboardUrl: links.dashboardUrl })

  if (plan.limit) {
    const attachment = plan.sendFile ? projectAttachment(state.project, new Date(now)) : null
    return { state, sections: [...sections, limitSection(t, links.dashboardUrl), ...(attachment ? [fileNote(attachment)] : [])], kind: "limit", attachment }
  }

  const accent = plan.extract?.quickCheck ? "cool" : plan.extract?.bpSteps.length ? "hot" : "ink"
  if (outcome.answer) sections.push(answerSection(outcome.answer, t, links.docsUrl))
  if (outcome.files.length) sections.push(filesSection(outcome.files, t, accent))
  if (outcome.extraction) sections.push(progressSection(outcome.extraction, t, accent))

  const input = { plan, state, applied: outcome.extraction?.applied.values.map((value) => value.key) ?? [], imported: outcome.imported, docsUrl: links.docsUrl }
  const phase = state.phase === "menu" ? menuPhase(plan, state, t) : state.phase === "collect" ? collectPhase(input, t) : resultsPhase(input, t)

  const attach = plan.sendFile || (phase.results && phase.state.wantsFile === true)
  const attachment = attach ? projectAttachment(phase.state.project, new Date(now)) : null
  const tail = attachment || phase.results ? [fileNote(attachment)] : []
  return { state: phase.state, sections: [...sections, ...phase.sections, ...tail], kind: phase.kind, attachment }
}

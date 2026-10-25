import "server-only"
import { extractionInstructions } from "@/lib/ai/extract/prompt"
import type { Proposal } from "@/lib/ai/extract/propose"
import { canaryFor } from "@/lib/ai/prompts/canary"
import type { Locale } from "@/lib/i18n/locales"
import { alertOncePerDay } from "../admin/alert"
import { readAttachments, type ReadFiles } from "../attachments/read"
import { applyProposal } from "../conversation/apply"
import { askedQuestions } from "../conversation/asked"
import { scopeCatalogue } from "../conversation/catalogue"
import type { ParsedReply } from "../conversation/commands"
import { finishTurn, type TurnOutcome } from "../conversation/finish-turn"
import { adoptProject, extractScope, type TurnStep } from "../conversation/plan-turn"
import { loadConversation, saveConversation, withHandled, type ConversationState } from "../conversation/state"
import { loadTexts, type MailTexts } from "../conversation/texts"
import { judgedText } from "../guard/state"
import { logEvent, sidPrefix } from "../log"
import { composeReply, sitePage } from "../outbound/message"
import { notice } from "../outbound/notices"
import { MICRO_USD, addSpend, spentToday } from "../store/budget"
import { withSenderLock } from "../store/lock"
import { answerQuestion } from "../text/answer"
import { extractValues } from "../text/extract"
import { textCost } from "../text/model"
import { cleanModelText } from "../text/model-text"
import { deliver, deliverOnce, toStored } from "./deliver"
import type { Sender } from "./sender"
import { SenderBusyError, type InboundInput, type MailDeps } from "./types"

export interface ConverseInput {
  input: InboundInput
  sender: Sender
  /** The conversation as loaded before this email; its revision guards the write. */
  saved: ConversationState | null
  locale: Locale
  parsed: ParsedReply
  plan: TurnStep
  /** Files the sender attached (not signature images). */
  attachments: number
  now: number
}

const NOTHING_FOUND: Proposal = { patch: {}, valid: [], invalid: [], incomplete: [], conflicts: [], unclear: [], notes: [] }
const NO_FILES: ReadFiles = { documents: [], projects: [], reports: [] }
const NOTE_CHARS = 300

type Extracted = { ok: true; state: ConversationState; extraction: TurnOutcome["extraction"] } | { ok: false }

/**
 * Reads values from the email and its documents (PLAN-AGENT-07 step 8) and applies the valid
 * ones to the draft with provenance. A refused or unreadable answer counts as nothing found; a
 * model that does not answer at all makes the caller send the "try later" notice.
 */
async function extract(deps: MailDeps, ctx: ConverseInput, state: ConversationState, files: ReadFiles, t: MailTexts, canary: string, imported: boolean): Promise<Extracted> {
  const { plan, parsed, attachments, locale, now, sender } = ctx
  const scope = imported ? extractScope(state, attachments) : plan.extract
  const onlyProjectFiles = imported && files.documents.length === 0 && !parsed.hasNumbers
  if (!scope || onlyProjectFiles) return { ok: true, state, extraction: null }
  const catalogue = scopeCatalogue(scope, t)
  if (catalogue.fields.length === 0) return { ok: true, state, extraction: null }
  const fallback = locale === "en" ? undefined : scopeCatalogue(scope, await loadTexts("en"))
  const judged = judgedText(sender.email)
  const outcome = await extractValues(deps.textModel, {
    catalogue,
    ...(fallback && { fallback }),
    texts: t.texts,
    project: state.project,
    email: `${judged.subject}\n\n${judged.body}`,
    documents: files.documents,
    asked: askedQuestions(state.asked, t),
    canary,
  })
  await addSpend(deps.store, textCost(outcome.usage), now)
  if (!outcome.ok && outcome.reason === "failed") return { ok: false }
  const proposal = outcome.ok ? outcome.proposal : NOTHING_FOUND
  const applied = applyProposal(state.project, proposal, { model: deps.textModel.modelId, now: new Date(now) })
  const policy = { siteUrl: deps.config.siteUrl, canary, instructions: extractionInstructions(catalogue), maxChars: NOTE_CHARS }
  const notes = proposal.notes.flatMap((note) => cleanModelText(`${note.topic}: ${note.reason}`, policy) ?? [])
  logEvent("extract", { sid: sidPrefix(sender.sid), ok: outcome.ok, reason: outcome.ok ? null : outcome.reason, values: applied.values.length, unclear: proposal.unclear.length + proposal.invalid.length })
  return { ok: true, state: { ...state, project: applied.project }, extraction: { applied, proposal, notes } }
}

/** "Try again later" when the budget is spent or the model does not answer; the admin hears once a day. */
async function unavailable(deps: MailDeps, ctx: ConverseInput, kind: "budget" | "text-failed"): Promise<string> {
  await alertOncePerDay(deps, kind, ctx.sender.email.id, ctx.now)
  return deliverOnce(deps, ctx.input, ctx.sender, ctx.locale, await notice(deps.config, ctx.locale, "unavailable"))
}

/**
 * One turn of the conversation (PLAN-AGENT-07 steps 6 to 11): the attachments through the guard,
 * a project file adopted, values read and applied, a question answered from the docs, then the
 * reply written by `finishTurn` from the engine's own results. The new state and the reply are
 * saved in one write under the sender's lock, only if no other email changed the conversation
 * meanwhile; then the reply goes out.
 */
export async function converse(deps: MailDeps, ctx: ConverseInput): Promise<string> {
  const { config, store } = deps
  const { plan, sender, saved, locale, attachments, now } = ctx
  const needsModel = plan.answer || plan.extract !== null
  if (needsModel && (await spentToday(store, now)) >= config.limits.dailyBudgetUsd * MICRO_USD) return unavailable(deps, ctx, "budget")

  const t = await loadTexts(locale)
  const canary = await canaryFor(config.secrets.hash)
  const files = plan.extract && attachments > 0 ? await readAttachments(deps, sender.email, now) : NO_FILES
  const imported = files.projects.at(-1)?.project ?? null
  const base = imported ? adoptProject(plan.state, imported, plan.chose, now) : plan.state

  const extracted = await extract(deps, ctx, base, files, t, canary, imported !== null)
  if (!extracted.ok) return unavailable(deps, ctx, "text-failed")

  let answer: TurnOutcome["answer"] = null
  if (plan.answer) {
    const judged = judgedText(sender.email)
    const result = await answerQuestion(deps.textModel, { question: `${judged.subject}\n\n${judged.body}`, locale, siteUrl: config.siteUrl, canary })
    await addSpend(store, textCost(result.usage), now)
    answer = { text: result.text, page: result.page }
  }

  const links = { docsUrl: sitePage(config, locale, "/docs/quick-check"), dashboardUrl: sitePage(config, locale, "/dashboard") }
  const outcome: TurnOutcome = { answer, files: files.reports, extraction: extracted.extraction, imported: imported !== null }
  const turn = finishTurn(plan, extracted.state, outcome, t, links, now)
  const reply = await composeReply(config, locale, turn.kind, turn.sections, { commands: true, ...(turn.attachment && { attachment: turn.attachment }) })
  const stored = toStored(sender.email.id, locale, reply)

  const locked = await withSenderLock(store, sender.sid, async () => {
    const current = await loadConversation(store, config.secrets.state, sender.sid)
    if ((current?.rev ?? null) !== (saved?.rev ?? null)) return false
    await saveConversation(store, config.secrets.state, sender.sid, withHandled({ ...turn.state, reply: stored }, sender.email.id), now)
    return true
  })
  if (!locked.ok || !locked.value) throw new SenderBusyError()
  logEvent("turn", { sid: sidPrefix(sender.sid), kind: turn.kind, phase: turn.state.phase, round: turn.state.rounds, file: turn.attachment !== null })
  return deliver(deps, ctx.input, sender, stored)
}

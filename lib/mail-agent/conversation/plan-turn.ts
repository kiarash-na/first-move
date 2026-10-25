import "server-only"
import type { Locale } from "@/lib/i18n/locales"
import { applyPatch, BUSINESS_PLAN_STEPS, type Project } from "@/lib/project"
import { run } from "@/lib/quick-check"
import type { Intent } from "../guard/questions"
import type { ExtractScope } from "./catalogue"
import type { ParsedReply } from "./commands"
import { MAX_ROUNDS, newConversation, type ConversationState, type ModuleChoice } from "./state"

export interface TurnInput {
  state: ConversationState | null
  locale: Locale
  threadId: string
  parsed: ParsedReply
  /** Jev's reading of what the sender wants (D-52); null when the guard gave none. */
  intent: Intent | null
  action: "allow" | "small_talk"
  /** Files the sender attached (not signature images). */
  attachments: number
  now: number
}

export type TurnPlan =
  | { kind: "stop"; hadConversation: boolean }
  | { kind: "handoff" }
  | {
      kind: "turn"
      /** The state before this email's values: module, file choice and round already updated. */
      state: ConversationState
      restarted: boolean
      /** Over the round limit: only the pointer to the dashboard (and the file when asked). */
      limit: boolean
      answer: boolean
      /** Which fields to read from the email and its files; null reads nothing. */
      extract: ExtractScope | null
      /** The sender asked for the project file now. */
      sendFile: boolean
      /** "next": skip to the next Business Plan step. */
      next: boolean
      /** Show the menu with "please choose 1, 2 or 3". */
      menuAgain: boolean
      /** How this email chose the module: in words (or by Jev's reading), by sending data, or not at all. */
      chose: "explicit" | "default" | null
    }

export type TurnStep = Extract<TurnPlan, { kind: "turn" }>

export const includesQuickCheck = (module: ModuleChoice | null) => module === "quickCheck" || module === "both"
export const includesBusinessPlan = (module: ModuleChoice | null) => module === "businessPlan" || module === "both"

const INTENT_MODULE: Partial<Record<Intent, ModuleChoice>> = { choose_quick_check: "quickCheck", choose_business_plan: "businessPlan", choose_both: "both" }

/** The module a project file was saved with. */
export function moduleOf(project: Project): ModuleChoice {
  const { quickCheck, businessPlan } = project.meta.modules
  return quickCheck && businessPlan ? "both" : businessPlan ? "businessPlan" : "quickCheck"
}

/** Switches the draft's modules to the choice (`applyPatch`, so "at least one module" holds). */
export function withModule(state: ConversationState, module: ModuleChoice, now: number): ConversationState {
  const patch = { "meta.modules.quickCheck": includesQuickCheck(module), "meta.modules.businessPlan": includesBusinessPlan(module) }
  return { ...state, module, phase: "collect", bpStep: null, project: applyPatch(state.project, patch, { now: new Date(now) }).project }
}

/** The fields to read in the collect and results phases: the Quick Check until it is complete, then the current Business Plan step; everything when files came. */
export function extractScope(state: ConversationState, attachments: number): ExtractScope {
  const qc = includesQuickCheck(state.module)
  const bp = includesBusinessPlan(state.module)
  if (state.phase === "results" || attachments > 0) return { quickCheck: qc, bpSteps: bp ? BUSINESS_PLAN_STEPS : [] }
  const qcOpen = qc && run(state.project).status !== "complete"
  if (qcOpen || !bp) return { quickCheck: qc, bpSteps: [] }
  const step = BUSINESS_PLAN_STEPS[Math.min(state.bpStep ?? 0, BUSINESS_PLAN_STEPS.length - 1)]
  return { quickCheck: false, bpSteps: [step] }
}

/** Intents that carry no project data by themselves. */
const NO_DATA: readonly (Intent | null)[] = ["question", "wants_file", "declines_file", "stop"]

/**
 * Decides what one email does to the conversation (PLAN-AGENT-07 step 6), before any model
 * reads it: stop, hand-off, start over, the menu choice and the file choice from the reply or
 * from Jev's intent, whether to answer a question, and which fields to read. Pure, so every
 * path has a test; the models run after this, and `finishTurn` writes the reply.
 */
export function planTurn(input: TurnInput): TurnPlan {
  const { parsed, intent, action, attachments, now } = input
  if (parsed.command === "stop" || (parsed.command === null && intent === "stop")) return { kind: "stop", hadConversation: input.state !== null }
  if (parsed.command === "human") return { kind: "handoff" }

  const restarted = parsed.command === "new" && input.state !== null
  let state: ConversationState = !input.state || parsed.command === "new" ? newConversation(input.locale, input.threadId, now) : input.state
  const fresh = !input.state || restarted
  state = { ...state, locale: input.locale, rounds: state.rounds + 1 }

  const sendFile = parsed.command === "file" || intent === "wants_file"
  const intentFile = intent === "wants_file" ? true : intent === "declines_file" ? false : null
  const wantsFile = sendFile ? true : state.wantsFile === null ? (parsed.wantsFile ?? intentFile) : (intentFile ?? state.wantsFile)
  state = { ...state, wantsFile }

  const base = { restarted, sendFile, next: parsed.command === "next", menuAgain: false, chose: null }
  if (state.rounds > MAX_ROUNDS && parsed.command !== "new") return { kind: "turn", state, ...base, limit: true, answer: false, extract: null }

  const smallTalk = action === "small_talk"
  const answer = !smallTalk && intent === "question"
  const data = !smallTalk && parsed.command === null && (attachments > 0 || !NO_DATA.includes(intent) || parsed.hasNumbers)

  if (state.phase === "menu") {
    const named = parsed.module ?? (intent ? INTENT_MODULE[intent] : undefined) ?? null
    const chosen = named ?? (data && (attachments > 0 || intent === "answers" || intent === "documents") ? "quickCheck" : null)
    if (!chosen) return { kind: "turn", state, ...base, limit: false, answer, extract: null, menuAgain: !fresh && !answer && !smallTalk }
    state = withModule(state, chosen, now)
    // A short menu answer ("1, yes") carries no values; a longer first email may.
    const extract = attachments > 0 || (parsed.module === null && data) ? extractScope(state, attachments) : null
    return { kind: "turn", state, ...base, limit: false, answer, extract, chose: named ? "explicit" : "default" }
  }
  return { kind: "turn", state, ...base, limit: false, answer, extract: data ? extractScope(state, attachments) : null }
}

/**
 * A project file the sender attached becomes the draft (D-13), validated and migrated like an
 * import. The module named in the conversation stays; a module only assumed because data came
 * with the first email gives way to the file's own.
 */
export function adoptProject(state: ConversationState, imported: Project, chose: TurnStep["chose"], now: number): ConversationState {
  const choice = chose === "default" || state.module === null ? moduleOf(imported) : state.module
  const patch = { "meta.modules.quickCheck": includesQuickCheck(choice), "meta.modules.businessPlan": includesBusinessPlan(choice) }
  const phase = state.phase === "menu" ? "collect" : state.phase
  return { ...state, module: choice, phase, project: applyPatch(imported, patch, { now: new Date(now) }).project }
}

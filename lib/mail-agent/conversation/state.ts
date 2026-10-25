import "server-only"
import { z } from "zod"
import { LOCALES, type Locale } from "@/lib/i18n/locales"
import { createProject, projectSchema, type Project } from "@/lib/project"
import { BUSINESS_PLAN_STEPS } from "@/lib/project/fields/steps"
import { open, seal } from "../store/crypto"
import { keys, TTL } from "../store/keys"
import type { MailStore } from "../store/store"

export const MODULES = ["quickCheck", "businessPlan", "both"] as const
export type ModuleChoice = (typeof MODULES)[number]

export const PHASES = ["menu", "collect", "results"] as const
export type Phase = (typeof PHASES)[number]

/** Email ids already applied, so a retried step never applies the same email twice. */
const HANDLED_KEPT = 20

/** At most this many emails per conversation; then the agent points to the dashboard. */
export const MAX_ROUNDS = 40

/** The reply to the latest email, kept with the state it belongs to, so a retried step resends it instead of computing again. */
export const STORED_REPLY = z.strictObject({
  emailId: z.string().max(128),
  kind: z.string().max(40),
  locale: z.enum(LOCALES),
  text: z.string().max(100_000),
  html: z.string().max(400_000).optional(),
  attachments: z
    .array(z.strictObject({ filename: z.string().max(200), content: z.string().max(2_000_000), contentType: z.string().max(100) }))
    .max(1)
    .optional(),
})

export type StoredReply = z.infer<typeof STORED_REPLY>

/**
 * One sender's conversation (PLAN-AGENT-07 step 5), sealed in `conv:{sid}` for 30 days after the
 * last message: the language, the phase, the module and file choice, the Business Plan step being
 * asked, the draft project (from `createProject`, changed only through `applyPatch`), the field
 * ids last asked, and a revision for optimistic locking.
 */
const STATE = z.strictObject({
  v: z.literal(1),
  locale: z.enum(LOCALES),
  phase: z.enum(PHASES),
  module: z.enum(MODULES).nullable(),
  wantsFile: z.boolean().nullable(),
  /** Index into BUSINESS_PLAN_STEPS of the step being asked; its length when all were asked. */
  bpStep: z.int().min(0).max(BUSINESS_PLAN_STEPS.length).nullable(),
  project: projectSchema,
  asked: z.array(z.string().max(200)).max(200),
  rounds: z.int().min(0),
  threadId: z.string().max(128),
  handled: z.array(z.string().max(128)).max(HANDLED_KEPT),
  reply: STORED_REPLY.nullable(),
  rev: z.int().min(0),
  updatedAt: z.iso.datetime(),
})

export type ConversationState = z.infer<typeof STATE>

/** A fresh conversation in the menu phase; the draft starts with the Quick Check switched on. */
export function newConversation(locale: Locale, threadId: string, now: number): ConversationState {
  return {
    v: 1,
    locale,
    phase: "menu",
    module: null,
    wantsFile: null,
    bpStep: null,
    project: createProject({ modules: { quickCheck: true }, now: new Date(now) }),
    asked: [],
    rounds: 0,
    threadId,
    handled: [],
    reply: null,
    rev: 0,
    updatedAt: new Date(now).toISOString(),
  }
}

/** Where the conversation stands, as Jev's `phase` (PLAN-AGENT-06 step 9): new, menu, collect:quick-check, collect:business-plan:<step>, results. */
export function guardPhase(state: ConversationState | null): string {
  if (!state) return "new"
  if (state.phase !== "collect") return state.phase
  if (state.bpStep === null) return "collect:quick-check"
  return `collect:business-plan:${BUSINESS_PLAN_STEPS[Math.min(state.bpStep, BUSINESS_PLAN_STEPS.length - 1)]}`
}

/** Remembers an applied email id (the newest few). */
export function withHandled(state: ConversationState, emailId: string): ConversationState {
  return { ...state, handled: [...state.handled.filter((id) => id !== emailId), emailId].slice(-HANDLED_KEPT) }
}

/** The sender's conversation, or null when there is none or it cannot be read (it then starts over). */
export async function loadConversation(store: MailStore, secret: Uint8Array, sid: string): Promise<ConversationState | null> {
  const key = keys.conversation(sid)
  const sealed = await store.get(key)
  if (!sealed) return null
  const plain = await open(secret, key, sealed)
  if (!plain) return null
  try {
    const parsed = STATE.safeParse(JSON.parse(plain))
    return parsed.success ? (parsed.data as ConversationState & { project: Project }) : null
  } catch {
    return null
  }
}

/** Saves the conversation sealed, with the next revision and 30 more days (D-56). */
export async function saveConversation(store: MailStore, secret: Uint8Array, sid: string, state: ConversationState, now: number): Promise<ConversationState> {
  const key = keys.conversation(sid)
  const next = { ...state, rev: state.rev + 1, updatedAt: new Date(now).toISOString() }
  await store.set(key, await seal(secret, key, JSON.stringify(next)), { ttlMs: TTL.conversation })
  return next
}

export async function deleteConversation(store: MailStore, sid: string): Promise<void> {
  await store.del(keys.conversation(sid))
}

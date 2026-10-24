import "server-only"
import type { MailAgentConfig } from "../env"
import type { InboundEmail } from "../inbound/transport"
import type { MailStore } from "../store/store"

/** Why an email goes no further; each is logged as a code, the sender hears nothing. */
export type DropReason =
  | "done"
  | "no-address"
  | "dmarc"
  | "loop"
  | "blocked"
  | "banned"
  | "rate-sender"
  | "rate-domain"
  | "rate-global"
  | "too-large"
  | "budget"

export type GateResult = { ok: true } | { ok: false; reason: DropReason }

export interface GateContext {
  email: InboundEmail & { from: string }
  /** HMAC ids of the sender and of the sender's domain. */
  sid: string
  domainSid: string
  domain: string
  config: MailAgentConfig
  store: MailStore
  now: number
}

export type Gate = (context: GateContext) => Promise<GateResult> | GateResult

export const pass: GateResult = { ok: true }
export const drop = (reason: DropReason): GateResult => ({ ok: false, reason })

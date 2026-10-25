import "server-only"
import { OPERATOR } from "@/lib/legal/operator"
import type { InboundEmail } from "../inbound/transport"
import { normalizeAddress } from "../store/sender-id"
import { drop, pass, type Gate } from "./types"

/** Local parts of automatic senders. */
const ROBOT = /^(mailer-daemon|postmaster|no-?reply|do-?not-?reply|bounces?|auto-?reply)([+._-].*)?$/i
const LIST_HEADERS = ["list-id", "list-unsubscribe", "list-post", "x-autoreply", "x-autorespond", "x-auto-response-suppress-sender"]

/**
 * Whether a machine sent the email: auto-replies (`Auto-Submitted` other than `no`,
 * `X-Autoreply`), bulk and list mail (`Precedence`, `List-*`), bounces (empty Return-Path,
 * MAILER-DAEMON, postmaster) and no-reply senders.
 */
export function isAutomated(email: Pick<InboundEmail, "headers"> & { from: string }): boolean {
  const header = (name: string) => email.headers[name]?.trim().toLowerCase()
  const autoSubmitted = header("auto-submitted")
  if (autoSubmitted && autoSubmitted !== "no") return true
  if (/^(bulk|list|junk|auto_reply)$/.test(header("precedence") ?? "")) return true
  if (LIST_HEADERS.some((name) => name in email.headers)) return true
  if (header("return-path") === "<>") return true
  const [local] = email.from.split("@")
  return ROBOT.test(local)
}

/** Gate 3: no mail loops and no automated mail (PLAN-AGENT-06 step 7.3), and nothing from our own inboxes. */
export const loopGate: Gate = ({ email, config }) => {
  if (isAutomated(email)) return drop("loop")
  // Our inboxes only: the admin address may write to the agent (its auto-replies carry the headers above).
  const own = [config.addresses.agent, OPERATOR.emailAgent, OPERATOR.emailHuman].map(normalizeAddress)
  return own.includes(normalizeAddress(email.from)) ? drop("loop") : pass
}

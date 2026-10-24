import "server-only"
import { OPERATOR } from "@/lib/legal/operator"
import { normalizeAddress } from "../store/sender-id"
import { drop, pass, type Gate } from "./types"

/** Local parts of automatic senders. */
const ROBOT = /^(mailer-daemon|postmaster|no-?reply|do-?not-?reply|bounces?|auto-?reply)([+._-].*)?$/i
const LIST_HEADERS = ["list-id", "list-unsubscribe", "list-post", "x-autoreply", "x-autorespond", "x-auto-response-suppress-sender"]

/**
 * Gate 3: no mail loops and no automated mail (PLAN-AGENT-06 step 7.3). Drops auto-replies
 * (`Auto-Submitted` other than `no`, `X-Autoreply`), bulk and list mail (`Precedence`,
 * `List-*`), bounces (empty Return-Path, MAILER-DAEMON, postmaster), no-reply senders, and mail
 * from our own inboxes.
 */
export const loopGate: Gate = ({ email, config }) => {
  const header = (name: string) => email.headers[name]?.trim().toLowerCase()
  const autoSubmitted = header("auto-submitted")
  if (autoSubmitted && autoSubmitted !== "no") return drop("loop")
  if (/^(bulk|list|junk|auto_reply)$/.test(header("precedence") ?? "")) return drop("loop")
  if (LIST_HEADERS.some((name) => name in email.headers)) return drop("loop")
  if (header("return-path") === "<>") return drop("loop")
  const [local] = email.from.split("@")
  if (ROBOT.test(local)) return drop("loop")
  // Our inboxes only: the admin address may write to the agent (its auto-replies carry the headers above).
  const own = [config.addresses.agent, OPERATOR.emailAgent, OPERATOR.emailHuman].map(normalizeAddress)
  return own.includes(normalizeAddress(email.from)) ? drop("loop") : pass
}

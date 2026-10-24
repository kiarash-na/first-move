import "server-only"
import type { Resend } from "resend"

/** Older or newer signatures than this are refused (on top of the library's own check). */
export const TIMESTAMP_WINDOW_SECONDS = 300

export type Verified = { ok: true; payload: unknown; svixId: string } | { ok: false }

/**
 * Verifies a webhook on its raw body (PLAN-AGENT-06 step 5): the Svix headers must be present,
 * the timestamp within five minutes, and the signature valid for our secret (`verify` makes no
 * API call). Failures carry no detail, so a probe learns nothing.
 */
export function verifyWebhook(resend: Pick<Resend, "webhooks">, raw: string, headers: Headers, secret: string, now: number): Verified {
  const id = headers.get("svix-id")
  const timestamp = headers.get("svix-timestamp")
  const signature = headers.get("svix-signature")
  if (!id || !timestamp || !signature || !/^\d{1,12}$/.test(timestamp)) return { ok: false }
  if (Math.abs(now / 1000 - Number(timestamp)) > TIMESTAMP_WINDOW_SECONDS) return { ok: false }
  try {
    const payload = resend.webhooks.verify({ payload: raw, headers: { id, timestamp, signature }, webhookSecret: secret })
    return { ok: true, payload, svixId: id }
  } catch {
    return { ok: false }
  }
}

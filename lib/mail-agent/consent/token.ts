import "server-only"
import { timingSafeEqual } from "node:crypto"
import { hmacId } from "../store/sender-id"

const VERSION = "v1"
const FORMAT = /^v1\.([A-Za-z0-9_-]{16,64})\.(\d{9,11})\.([A-Za-z0-9_-]{43})$/

/** How long a confirm link works (the pending email waits as long, D-54). */
export const CONFIRM_DAYS = 7

/**
 * The token id for the email that asks for consent: an HMAC of its Resend id, so a retried step
 * sends the same link (an identical body under the same idempotency key), and nobody without
 * `EMAIL_CONFIRM_SECRET` can derive it. 22 characters, 132 bits.
 */
export async function tokenIdFor(secret: Uint8Array, emailId: string): Promise<string> {
  return (await hmacId(secret, `id.${emailId}`)).slice(0, 22)
}

const signature = (secret: Uint8Array, tokenId: string, expires: number) => hmacId(secret, `${VERSION}.${tokenId}.${expires}`)

/** `v1.<tokenId>.<expires>.<hmac>` (PLAN-AGENT-06 step 8): HMAC-SHA-256 with `EMAIL_CONFIRM_SECRET`, expiry in seconds. */
export async function confirmToken(secret: Uint8Array, tokenId: string, expiresAt: number): Promise<string> {
  return `${VERSION}.${tokenId}.${expiresAt}.${await signature(secret, tokenId, expiresAt)}`
}

export type TokenCheck = { ok: true; tokenId: string } | { ok: false; reason: "invalid" | "expired" }

/** Checks a token's form, signature (constant time) and expiry; single use is the store's job. */
export async function readConfirmToken(secret: Uint8Array, token: string, now: number): Promise<TokenCheck> {
  const match = FORMAT.exec(token)
  if (!match) return { ok: false, reason: "invalid" }
  const [, tokenId, expires, given] = match
  const expected = Buffer.from(await signature(secret, tokenId, Number(expires)))
  const actual = Buffer.from(given)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return { ok: false, reason: "invalid" }
  if (Number(expires) * 1000 <= now) return { ok: false, reason: "expired" }
  return { ok: true, tokenId }
}

/** The outcomes the confirm page has copy for (`mail.json` `confirm.result.*`). */
export type ConfirmResult = "confirmed" | "expired" | "used" | "invalid" | "error"

/**
 * The confirm route's status codes as page copy (PLAN-AGENT-06 step 8). The route lives in
 * `lib/mail-agent/consent/confirm.ts` (server only), so the page keeps this small table itself;
 * a test holds the two together. Anything unexpected is an error to try again later.
 */
export function resultForStatus(status: number): ConfirmResult {
  if (status === 200) return "confirmed"
  if (status === 410) return "expired"
  if (status === 409) return "used"
  if (status === 400 || status === 403) return "invalid"
  return "error"
}

/** The token from the link's fragment (`#t=v1.…`); a fragment never reaches server logs or a Referer. */
export function tokenFromHash(hash: string): string | null {
  const token = new URLSearchParams(hash.replace(/^#/, "")).get("t")?.trim()
  return token ? token : null
}

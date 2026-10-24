/**
 * localStorage key of the dismissed cookie notice (lib/legal/notice.ts). The suites start with it
 * set, so the fixed bottom-left notice never sits on top of the controls they click; `legal.spec.ts`
 * starts without it and tests the notice itself.
 */
export const NOTICE_ACK_KEY = "first-move:notice-ack"

/** A Playwright storage state in which the notice was already dismissed on `origin`. */
export function noticeDismissed(origin: string) {
  return {
    cookies: [],
    origins: [{ origin, localStorage: [{ name: NOTICE_ACK_KEY, value: "1" }] }],
  }
}

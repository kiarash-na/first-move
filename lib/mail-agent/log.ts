import "server-only"

export type LogValue = string | number | boolean | null

/** Codes, ids and numbers only: no spaces, no `@`, at most 80 characters. Anything else is dropped. */
const CODE = /^[A-Za-z0-9_.:/-]{0,80}$/

const safe = (value: LogValue): LogValue => (typeof value === "string" && !CODE.test(value) ? "[omitted]" : value)

/** The start of a sender id: enough to follow one sender through the logs, not to look one up. */
export const sidPrefix = (sid: string) => sid.slice(0, 8)

/**
 * One structured log line for the email agent (PLAN-AGENT-06 step 13): reason codes, timings and
 * `sidPrefix` only. A string that could be content (spaces, an address) is replaced, so an
 * address, a subject or body text never reaches the logs, even by mistake.
 */
export function logEvent(event: string, fields: Record<string, LogValue> = {}): void {
  const line: Record<string, LogValue> = { scope: "mail-agent", event: safe(event) }
  for (const [name, value] of Object.entries(fields)) if (CODE.test(name)) line[name] = safe(value)
  console.info(JSON.stringify(line))
}

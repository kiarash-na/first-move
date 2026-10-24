import { describe, expect, it } from "vitest"
import { dayOf, keys, TTL } from "./keys"

describe("store keys", () => {
  it("puts every key under the prefix", () => {
    expect(keys.event("msg_2abc")).toBe("fm:mail:evt:msg_2abc")
    expect(keys.done("00000000-0000-4000-8000-000000000a06")).toBe("fm:mail:done:00000000-0000-4000-8000-000000000a06")
    expect(keys.rate("sender-hour", "sid_1", 493_512.7)).toBe("fm:mail:rl:sender-hour:sid_1:493512")
    expect(keys.budget("2026-10-24")).toBe("fm:mail:budget:2026-10-24")
    expect(keys.alertOnce("budget", "2026-10-24")).toBe("fm:mail:alert-once:budget:2026-10-24")
  })

  it.each(["", "a b", "a/b", "evt:*", "x".repeat(129), "a\nb", "ä"])("refuses the id %j", (bad) => {
    expect(() => keys.event(bad)).toThrow("Invalid store key part")
  })

  it("refuses a malformed day", () => {
    expect(() => keys.budget("2026-10-24T00")).toThrow("Invalid store key day")
  })

  it("keeps the retention of D-56", () => {
    const day = 86_400_000
    expect(TTL).toMatchObject({ pending: 7 * day, consent: 365 * day, conversation: 30 * day, strikes: 90 * day, ban: 30 * day, block: null })
  })

  it("names UTC days", () => {
    expect(dayOf(Date.UTC(2026, 9, 24, 23, 59))).toBe("2026-10-24")
  })
})

// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { logEvent, sidPrefix } from "./log"

describe("logEvent", () => {
  afterEach(() => vi.restoreAllMocks())

  it("writes one JSON line of codes and numbers", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    logEvent("dropped", { sid: sidPrefix("AbCdEfGhIjKlMnOp"), reason: "rate-sender", ms: 12 })
    expect(info).toHaveBeenCalledWith(JSON.stringify({ scope: "mail-agent", event: "dropped", sid: "AbCdEfGh", reason: "rate-sender", ms: 12 }))
  })

  it("never writes an address, a subject or body text, even when handed one", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    logEvent("dropped", { from: "jane@example.org", subject: "Quick Check for our village", "bad key!": 1, ok: true })
    const line = String(info.mock.calls[0][0])
    expect(line).not.toContain("jane")
    expect(line).not.toContain("village")
    expect(JSON.parse(line)).toEqual({ scope: "mail-agent", event: "dropped", from: "[omitted]", subject: "[omitted]", ok: true })
  })
})

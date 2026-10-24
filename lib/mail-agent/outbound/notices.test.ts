// @vitest-environment node
import { describe, expect, it } from "vitest"
import { confirmNotice, notice } from "./notices"

describe("notices", () => {
  it.each(["warning", "ban", "block", "unavailable"] as const)("%s is filled in completely", async (kind) => {
    const { kind: named, text } = await notice(kind)
    expect(named).toBe(kind)
    expect(text).not.toMatch(/\{\w+\}/)
    expect(text).toMatch(/^Hello,/)
  })

  it("name the 30-day ban", async () => {
    expect((await notice("warning")).text).toContain("paused for 30 days")
    expect((await notice("ban")).text).toContain("paused for 30 days")
  })

  it("ask for confirmation with the link, the Terms and the seven days", async () => {
    const { kind, text } = await confirmNotice("https://firstmove.energy/en/mail/confirm#t=v1.a.1.b", "https://firstmove.energy/en/terms")
    expect(kind).toBe("confirm")
    expect(text).toContain("\n\nhttps://firstmove.energy/en/mail/confirm#t=v1.a.1.b\n\n")
    expect(text).toContain("(https://firstmove.energy/en/terms)")
    expect(text).toContain("up to 7 days")
    expect(text).not.toMatch(/\{\w+\}/)
  })
})

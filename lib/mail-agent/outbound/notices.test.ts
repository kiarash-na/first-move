// @vitest-environment node
import { describe, expect, it } from "vitest"
import { testConfig } from "../gates/test-utils/context"
import { confirmNotice, notice } from "./notices"

const config = testConfig()
const link = "https://firstmove.energy/en/mail/confirm#t=v1.a.1.b"

describe("notices", () => {
  it.each(["warning", "ban", "block", "unavailable"] as const)("%s is a complete email in HTML and text", async (kind) => {
    const { kind: named, text, html } = await notice(config, "en", kind)
    expect(named).toBe(kind)
    expect(text).not.toMatch(/\{\w+\}/)
    expect(text).toMatch(/^First Move\n\n.+\n\nHello,/)
    expect(text).toContain("Written by an AI system")
    expect(html).toMatch(/^<!DOCTYPE html><html lang="en">/)
  })

  it("name the 30-day ban", async () => {
    expect((await notice(config, "en", "warning")).text).toContain("paused for 30 days")
    expect((await notice(config, "en", "ban")).text).toContain("paused for 30 days")
  })

  it("speak German to a German sender", async () => {
    const { text, html } = await notice(config, "de", "warning")
    expect(text).toContain("Guten Tag,")
    expect(text).toContain("30 Tage")
    expect(html).toContain('<html lang="de">')
    expect(html).toContain("https://firstmove.energy/de/terms")
  })

  it("ask for confirmation with the link as a button, the Terms and the seven days", async () => {
    const { kind, text, html } = await confirmNotice(config, "en", link)
    expect(kind).toBe("confirm")
    expect(html).toContain(`<a href="${link}"`)
    expect(text).toContain(`Confirm my request (${link})`)
    expect(text).toContain("Terms (https://firstmove.energy/en/terms)")
    expect(text).toContain("up to 7 days")
    expect(text).not.toMatch(/\{\w+\}/)
  })
})

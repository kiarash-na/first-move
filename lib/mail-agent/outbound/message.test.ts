// @vitest-environment node
import { describe, expect, it } from "vitest"
import { testConfig } from "../gates/test-utils/context"
import { composeMessage, composeReply, sitePage } from "./message"

const config = testConfig()
const section = { kicker: "Answer", title: "Your question", accent: "ink" as const, blocks: [{ type: "text" as const, text: "Hello there" }] }

describe("composeMessage", () => {
  it("wraps the sections with brand, greeting, sign-off and the disclosure footer", async () => {
    const message = await composeMessage(config, "en", [section], { commands: true })
    expect(message).toMatchObject({ locale: "en", preheader: "Your question", greeting: "Hello,", signoff: "First Move assistant" })
    expect(message.footer.humanAddress).toBe("human@mail.firstmove.energy")
    expect(message.footer.links.map((link) => link.href)).toEqual(["https://firstmove.energy/en/terms", "https://firstmove.energy/en/privacy"])
    expect(message.footer.commands).toMatch(/new/)
  })

  it("speaks German and links the German pages", async () => {
    const message = await composeMessage(config, "de", [section])
    expect(message.greeting).toBe("Guten Tag,")
    expect(message.footer.links[0].href).toBe("https://firstmove.energy/de/terms")
    expect(message.footer.commands).toBeUndefined()
  })
})

describe("composeReply", () => {
  it("renders the reply and carries the file", async () => {
    const attachment = { filename: "x.firstmove.json", content: "e30=", contentType: "application/json" }
    const reply = await composeReply(config, "en", "conversation", [section], { attachment })
    expect(reply.kind).toBe("conversation")
    expect(reply.text).toContain("Hello there")
    expect(reply.html).toContain("Hello there")
    expect(reply.attachments).toEqual([attachment])
  })
})

describe("sitePage", () => {
  it("builds a page address in the language", () => {
    expect(sitePage(config, "de", "/docs")).toBe("https://firstmove.energy/de/docs")
  })
})

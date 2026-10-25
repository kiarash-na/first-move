// @vitest-environment node
import { describe, expect, it } from "vitest"
import { emailLocale } from "./email-locale"

describe("emailLocale", () => {
  it("answers in the language of the new text, not of the quoted history", () => {
    const text = "Hallo, wir haben 42 Gebäude und möchten einen Quick Check.\n\nOn Mon, 1 Jan 2026, agent wrote:\n> Hello, what would you like to do? Please reply with the number."
    expect(emailLocale({ subject: "Re: First Move", text })).toBe("de")
  })

  it("keeps the conversation's language when a reply is too short to tell", () => {
    expect(emailLocale({ subject: "Re: First Move", text: "1, ja" }, "de")).toBe("de")
    expect(emailLocale({ subject: "", text: "1" })).toBe("en")
  })
})

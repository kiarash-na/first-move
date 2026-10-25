// @vitest-environment node
import { describe, expect, it } from "vitest"
import { loadTexts } from "./texts"

describe("loadTexts", () => {
  it("loads the conversation's dictionaries in the language, German over English", async () => {
    const de = await loadTexts("de")
    expect(de.mail.layout.greeting).toBe("Guten Tag,")
    expect(de.texts["quick-check"]).toBe(de.quickCheck)
    expect((await loadTexts("en")).calc.ui.title).toBe("How we calculate")
  })
})

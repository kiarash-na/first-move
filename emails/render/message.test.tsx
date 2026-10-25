// @vitest-environment node
import { describe, expect, it } from "vitest"
import { testMessage } from "../test-utils/message"
import { renderMessage } from "./message"

describe("renderMessage", () => {
  it("renders one message to an HTML document and its text", () => {
    const { html, text } = renderMessage(testMessage([{ kicker: "Notice", accent: "ink", blocks: [{ type: "text", text: "Please try again later." }] }]))
    expect(html.startsWith('<!DOCTYPE html><html lang="en">')).toBe(true)
    expect(text).toContain("Notice\n\nPlease try again later.")
  })
})

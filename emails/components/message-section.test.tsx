// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { COLORS } from "../theme"
import { MessageSection } from "./message-section"

describe("MessageSection", () => {
  it("opens with the kicker and title in the accent, then its blocks", () => {
    const node = <MessageSection section={{ kicker: "Business Plan", title: "Your Business Plan", accent: "hot", blocks: [{ type: "text", text: "Nothing filled in yet." }] }} />
    expect(renderHtml(node)).toContain(`border-top:3px solid ${COLORS.hot}`)
    expect(renderText(node)).toBe("Business Plan\n\nYour Business Plan\n\nNothing filled in yet.")
  })
})

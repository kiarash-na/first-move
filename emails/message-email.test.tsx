// @vitest-environment node
import { describe, expect, it } from "vitest"
import { MessageEmail } from "./message-email"
import { renderHtml } from "./render/html"
import { renderMessage } from "./render/message"
import { renderText } from "./render/text"
import { testMessage } from "./test-utils/message"

const message = testMessage([
  { kicker: "Answer", title: "Your question", accent: "ink", blocks: [{ type: "text", text: "<script>alert(1)</script> Heat pumps lift the temperature." }] },
  { kicker: "Quick Check result", accent: "cool", blocks: [{ type: "verdict", level: "promising", label: "Promising", description: "Favorable conditions identified" }] },
])

describe("MessageEmail", () => {
  it("renders greeting, sections, sign-off and footer, in HTML and in text", () => {
    const text = renderText(<MessageEmail message={message} />)
    expect(text.startsWith("First Move\n\nScreening for fifth-generation district heating and cooling\n\nHello,\n\nAnswer\n\nYour question")).toBe(true)
    expect(text).toContain("Promising\n\nFavorable conditions identified\n\nFirst Move assistant\n\nWritten by an AI system.")
  })

  it("keeps model and user text as text: an injected script never becomes markup", () => {
    const html = renderHtml(<MessageEmail message={message} />)
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;")
  })

  it("links only to the site and to human@, and loads nothing remote", () => {
    const { html } = renderMessage(message)
    const links = [...html.matchAll(/href="([^"]+)"/g)].map(([, href]) => href)
    expect(links.every((href) => href.startsWith("https://firstmove.energy/") || href === "mailto:human@mail.firstmove.energy")).toBe(true)
    expect(html).not.toMatch(/<img|src=|url\(|@import|<link/i)
  })

  it("stays far below the size where Gmail clips a message", () => {
    expect(Buffer.byteLength(renderMessage(message).html)).toBeLessThan(20_000)
  })
})

// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { Paragraph } from "./paragraph"

describe("Paragraph", () => {
  it("splits paragraphs on blank lines and keeps single line breaks", () => {
    const node = <Paragraph text={"First line\nsecond line\n\nNext paragraph"} />
    expect(renderHtml(node).match(/<p /g)).toHaveLength(2)
    expect(renderHtml(node)).toContain("First line<br>second line")
    expect(renderText(node)).toBe("First line\nsecond line\n\nNext paragraph")
  })

  it("keeps injected markup as text", () => {
    const html = renderHtml(<Paragraph text={"<img src=x onerror=alert(1)>"} tone="muted" />)
    expect(html).not.toContain("<img")
    expect(html).toContain("&lt;img")
  })
})

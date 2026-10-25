// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { EmailLayout } from "./email-layout"

const node = (
  <EmailLayout lang="de" title="First Move" preheader="Preview line" header={<td>Header</td>} footer={<td>Footer</td>}>
    <p>Body</p>
  </EmailLayout>
)

describe("EmailLayout", () => {
  it("is a light, 600px, table layout in the email's language", () => {
    const html = renderHtml(node)
    expect(html).toMatch(/^<html lang="de"><head>/)
    expect(html).toContain('<meta name="color-scheme" content="light">')
    expect(html).toContain("max-width:600px")
    expect(html).not.toMatch(/radius|<img|<script|https?:\/\/(?!firstmove)/)
  })

  it("keeps the preview line and the head out of the text version", () => {
    expect(renderText(node)).toBe("Header\n\nBody\n\nFooter")
  })
})

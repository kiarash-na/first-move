// @vitest-environment node
import { describe, expect, it } from "vitest"
import { MAX_HTML_BYTES, renderEmail } from "./email"

describe("renderEmail", () => {
  it("returns the HTML document and its text version", () => {
    const { html, text } = renderEmail(
      <html lang="en">
        <body>
          <p>Hello</p>
        </body>
      </html>,
    )
    expect(html).toBe('<!DOCTYPE html><html lang="en"><body><p>Hello</p></body></html>')
    expect(text).toBe("Hello")
  })

  it("refuses an email above the size limit", () => {
    expect(() => renderEmail(<p>{"x".repeat(MAX_HTML_BYTES)}</p>)).toThrow(/size limit/)
  })
})

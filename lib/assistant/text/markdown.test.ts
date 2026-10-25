import { describe, expect, it } from "vitest"
import { parseInline, parseMarkdown, sitePath } from "./markdown"

describe("assistant Markdown subset", () => {
  it("keeps paragraphs, line breaks and lists", () => {
    expect(parseMarkdown("First line\nsecond line\n\n- one\n- two\n\n1. a\n2. b")).toEqual([
      { type: "paragraph", inline: [{ type: "text", text: "First line\nsecond line" }] },
      { type: "list", ordered: false, items: [[{ type: "text", text: "one" }], [{ type: "text", text: "two" }]] },
      { type: "list", ordered: true, items: [[{ type: "text", text: "a" }], [{ type: "text", text: "b" }]] },
    ])
  })

  it("reads bold, code and headings", () => {
    expect(parseInline("The **economic ratio** is `E`.")).toEqual([
      { type: "text", text: "The " },
      { type: "strong", text: "economic ratio" },
      { type: "text", text: " is " },
      { type: "code", text: "E" },
      { type: "text", text: "." },
    ])
    expect(parseMarkdown("## Result")).toEqual([{ type: "paragraph", inline: [{ type: "strong", text: "Result" }] }])
  })

  it("links only to First Move pages, as in-app paths", () => {
    expect(parseInline("See [the docs](/en/docs/quick-check#results).")).toEqual([
      { type: "text", text: "See " },
      { type: "link", text: "the docs", href: "/en/docs/quick-check#results" },
      { type: "text", text: "." },
    ])
    expect(parseInline("[site](https://firstmove.energy/de/docs)")).toEqual([{ type: "link", text: "site", href: "/de/docs" }])
    for (const href of ["https://evil.example/x", "//evil.example", "/api/mail/inbound", "data:text/html,x", "https://firstmove.energy.evil.example/en"]) {
      expect(parseInline(`[click](${href})`), href).toEqual([{ type: "text", text: "click" }])
    }
    // Not even read as a link: it stays literal text.
    expect(parseInline("[click](javascript:alert(1))").some((part) => part.type === "link")).toBe(false)
    expect(sitePath("https://user:pw@firstmove.energy/en")).toBeNull()
  })

  it("never turns HTML or images into anything but text", () => {
    const html = '<img src=x onerror="alert(1)"><script>steal()</script>'
    expect(parseMarkdown(html)).toEqual([{ type: "paragraph", inline: [{ type: "text", text: html }] }])
    expect(parseInline("![chart](https://evil.example/pixel.png)")).toEqual([{ type: "text", text: "chart" }])
  })
})

import { describe, expect, it } from "vitest"
import { htmlToText } from "./html-to-text"

describe("htmlToText", () => {
  it("keeps the text with line breaks for blocks", () => {
    expect(htmlToText("<p>Hello,</p><p>we have <b>120</b> buildings.<br>Area: 12&nbsp;ha</p>")).toBe("Hello,\nwe have 120 buildings.\nArea: 12 ha")
  })

  it("drops scripts, styles, comments and the head", () => {
    expect(htmlToText('<head><title>x</title><style>p{}</style></head><script>alert(1)</script><!-- hidden -->Text')).toBe("Text")
  })

  it("decodes entities and lists", () => {
    expect(htmlToText("<ul><li>A &amp; B</li><li>&lt;C&gt; &#228; &#x1F600;</li></ul>")).toBe("- A & B\n- <C> ä 😀")
    expect(htmlToText("&bogus; &#0; ok")).toBe("&bogus; ok")
  })
})

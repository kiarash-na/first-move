// @vitest-environment node
import { describe, expect, it } from "vitest"
import { escapeHtml, renderHtml, styleText } from "./html"

function Greeting({ name }: { name: string }) {
  return <p className="hello">Hello {name}</p>
}

describe("renderHtml", () => {
  it("renders elements, attributes, fragments, arrays and function components", () => {
    const html = renderHtml(
      <div style={{ padding: 8, lineHeight: 1.5, fontFamily: "Arial" }}>
        <>
          <Greeting name="Ada" />
          {["a", "b"].map((letter) => (
            <span key={letter}>{letter}</span>
          ))}
        </>
        <br />
        {null}
        {false}
        {3}
      </div>,
    )
    expect(html).toBe('<div style="padding:8px;line-height:1.5;font-family:Arial"><p class="hello">Hello Ada</p><span>a</span><span>b</span><br>3</div>')
  })

  it("escapes text and attribute values, so injected markup stays text", () => {
    const html = renderHtml(<td title={'"><script>x</script>'}>{"<script>alert(1)</script> & <b>"}</td>)
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt; &amp; &lt;b&gt;")
    expect(html).toContain('title="&quot;&gt;&lt;script&gt;x&lt;/script&gt;"')
  })

  it("keeps only https and mailto links", () => {
    expect(renderHtml(<a href="https://firstmove.energy/en/docs">docs</a>)).toBe('<a href="https://firstmove.energy/en/docs">docs</a>')
    expect(renderHtml(<a href="mailto:human@mail.firstmove.energy">x</a>)).toContain('href="mailto:')
    expect(renderHtml(<a href="javascript:alert(1)">x</a>)).toBe("<a>x</a>")
    expect(renderHtml(<a href="http://example.com">x</a>)).toBe("<a>x</a>")
  })

  it("refuses raw HTML, event handlers and unsafe styles", () => {
    expect(() => renderHtml(<div dangerouslySetInnerHTML={{ __html: "<b>x</b>" }} />)).toThrow(/Raw HTML/)
    expect(() => renderHtml(<div onClick={() => {}} />)).toThrow(/not allowed/)
    expect(() => styleText({ color: "red;background:url(x)" })).toThrow(/Unsafe/)
  })

  it("escapes the five special characters", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;")
  })
})

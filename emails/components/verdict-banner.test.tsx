// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { COLORS } from "../theme"
import { VerdictBanner } from "./verdict-banner"

describe("VerdictBanner", () => {
  it("draws the level in its colour and reads as text without the decorative mark", () => {
    const node = <VerdictBanner level="promising" label="Promising" description="Favorable conditions identified" />
    expect(renderHtml(node)).toContain(`border-top:3px solid ${COLORS.cool}`)
    expect(renderText(node)).toBe("Promising\n\nFavorable conditions identified")
  })

  it("uses orange for not promising and shows the forced badge", () => {
    const html = renderHtml(<VerdictBanner level="not_promising" label="Not promising" description="Unfavorable" badge="Set by a fixed rule" />)
    expect(html).toContain(COLORS.hot)
    expect(html).toContain("Set by a fixed rule")
  })
})

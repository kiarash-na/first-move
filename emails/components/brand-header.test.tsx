// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { COLORS } from "../theme"
import { BrandHeader } from "./brand-header"

const header = (
  <table>
    <tbody>
      <tr>
        <BrandHeader brand="First Move" tagline="Screening for 5GDHC" />
      </tr>
    </tbody>
  </table>
)

describe("BrandHeader", () => {
  it("draws the two logo nodes without images and names the brand", () => {
    const html = renderHtml(header)
    expect(html).toContain(COLORS.cyanNode)
    expect(html).toContain(COLORS.orangeNode)
    expect(html).not.toMatch(/<img|url\(/)
    expect(renderText(header)).toBe("First Move\n\nScreening for 5GDHC")
  })
})

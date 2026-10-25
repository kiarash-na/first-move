// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { COLORS } from "../theme"
import { BulletList } from "./bullet-list"

describe("BulletList", () => {
  it("lists items with a decorative marker in the accent", () => {
    const node = <BulletList items={["Ground water", "Ambient air"]} accent="hot" />
    expect(renderHtml(node)).toContain(COLORS.hot)
    expect(renderText(node)).toBe("- Ground water\n- Ambient air")
  })
})

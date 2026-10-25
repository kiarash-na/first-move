// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { COLORS } from "../theme"
import { ValueRows } from "./value-rows"

describe("ValueRows", () => {
  it("puts each label next to its value, with notes under the label", () => {
    const node = (
      <ValueRows
        title="Taken from your email"
        rows={[
          { label: "Total number of buildings", value: "42" },
          { label: "Total project area", value: "35,000 m²", note: "from plan.pdf" },
        ]}
      />
    )
    expect(renderText(node)).toBe("Taken from your email\n\nTotal number of buildings  42\nTotal project area\nfrom plan.pdf  35,000 m²")
  })

  it("marks a risk in orange", () => {
    expect(renderHtml(<ValueRows rows={[{ label: "Low connection rate", value: "Deal-breaker", tone: "hot" }]} />)).toContain(`border-left:3px solid ${COLORS.hot}`)
  })
})

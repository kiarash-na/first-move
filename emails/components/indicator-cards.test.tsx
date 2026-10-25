// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { COLORS } from "../theme"
import { IndicatorCards } from "./indicator-cards"

describe("IndicatorCards", () => {
  it("shows value, class and effect, coloured by the effect", () => {
    const node = (
      <IndicatorCards
        items={[
          { label: "Heating coverage", value: "120%", classLabel: "Feasible", effect: "supporting", effectLabel: "Supporting" },
          { label: "Heat density", value: "0.9", classLabel: "Low", effect: "limiting", effectLabel: "Limiting" },
          { label: "CH ratio", value: "0.12", classLabel: "Heating dominated", effect: null },
        ]}
      />
    )
    const html = renderHtml(node)
    expect(html).toContain(`border-top:3px solid ${COLORS.cool}`)
    expect(html).toContain(`border-top:3px solid ${COLORS.hot}`)
    const text = renderText(node)
    expect(text).toContain("Heating coverage\n\n120%\n\nFeasible · Supporting")
    expect(text).toContain("CH ratio\n\n0.12\n\nHeating dominated")
  })
})

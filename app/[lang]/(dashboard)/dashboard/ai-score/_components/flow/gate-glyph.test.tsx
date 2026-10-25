import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AI_GATE_OUTCOMES } from "@/lib/project"
import { GateGlyph } from "./gate-glyph"

describe("GateGlyph", () => {
  it("draws each outcome with its own shape, not only its own colour", () => {
    const shapes = AI_GATE_OUTCOMES.map((outcome) => {
      const { container, unmount } = render(<GateGlyph outcome={outcome} />)
      const svg = container.querySelector("svg")!
      expect(svg).toHaveAttribute("aria-hidden", "true")
      expect(svg).toHaveAttribute("data-outcome", outcome)
      const shape = [...svg.querySelectorAll("polygon, path")].map((node) => `${node.tagName}:${node.getAttribute("points") ?? node.getAttribute("d")}:${node.getAttribute("stroke-dasharray") ?? ""}`).join("|")
      unmount()
      return shape
    })
    expect(new Set(shapes).size).toBe(AI_GATE_OUTCOMES.length)
  })

  it("fills only a failed check in the risk colour", () => {
    const { container } = render(<GateGlyph outcome="fail" />)
    expect(container.querySelector("polygon")).toHaveAttribute("fill", "var(--accent-hot)")
  })
})

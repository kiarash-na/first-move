import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MiniHistogram } from "./mini-histogram"

describe("MiniHistogram", () => {
  it("draws one column per level, as tall as its probability, hidden from assistive tech", () => {
    const { container } = render(<MiniHistogram probabilities={[0, 0.1, 0.5, 0.4, 0]} />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("aria-hidden", "true")
    const bars = [...svg.querySelectorAll("rect")]
    expect(bars.map((bar) => bar.getAttribute("height"))).toEqual(["1", "2", "9", "7", "1"])
    expect(bars[2]).toHaveAttribute("fill", "var(--level-2)")
  })
})

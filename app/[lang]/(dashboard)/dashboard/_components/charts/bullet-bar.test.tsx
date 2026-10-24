import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { BulletBar } from "./bullet-bar"

const ticks = [
  { at: 0.7, label: "70%" },
  { at: 0.9, label: "90%" },
  { at: 1, label: "100%" },
]

describe("BulletBar", () => {
  it("draws one band per interval, the measure and the target", () => {
    const { container } = render(<BulletBar value={0.75} max={1.5} ticks={ticks} target={1} tone="cool" />)
    expect(container.querySelectorAll("[data-band]")).toHaveLength(4)
    const measure = container.querySelector("[data-measure]")!
    expect(Number(measure.getAttribute("width"))).toBeCloseTo(150, 5)
    expect(measure).toHaveAttribute("fill", "var(--chart-1)")
    expect(Number(container.querySelector("[data-target]")!.getAttribute("x1"))).toBeCloseTo(200, 5)
    expect(container.textContent).toContain("90%")
  })

  it("stops the measure at the end of the scale and uses orange for the hot tone", () => {
    const { container } = render(<BulletBar value={3} max={1.5} ticks={ticks} target={1} tone="hot" />)
    const measure = container.querySelector("[data-measure]")!
    expect(Number(measure.getAttribute("width"))).toBe(300)
    expect(measure).toHaveAttribute("fill", "var(--chart-2)")
  })

  it("is hidden from assistive technology (the value is text elsewhere)", () => {
    const { container } = render(<BulletBar value={0} max={1.5} ticks={ticks} target={1} tone="cool" />)
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })
})

import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CoverageScale } from "./coverage-scale"

describe("CoverageScale", () => {
  it("fills up to the value on a 0-150 % scale with the TBL-7 ticks", () => {
    const { container } = render(<CoverageScale value={0.75} supporting={false} />)
    const fill = container.querySelector("[data-fill]") as HTMLElement
    expect(fill.style.width).toBe("50%")
    expect(fill).toHaveClass("bg-hot")
    expect(container.querySelector("[data-slot=coverage-scale]")).toHaveAttribute("aria-hidden", "true")
    expect(container.querySelectorAll("[data-slot=coverage-scale] > span")).toHaveLength(3)
  })

  it("caps values above the scale", () => {
    const { container } = render(<CoverageScale value={10} supporting />)
    expect((container.querySelector("[data-fill]") as HTMLElement).style.width).toBe("100%")
  })
})

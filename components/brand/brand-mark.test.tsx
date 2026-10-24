import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { BrandMark } from "./brand-mark"

describe("BrandMark", () => {
  it("is decorative and takes extra classes", () => {
    const { container } = render(<BrandMark className="size-7" />)
    const svg = container.querySelector("svg")!
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveClass("brand-mark", "size-7")
  })

  it("draws the knight's move: a start node, the pipe with its pulses, and the glowing end node (D-68)", () => {
    const { container } = render(<BrandMark />)
    expect(container.querySelectorAll(".brand-mark__dot")).toHaveLength(5)
    const paths = [...container.querySelectorAll("path")]
    expect(new Set(paths.map((path) => path.getAttribute("d")))).toEqual(new Set(["M6 21.5V6h6.5"]))
    expect(container.querySelectorAll(".brand-mark__pulse")).toHaveLength(2)
    expect(container.querySelector(".brand-mark__start")).not.toBeNull()
    expect(container.querySelector(".brand-mark__end")).not.toBeNull()
  })

  it("gives every mark its own glow filter, so two marks on a page do not share an id", () => {
    const { container } = render(
      <>
        <BrandMark />
        <BrandMark />
      </>,
    )
    const ids = [...container.querySelectorAll("filter")].map((filter) => filter.id)
    expect(new Set(ids).size).toBe(2)
    for (const glow of container.querySelectorAll(".brand-mark__glow")) {
      expect(ids.map((id) => `url(#${id})`)).toContain(glow.getAttribute("filter"))
    }
  })
})

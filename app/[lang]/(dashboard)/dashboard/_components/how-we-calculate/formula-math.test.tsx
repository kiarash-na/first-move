import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { FORMULAS } from "@/lib/quick-check"
import { FormulaMath } from "./formula-math"

describe("FormulaMath", () => {
  it("renders the build-time MathML of an equation", () => {
    const { container } = render(<FormulaMath id="EQ-3.4a" />)
    const math = container.querySelector("math")
    expect(math).not.toBeNull()
    expect(math?.getAttribute("display")).toBe("block")
    expect(container.querySelector("annotation")?.textContent).toBe(FORMULAS["EQ-3.4a"].latex)
  })

  it("is a named, focusable scroller with an edge fade, so a wide formula can be scrolled by keyboard (375px)", () => {
    render(<FormulaMath id="EQ-3.9a" label="EQ-3.9a Heating supply" />)
    const scroller = screen.getByRole("group", { name: "EQ-3.9a Heating supply" })
    expect(scroller).toHaveAttribute("tabindex", "0")
    expect(scroller).toHaveClass("scroll-fade-x")
  })

  it("renders nothing for a value without an equation (EQ-3.7)", () => {
    const { container } = render(<FormulaMath id="EQ-3.7" />)
    expect(container).toBeEmptyDOMElement()
  })
})

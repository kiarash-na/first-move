import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Separator } from "./separator"

describe("Separator", () => {
  it("is decorative by default and semantic on request", () => {
    const { container } = render(<Separator />)
    expect(container.querySelector("[data-slot=separator]")).toHaveAttribute("data-orientation", "horizontal")
    render(<Separator decorative={false} orientation="vertical" />)
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical")
  })
})

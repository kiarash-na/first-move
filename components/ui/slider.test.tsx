import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Slider } from "./slider"

describe("Slider", () => {
  it("renders one square thumb per value and moves with the keyboard", async () => {
    render(<Slider aria-label="COP" defaultValue={[40]} max={100} step={10} />)
    const thumb = screen.getByRole("slider")
    expect(thumb).toHaveAttribute("aria-valuenow", "40")
    expect(thumb.className).toContain("size-[15px]")
    thumb.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(thumb).toHaveAttribute("aria-valuenow", "50")
  })

  it("renders two thumbs for a range", () => {
    render(<Slider defaultValue={[10, 90]} />)
    expect(screen.getAllByRole("slider")).toHaveLength(2)
  })
})

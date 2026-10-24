import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Input } from "./input"
import { Label } from "./label"

describe("Input and Label", () => {
  it("associates the visible label and accepts typing", async () => {
    render(
      <>
        <Label htmlFor="area">Area</Label>
        <Input id="area" />
      </>,
    )
    const input = screen.getByLabelText("Area")
    await userEvent.type(input, "1.234,5")
    expect(input).toHaveValue("1.234,5")
    expect(input.className).toContain("h-11")
  })

  it("marks invalid input", () => {
    render(<Input aria-label="Buildings" aria-invalid />)
    expect(screen.getByLabelText("Buildings")).toHaveAttribute("aria-invalid", "true")
  })

  it("styles the label as a mono uppercase control label", () => {
    render(<Label>Label</Label>)
    expect(screen.getByText("Label").className).toMatch(/font-mono.*uppercase|uppercase.*font-mono/)
  })
})

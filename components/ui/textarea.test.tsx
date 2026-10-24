import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Label } from "./label"
import { Textarea } from "./textarea"

describe("Textarea", () => {
  it("associates the visible label and keeps line breaks as typed", async () => {
    render(
      <>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" />
      </>,
    )
    const area = screen.getByLabelText("Notes")
    await userEvent.type(area, "First{Enter}Second")
    expect(area).toHaveValue("First\nSecond")
  })

  it("has no radius, a visible line and a comfortable minimum height", () => {
    render(<Textarea aria-label="Text" className="extra" />)
    const area = screen.getByLabelText("Text")
    expect(area.className).toContain("border")
    expect(area.className).toContain("min-h-28")
    expect(area.className).toContain("extra")
    expect(area.className).not.toMatch(/rounded/)
  })

  it("marks invalid input and honours maxLength", async () => {
    render(<Textarea aria-label="Short" aria-invalid maxLength={3} />)
    const area = screen.getByLabelText("Short")
    expect(area).toHaveAttribute("aria-invalid", "true")
    await userEvent.type(area, "abcdef")
    expect(area).toHaveValue("abc")
  })
})

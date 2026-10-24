import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Toggle } from "./toggle"

describe("Toggle", () => {
  it("exposes its state with aria-pressed", async () => {
    render(<Toggle variant="outline">PV</Toggle>)
    const toggle = screen.getByRole("button", { name: "PV" })
    expect(toggle).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-pressed", "true")
    expect(toggle.className).toContain("data-[state=on]:text-primary")
  })
})

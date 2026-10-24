import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Switch } from "./switch"

describe("Switch", () => {
  it("toggles its checked state", async () => {
    render(<Switch aria-label="Play with parameters" />)
    const control = screen.getByRole("switch", { name: "Play with parameters" })
    expect(control).toHaveAttribute("aria-checked", "false")
    await userEvent.click(control)
    expect(control).toHaveAttribute("aria-checked", "true")
  })
})

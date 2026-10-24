import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

describe("Popover", () => {
  it("opens from its trigger and closes with Escape", async () => {
    render(
      <Popover>
        <PopoverTrigger>Info</PopoverTrigger>
        <PopoverContent aria-label="Details">Body text</PopoverContent>
      </Popover>,
    )
    expect(screen.queryByText("Body text")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Info" }))
    const panel = screen.getByRole("dialog", { name: "Details" })
    expect(panel).toHaveTextContent("Body text")
    expect(panel.className).toContain("border")
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByText("Body text")).not.toBeInTheDocument()
  })
})

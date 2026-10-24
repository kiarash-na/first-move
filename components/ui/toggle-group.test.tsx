import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { ToggleGroup, ToggleGroupItem } from "./toggle-group"

describe("ToggleGroup", () => {
  it("selects one item and passes the group variant to items", async () => {
    render(
      <ToggleGroup type="single" variant="hot" aria-label="Module">
        <ToggleGroupItem value="qc">Quick Check</ToggleGroupItem>
        <ToggleGroupItem value="bp">Business Plan</ToggleGroupItem>
      </ToggleGroup>,
    )
    const bp = screen.getByRole("radio", { name: "Business Plan" })
    await userEvent.click(bp)
    expect(bp).toHaveAttribute("data-state", "on")
    expect(bp).toHaveAttribute("data-variant", "hot")
    expect(screen.getByRole("radio", { name: "Quick Check" })).toHaveAttribute("data-state", "off")
  })
})

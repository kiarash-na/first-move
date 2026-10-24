import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select"

describe("Select", () => {
  it("shows the placeholder in a 44px trigger", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Potential">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>,
    )
    const trigger = screen.getByRole("combobox", { name: "Potential" })
    expect(trigger).toHaveTextContent("Choose")
    expect(trigger.className).toContain("h-11")
  })

  it("lists items when open and marks the selected one", () => {
    render(
      <Select defaultOpen defaultValue="high">
        <SelectTrigger aria-label="Potential">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Potential</SelectLabel>
            <SelectItem value="low">Low</SelectItem>
            <SelectSeparator />
            <SelectItem value="high">High</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    )
    expect(screen.getByRole("option", { name: "Low" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "High" })).toHaveAttribute("data-state", "checked")
  })
})

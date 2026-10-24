import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu"

describe("DropdownMenu", () => {
  it("renders items with 44px rows and a destructive variant", () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger>Project</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Project</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Rename <DropdownMenuShortcut>R</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem checked>Quick Check</DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="en">
            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const rename = screen.getByRole("menuitem", { name: /Rename/ })
    expect(rename.className).toContain("min-h-11")
    expect(screen.getByRole("menuitemcheckbox", { name: "Quick Check" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("menuitemradio", { name: "English" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveAttribute("data-variant", "destructive")
  })
})

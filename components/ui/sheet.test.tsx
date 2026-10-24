import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./sheet"

describe("Sheet", () => {
  it("opens from the chosen side and closes with the labelled button", async () => {
    render(
      <Sheet>
        <SheetTrigger>Menu</SheetTrigger>
        <SheetContent side="left" closeLabel="Close navigation">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Pages</SheetDescription>
          </SheetHeader>
          <SheetFooter>Footer</SheetFooter>
        </SheetContent>
      </Sheet>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Menu" }))
    const sheet = screen.getByRole("dialog", { name: "Navigation" })
    expect(sheet.className).toContain("left-0")
    await userEvent.click(screen.getByRole("button", { name: "Close navigation" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

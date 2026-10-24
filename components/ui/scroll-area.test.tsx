import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScrollArea } from "./scroll-area"

describe("ScrollArea", () => {
  it("renders its content inside the viewport", () => {
    render(
      <ScrollArea className="h-20">
        <p>Long list</p>
      </ScrollArea>,
    )
    const content = screen.getByText("Long list")
    expect(content.closest("[data-slot=scroll-area-viewport]")).not.toBeNull()
  })
})

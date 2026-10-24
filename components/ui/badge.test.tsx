import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Badge } from "./badge"

describe("Badge", () => {
  it("is cyan by default and orange for hot", () => {
    render(
      <>
        <Badge>Promising</Badge>
        <Badge variant="hot">Risk</Badge>
      </>,
    )
    expect(screen.getByText("Promising").className).toContain("text-primary")
    expect(screen.getByText("Risk").className).toContain("text-hot")
  })

  it("can render as a link", () => {
    render(
      <Badge asChild variant="outline">
        <a href="#x">Tag</a>
      </Badge>,
    )
    expect(screen.getByRole("link", { name: "Tag" })).toHaveAttribute("data-slot", "badge")
  })
})

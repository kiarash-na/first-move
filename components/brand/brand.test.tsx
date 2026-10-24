import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Brand } from "./brand"

describe("Brand", () => {
  it("shows the name and links home with an accessible label", () => {
    render(<Brand href="/de" name="First Move" label="First Move, zurück zur Website" />)
    const link = screen.getByRole("link", { name: "First Move, zurück zur Website" })
    expect(link).toHaveAttribute("href", "/de")
    expect(link).toHaveTextContent("First Move")
  })
})

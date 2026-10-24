import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"

describe("Card", () => {
  it("renders all slots in a flat, bordered panel", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )
    const card = screen.getByTestId("card")
    expect(card).toHaveAttribute("data-slot", "card")
    expect(card.className).toContain("border")
    expect(card.className).not.toMatch(/rounded|shadow/)
    for (const text of ["Title", "Description", "Action", "Content", "Footer"]) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
  })
})

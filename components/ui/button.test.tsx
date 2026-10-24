import Link from "next/link"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button, buttonVariants } from "./button"

describe("Button", () => {
  it("renders a 44px primary button by default", () => {
    render(<Button>Start</Button>)
    const button = screen.getByRole("button", { name: "Start" })
    expect(button).toHaveAttribute("data-variant", "default")
    expect(button.className).toContain("h-11")
    expect(button.className).toContain("bg-primary")
  })

  it("renders its child element with asChild", () => {
    render(
      <Button asChild variant="secondary">
        <Link href="/en">Home</Link>
      </Button>,
    )
    const link = screen.getByRole("link", { name: "Home" })
    expect(link).toHaveAttribute("href", "/en")
    expect(link.className).toContain("bg-control")
  })

  it("uses orange for hot and destructive variants (no new hues)", () => {
    expect(buttonVariants({ variant: "hot" })).toContain("bg-hot")
    expect(buttonVariants({ variant: "destructive" })).toContain("bg-destructive")
  })

  it("has no rounded corners", () => {
    expect(buttonVariants()).not.toMatch(/rounded/)
  })
})

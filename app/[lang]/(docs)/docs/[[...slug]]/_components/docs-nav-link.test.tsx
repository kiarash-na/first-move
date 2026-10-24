import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DocsNavLink } from "./docs-nav-link"

describe("DocsNavLink", () => {
  it("marks the current page for assistive technology and with the foreground line", () => {
    render(<DocsNavLink href="/en/docs/quick-check" label="Quick Check" active />)
    const link = screen.getByRole("link", { name: "Quick Check" })
    expect(link).toHaveAttribute("href", "/en/docs/quick-check")
    expect(link).toHaveAttribute("aria-current", "page")
    expect(link.className).toContain("border-foreground")
  })

  it("leaves other pages unmarked", () => {
    render(<DocsNavLink href="/en/docs" label="Introduction" active={false} />)
    const link = screen.getByRole("link", { name: "Introduction" })
    expect(link).not.toHaveAttribute("aria-current")
    expect(link.className).toContain("border-transparent")
  })
})

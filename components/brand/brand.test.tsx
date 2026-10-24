import { render, screen } from "@testing-library/react"
import { createRef, type ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"
import { Brand } from "./brand"

// Records the prefetch prop, which the real Link does not put in the DOM.
vi.mock("next/link", () => ({
  default: ({ prefetch, ...props }: ComponentProps<"a"> & { prefetch?: boolean | null }) => (
    <a data-prefetch={String(prefetch)} {...props} />
  ),
}))

describe("Brand", () => {
  it("shows the name and links home with an accessible label", () => {
    render(<Brand href="/de" name="First Move" label="First Move, zurück zur Website" />)
    const link = screen.getByRole("link", { name: "First Move, zurück zur Website" })
    expect(link).toHaveAttribute("href", "/de")
    expect(link).toHaveTextContent("First Move")
    expect(link).toHaveAttribute("data-prefetch", "undefined")
  })

  it("passes prefetch through to the link", () => {
    render(<Brand href="/en" name="First Move" label="Home" prefetch={false} />)
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("data-prefetch", "false")
  })

  it("passes other link props and the ref through, so a tooltip can wrap it", () => {
    const ref = createRef<HTMLAnchorElement>()
    render(<Brand ref={ref} href="/en" name="First Move" label="Home" data-state="closed" nameClassName="rail:hidden" />)
    const link = screen.getByRole("link", { name: "Home" })
    expect(ref.current).toBe(link)
    expect(link).toHaveAttribute("data-state", "closed")
    expect(screen.getByText("First Move")).toHaveClass("rail:hidden")
  })
})

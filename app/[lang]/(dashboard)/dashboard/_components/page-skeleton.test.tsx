import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PageSkeleton } from "./page-skeleton"

describe("PageSkeleton", () => {
  it("is a busy placeholder with an accessible name", () => {
    render(<PageSkeleton label="Loading" />)
    expect(screen.getByLabelText("Loading")).toHaveAttribute("aria-busy", "true")
  })
})

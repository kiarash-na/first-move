import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Skeleton } from "./skeleton"

describe("Skeleton", () => {
  it("renders a pulsing square placeholder", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />)
    const skeleton = container.querySelector("[data-slot=skeleton]")
    expect(skeleton?.className).toContain("animate-pulse")
    expect(skeleton?.className).toContain("w-20")
    expect(skeleton?.className).not.toMatch(/rounded/)
  })
})

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Progress } from "./progress"

describe("Progress", () => {
  it("shows the value as a 2px bar", () => {
    render(<Progress aria-label="Step progress" value={40} />)
    const bar = screen.getByRole("progressbar", { name: "Step progress" })
    expect(bar.className).toContain("h-0.5")
    const indicator = bar.querySelector("[data-slot=progress-indicator]") as HTMLElement
    expect(indicator.style.transform).toBe("translateX(-60%)")
    expect(indicator.className).toContain("bg-primary")
  })

  it("uses orange for the Business Plan tone", () => {
    render(<Progress aria-label="BP" value={10} tone="hot" />)
    const indicator = screen.getByRole("progressbar").querySelector("[data-slot=progress-indicator]")
    expect(indicator?.className).toContain("bg-hot")
  })
})

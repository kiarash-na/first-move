import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { HealingLoop } from "./healing-loop"

const copy = en.slides.selfHealing
const motion = (reduce: boolean) => vi.stubGlobal("matchMedia", () => ({ matches: reduce, addEventListener() {}, removeEventListener() {} }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("HealingLoop", () => {
  it("names the four stages in order", () => {
    render(<HealingLoop copy={copy} />)
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(copy.stages.map((stage, index) => `${index + 1}${stage}`))
  })

  it("runs the loop stage by stage after an error and ends fixed and reviewed", () => {
    motion(false)
    vi.useFakeTimers()
    const { container } = render(<HealingLoop copy={copy} />)
    const button = screen.getByRole("button", { name: copy.break })
    act(() => button.click())
    expect(container.querySelector(".healing")).toHaveAttribute("data-step", "0")
    expect(screen.getByText(copy.stages[0], { selector: ".healing__status" })).toBeInTheDocument()
    expect(button).toHaveAttribute("aria-disabled", "true")
    act(() => button.click())
    expect(container.querySelector(".healing")).toHaveAttribute("data-step", "0")
    for (let step = 0; step < 4; step++) act(() => vi.advanceTimersByTime(1300))
    expect(container.querySelector(".healing")).toHaveAttribute("data-step", "4")
    expect(screen.getByText(copy.healed)).toBeInTheDocument()
    expect(button).toHaveAttribute("aria-disabled", "false")
  })

  it("jumps straight to the end with reduced motion", async () => {
    motion(true)
    render(<HealingLoop copy={copy} />)
    await userEvent.click(screen.getByRole("button", { name: copy.break }))
    expect(screen.getByText(copy.healed)).toBeInTheDocument()
  })
})

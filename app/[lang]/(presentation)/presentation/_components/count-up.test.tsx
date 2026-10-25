import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CountUp } from "./count-up"

const motion = (reduce: boolean) => vi.stubGlobal("matchMedia", () => ({ matches: reduce, addEventListener() {}, removeEventListener() {} }))

afterEach(() => vi.unstubAllGlobals())

describe("CountUp", () => {
  it("renders the formatted final value for the server and for screen readers", () => {
    render(<CountUp value={1000} lang="de" active={false} />)
    expect(screen.getAllByText("1.000")).toHaveLength(2)
  })

  it("formats euros per language and rests on the exact value with reduced motion", () => {
    motion(true)
    const { container } = render(<CountUp value={180} lang="en" style="eur" active />)
    expect(container).toHaveTextContent("€180")
  })

  it("counts the visible digits from zero while screen readers keep the final value", () => {
    motion(false)
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback))
    vi.stubGlobal("cancelAnimationFrame", () => {})
    const { container } = render(<CountUp value={100} lang="en" active duration={1000} />)
    const [visible, spoken] = container.querySelectorAll(".count-up > span")
    const start = performance.now()
    frames.shift()?.(start)
    expect(Number(visible.textContent)).toBeLessThan(100)
    frames.shift()?.(start + 1000)
    expect(visible).toHaveTextContent("100")
    expect(spoken).toHaveTextContent("100")
  })
})

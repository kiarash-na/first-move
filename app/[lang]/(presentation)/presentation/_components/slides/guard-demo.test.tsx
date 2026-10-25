import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { GuardDemo } from "./guard-demo"

const copy = en.slides.systemOne
const motion = (reduce: boolean) => vi.stubGlobal("matchMedia", () => ({ matches: reduce, addEventListener() {}, removeEventListener() {} }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("GuardDemo", () => {
  it("is labelled a scripted demo and waits for a sample email", () => {
    render(<GuardDemo lang="en" copy={copy} thresholds="Thresholds in code" />)
    expect(screen.getByText(copy.demoLabel)).toBeInTheDocument()
    expect(screen.getAllByText("–")).toHaveLength(4)
    expect(screen.getByText("Thresholds in code")).toBeInTheDocument()
  })

  it("blocks the injection and passes the question on to System 2", async () => {
    motion(true)
    const { container } = render(<GuardDemo lang="en" copy={copy} thresholds="" />)
    const injection = screen.getByRole("button", { name: new RegExp(copy.samples.injection.slice(0, 20)) })
    await userEvent.click(injection)
    expect(injection).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText(copy.verdicts.block)).toBeInTheDocument()
    expect(screen.getByText("0.97")).toBeInTheDocument()
    expect(container.querySelector(".system--slow")).not.toHaveAttribute("data-on")
    await userEvent.click(screen.getByRole("button", { name: new RegExp(copy.samples.question.slice(0, 20)) }))
    expect(screen.getByText(copy.verdicts.allow)).toBeInTheDocument()
    expect(container.querySelector(".system--slow")).toHaveAttribute("data-on", "true")
  })

  it("lets System 1 think for a moment before the code decides", () => {
    motion(false)
    vi.useFakeTimers()
    const { container } = render(<GuardDemo lang="en" copy={copy} thresholds="" />)
    act(() => screen.getByRole("button", { name: new RegExp(copy.samples.offTopic.slice(0, 20)) }).click())
    expect(container.querySelector(".system--fast")).toHaveAttribute("data-busy", "true")
    expect(screen.queryByText(copy.verdicts.strike)).toBeNull()
    act(() => vi.advanceTimersByTime(650))
    expect(screen.getByText(copy.verdicts.strike)).toBeInTheDocument()
  })
})

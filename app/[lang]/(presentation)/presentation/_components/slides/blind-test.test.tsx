import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { BlindTest, type BlindTestView } from "./blind-test"

const copy = en.slides.aiEngine
const view: BlindTestView = {
  seats: [
    { id: "value", name: "Value", score: 0.7, capped: false },
    { id: "technology", name: "Technology", score: 0.5, capped: true },
  ],
  score: 55,
  band: 3,
  levelName: "Promising",
  turns: 4,
  input: "A real plan from 30 October 2017. Name and outcome removed.",
  inputUrl: "https://example.org/plan.pdf",
  decided: "Decided in 1.4 s",
  gates: "3 pass · 7 fail · 6 unclear",
  mustHave: ["System boundary"],
  action: "Decide who owns the boreholes.",
  outcome: [{ text: "Construction started in 2018", url: "https://example.org/built" }],
  recorded: "Recorded run, 25 October 2026",
  tryHref: "/en/dashboard/ai-score",
}

const motion = (reduce: boolean) => vi.stubGlobal("matchMedia", () => ({ matches: reduce, addEventListener() {}, removeEventListener() {} }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("BlindTest", () => {
  it("states what went in and links the plan before anything runs", () => {
    render(<BlindTest lang="en" view={view} copy={copy} />)
    expect(screen.getByText(/30 October 2017/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: copy.blindSource })).toHaveAttribute("rel", "noopener noreferrer")
    expect(screen.queryByText(view.outcome[0].text)).toBeNull()
  })

  it("replays the run turn by turn, then shows the score and the decisions", async () => {
    motion(false)
    vi.useFakeTimers()
    const { container } = render(<BlindTest lang="en" view={view} copy={copy} />)
    act(() => screen.getByRole("button", { name: copy.run }).click())
    expect(container.querySelector(".blind")).toHaveAttribute("data-phase", "running")
    for (let turn = 0; turn <= view.turns; turn++) act(() => vi.advanceTimersByTime(520))
    expect(container.querySelector(".blind")).toHaveAttribute("data-phase", "scored")
    expect(screen.getByText(/Decided in 1.4 s/)).toBeInTheDocument()
    expect(screen.getByText("System boundary")).toBeInTheDocument()
    expect(screen.getByText(/Decide who owns the boreholes/)).toBeInTheDocument()
    expect(screen.getAllByText("55").length).toBeGreaterThan(0)
  })

  it("reveals what really happened, with sources, and moves focus along", async () => {
    motion(true)
    render(<BlindTest lang="en" view={view} copy={copy} />)
    await userEvent.click(screen.getByRole("button", { name: copy.run }))
    const reveal = screen.getByRole("button", { name: copy.reveal })
    expect(reveal).toHaveFocus()
    await userEvent.click(reveal)
    expect(screen.getByText(copy.outcomeLabel)).toHaveFocus()
    expect(screen.getByText(view.outcome[0].text)).toBeInTheDocument()
    const source = screen.getByRole("link", { name: copy.sourceLink })
    expect(source).toHaveAttribute("href", "https://example.org/built")
    expect(source).toHaveAttribute("target", "_blank")
    expect(source).toHaveAttribute("rel", "noopener noreferrer")
    expect(screen.getByText(copy.caveat)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: copy.tryIt })).toHaveAttribute("href", "/en/dashboard/ai-score")
  })
})

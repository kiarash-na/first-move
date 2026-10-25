import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it } from "vitest"

import type { AiScore } from "@/lib/project"
import { applyEvent, startProgress } from "../run/progress"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example, scored } from "../test-utils/scored"
import { DecisionFlow } from "./decision-flow"

const copy = aiScoreCopy().flow
let score: AiScore
beforeAll(async () => {
  score = await scored()
})

describe("DecisionFlow", () => {
  it("shows the waiting flow with its legend before the first run", () => {
    renderAiScore(<DecisionFlow source={{ mode: "idle" }} />, { store: aiScoreStore(example()).store })
    expect(screen.getByRole("region", { name: copy.title })).toHaveTextContent(copy.placeholder)
    expect(screen.getByRole("group", { name: copy.legend.label })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: copy.how.title })).toBeInTheDocument()
  })

  it("never skips a heading level: the panel is an h2, each column an h3 (axe heading-order)", () => {
    renderAiScore(<DecisionFlow source={{ mode: "saved", score, changed: [], writing: false }} />, { store: aiScoreStore(example()).store })
    const levels = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((heading) => Number(heading.tagName[1]))
    expect(levels[0]).toBe(2)
    expect(levels.slice(1).every((level, index) => level - levels[index] <= 1)).toBe(true)
    expect(screen.getByRole("heading", { level: 3, name: copy.columns.read })).toBeInTheDocument()
  })

  it("pulses the running turn during a run", () => {
    const progress = applyEvent(applyEvent(startProgress(), { type: "turn-start", turn: 0, questions: 0 }), { type: "turn-end", turn: 0, nodes: [], inputTokens: 0 })
    renderAiScore(<DecisionFlow source={{ mode: "live", progress: applyEvent(progress, { type: "turn-start", turn: 1, questions: 9 }) }} />, {
      store: aiScoreStore(example()).store,
    })
    const running = document.querySelector("[data-column='1']")!
    expect(running).toHaveAttribute("data-state", "running")
    expect(running).toHaveAttribute("aria-busy", "true")
    expect(running.querySelectorAll("[data-slot='ghost']")).toHaveLength(6)
  })

  it("switches between the graph and its table twin", async () => {
    renderAiScore(<DecisionFlow source={{ mode: "saved", score, changed: [], writing: false }} />, { store: aiScoreStore(example()).store })
    expect(screen.getByRole("list", { name: copy.title })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: copy.view.table }))
    expect(screen.queryByRole("list", { name: copy.title })).not.toBeInTheDocument()
    expect(screen.getByRole("table", { name: copy.table.caption })).toBeInTheDocument()
  })
})

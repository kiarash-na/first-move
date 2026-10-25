import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { applyEvent, startProgress } from "./progress"
import { RunProgressList } from "./run-progress"

describe("RunProgressList", () => {
  it("lists turn 0, the four Jev turns and the report, with the running one current", () => {
    let progress = startProgress()
    progress = applyEvent(progress, { type: "turn-start", turn: 0, questions: 0 })
    progress = applyEvent(progress, { type: "turn-end", turn: 0, nodes: [], inputTokens: 0 })
    progress = applyEvent(progress, { type: "turn-start", turn: 1, questions: 12 })
    renderAiScore(<RunProgressList progress={progress} />, { store: aiScoreStore(example()).store })
    const list = screen.getByRole("list", { name: "Progress of the run" })
    const items = within(list).getAllByRole("listitem")
    expect(items.map((item) => item.dataset.state)).toEqual(["done", "running", "pending", "pending", "pending", "pending"])
    expect(items[0]).toHaveTextContent("Turn 0 · Read the plan")
    expect(items[0]).toHaveTextContent("No AI")
    expect(items[1]).toHaveAttribute("aria-current", "step")
    expect(items[1]).toHaveTextContent("Turn 1 · Opportunity")
    expect(items[1]).toHaveTextContent("Running")
    expect(items[1]).toHaveTextContent("12 questions")
    expect(items[5]).toHaveTextContent("Report")
    expect(screen.getByRole("status")).toHaveTextContent("Turn 1 · Opportunity: Running")
  })
})

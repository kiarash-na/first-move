import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import type { JudgementView } from "./flow-model"
import { JudgementNode } from "./judgement-node"

const base: JudgementView = { kind: "judgement", id: "financing", turn: 3, dimension: "economics", source: "model", level: 2.4, probabilities: [0, 0.1, 0.45, 0.4, 0.05], changed: false }
const show = (node: Partial<JudgementView>, lang: "en" | "de" = "en") => renderAiScore(<JudgementNode node={{ ...base, ...node }} />, { store: aiScoreStore(example()).store, lang })

describe("JudgementNode", () => {
  it("shows the name, the expected level as text and the distribution, filled on the ramp", () => {
    show({})
    const node = screen.getByRole("button", { name: /Financing/ })
    expect(node).toHaveTextContent("2.4 · Specific")
    expect(node).toHaveAttribute("data-flow-node", "judgement:financing")
    expect(node).toHaveAttribute("data-source", "model")
    expect(node.querySelector("[data-slot='swatch']")?.getAttribute("style")).toContain("var(--level-2)")
    expect(node.querySelector("[data-slot='mini-histogram']")).not.toBeNull()
  })

  it("opens the detail: step, dimension, level, histogram, confidence and spread", async () => {
    show({})
    await userEvent.click(screen.getByRole("button", { name: /Financing/ }))
    const dialog = screen.getByRole("dialog", { name: "Financing" })
    expect(dialog).toHaveTextContent("Reality check")
    expect(dialog).toHaveTextContent("Costs, revenues and financing")
    expect(dialog).toHaveTextContent("Scored by Jev")
    expect(dialog).toHaveTextContent("2.4 of 4 · Specific")
    expect(screen.getByRole("table", { name: "Probability per level" })).toBeInTheDocument()
    expect(dialog).toHaveTextContent("Confidence")
    expect(dialog).toHaveTextContent("± 0.7 levels")
  })

  it("hatches an empty part, dashes one without an answer and flags a changed one", async () => {
    const { unmount } = show({ source: "empty", level: 0, probabilities: null })
    const empty = screen.getByRole("button", { name: /Financing/ })
    expect(empty).toHaveTextContent("Empty · 0")
    expect(empty.querySelector("[data-slot='swatch']")?.getAttribute("style")).toContain("repeating-linear-gradient")
    unmount()
    const second = show({ source: "refused", level: null, probabilities: null, changed: true })
    const refused = screen.getByRole("button", { name: /Financing/ })
    expect(refused).toHaveTextContent("No answer")
    expect(refused).toHaveTextContent("Changed since the run")
    expect(refused.className).toContain("border-dashed")
    await userEvent.click(refused)
    expect(screen.getByRole("dialog")).toHaveTextContent("Jev declined to answer")
    second.unmount()
  })

  it("speaks German", () => {
    show({}, "de")
    expect(screen.getByRole("button", { name: /Finanzierung/ })).toHaveTextContent("2,4 · Konkret")
  })
})

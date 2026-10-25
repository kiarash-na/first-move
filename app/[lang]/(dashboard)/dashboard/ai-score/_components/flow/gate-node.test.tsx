import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import type { BranchView, GateView } from "./flow-model"
import { GateNode } from "./gate-node"

const base: GateView = {
  kind: "gate",
  id: "anchor",
  turn: 1,
  dimension: "participation",
  branch: null,
  source: "model",
  probability: 0.92,
  outcome: "pass",
  cap: null,
  effect: { kind: "cap", level: 2, conditional: false },
}
const show = (node: Partial<GateView>, opener?: BranchView) => renderAiScore(<GateNode node={{ ...base, ...node }} opener={opener} />, { store: aiScoreStore(example()).store })

describe("GateNode", () => {
  it("shows the outcome as a shape and as text with the probability", () => {
    show({})
    const node = screen.getByRole("button", { name: /Anchor customer/ })
    expect(node).toHaveTextContent("Pass · 92%")
    expect(node).toHaveAttribute("data-outcome", "pass")
    expect(node.querySelector("[data-slot='gate-glyph']")).toHaveAttribute("data-outcome", "pass")
  })

  it("shows the cap a failed check applies, in text and in its detail", async () => {
    show({ outcome: "fail", probability: 0.1, cap: 2 })
    const node = screen.getByRole("button", { name: /Anchor customer/ })
    expect(node).toHaveTextContent("Fail · caps at 2")
    expect(node).toHaveAttribute("data-cap", "2")
    await userEvent.click(node)
    const dialog = screen.getByRole("dialog", { name: "Anchor customer" })
    expect(dialog).toHaveTextContent(/Does the plan name at least one specific anchor customer/)
    expect(dialog).toHaveTextContent("Caps “Participation and commitment” at level 2 when it fails.")
    expect(dialog).toHaveTextContent("Applied: “Participation and commitment” is capped at level 2.")
    expect(dialog).toHaveTextContent("Decided by Jev")
  })

  it("tells a rule, a flag, a conditional cap and a follow-up apart", async () => {
    const { unmount } = show({ id: "deal-breaker", source: "rule", probability: null, outcome: "fail", cap: 2 })
    await userEvent.click(screen.getByRole("button", { name: /Deal-breaker/ }))
    expect(screen.getByRole("dialog")).toHaveTextContent("Decided by a rule before any AI.")
    unmount()
    const opener: BranchView = { kind: "branch", id: "source-type", turn: 1, choice: "groundwater", probabilities: {}, followUp: "water-permit" }
    const second = show({ id: "water-permit", turn: 2, dimension: "technology", branch: "source-type", outcome: "unclear", probability: 0.5 }, opener)
    await userEvent.click(screen.getByRole("button", { name: /Permit route/ }))
    expect(screen.getByRole("dialog")).toHaveTextContent("Follow-up check")
    expect(screen.getByRole("dialog")).toHaveTextContent("Asked because the branch “Main heat source” chose “Groundwater”.")
    second.unmount()
    const third = show({ id: "heat-density", dimension: "technology", effect: { kind: "cap", level: 2, conditional: true } })
    await userEvent.click(screen.getByRole("button", { name: /Network length/ }))
    expect(screen.getByRole("dialog")).toHaveTextContent("when it fails and the Quick Check heat density is low")
    third.unmount()
    show({ id: "extra-value", effect: { kind: "flag" }, outcome: "skipped", source: "refused", probability: null })
    const flag = screen.getByRole("button", { name: /Extra value/ })
    expect(flag).toHaveTextContent("No answer")
    await userEvent.click(flag)
    expect(screen.getByRole("dialog")).toHaveTextContent("A flag only: it never lowers the score.")
  })
})

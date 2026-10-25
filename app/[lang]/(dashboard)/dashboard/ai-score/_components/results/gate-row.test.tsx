import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it } from "vitest"
import { LOW_HEAT_DENSITY } from "@/lib/ai/plan-score/gates"
import type { AiScore } from "@/lib/project"
import { GateRow } from "./gate-row"
import { CAPPED, scored, VARIED, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, mockActions, renderResults } from "./test-utils/render"

let varied: Scored
let capped: Scored
let refused: Scored
beforeAll(async () => {
  ;[varied, capped, refused] = await Promise.all([scored(), scored(CAPPED), scored({ ...VARIED, refuse: ["financing", "cost-key"] })])
})

const copy = aiScoreCopy("en")

function renderGate(score: AiScore, id: string, options: { suggestions?: string[]; suggestionsLang?: string; actions?: ReturnType<typeof mockActions> } = {}) {
  const gate = score.gates.find((entry) => entry.id === id)!
  const actions = options.actions ?? mockActions()
  const view = renderResults(
    <ul>
      <GateRow gate={gate} score={score} suggestions={options.suggestions ?? []} suggestionsLang={options.suggestionsLang} actions={actions} />
    </ul>,
  )
  return { ...view, actions, row: view.container.querySelector<HTMLElement>(`[data-check="${id}"]`)! }
}

describe("GateRow", () => {
  it("shows a passed check with its outcome, probability, question and effect", () => {
    const { row } = renderGate(varied.score, "anchor")
    expect(row).toHaveAttribute("id", "ai-score-check-anchor")
    expect(row.querySelector("[data-outcome=pass]")).toHaveTextContent(copy.labels.outcomes.pass)
    expect(row).toHaveTextContent("Pass probability 95%")
    expect(row).toHaveTextContent(copy.labels.gates.anchor.question)
    expect(row).toHaveTextContent(copy.results.checks.mustHave)
    expect(row.querySelector("[data-effect]")).toHaveTextContent(`Would cap ${copy.labels.dimensions.participation.name} at level 2 if it failed`)
    expect(row.querySelector("[data-gate-source]")).toHaveTextContent(copy.labels.gateSources.model)
  })

  it("names the cap a failed check applied", () => {
    const { row } = renderGate(capped.score, "boundary")
    expect(row.querySelector("[data-outcome=fail]")).not.toBeNull()
    expect(row.querySelector("[data-effect]")).toHaveTextContent(`Caps ${copy.labels.dimensions.governance.name} at level 2`)
    // The mock puts 0.05 on "all", the only passing option of the choice gate.
    const probability = capped.score.gates.find((gate) => gate.id === "boundary")!.probability!
    expect(probability).toBeLessThanOrEqual(0.2)
    expect(row).toHaveTextContent(`Pass probability ${Math.round(probability * 100)}%`)
  })

  it("calls a flag a flag and an unclear check unclear", () => {
    const { row } = renderGate(varied.score, "extra-value")
    expect(row.querySelector("[data-outcome=unclear]")).not.toBeNull()
    expect(row.querySelector("[data-effect]")).toHaveTextContent(copy.results.checks.flag)
    expect(row).not.toHaveTextContent(copy.results.checks.mustHave)
  })

  it("explains the conditional cap of the heat density check", () => {
    const { row } = renderGate(varied.score, "heat-density")
    expect(row.querySelector("[data-effect]")).toHaveTextContent(/heat density is low/)
  })

  it("calls the heat density check a must-have only while the Quick Check heat density is low", () => {
    // VARIED: the example's heat density is not low, so failing would cap nothing.
    expect(varied.score.quickCheck!.heatDensityMwhPerM).toBeGreaterThanOrEqual(LOW_HEAT_DENSITY)
    expect(renderGate(varied.score, "heat-density").row).not.toHaveTextContent(copy.results.checks.mustHave)
    expect(renderGate({ ...varied.score, quickCheck: null }, "heat-density").row).not.toHaveTextContent(copy.results.checks.mustHave)
    const low = { ...varied.score, quickCheck: { ...varied.score.quickCheck!, heatDensityMwhPerM: LOW_HEAT_DENSITY / 2 } }
    expect(renderGate(low, "heat-density").row).toHaveTextContent(copy.results.checks.mustHave)
  })

  it("says a check Jev did not answer has no answer, not that it was not asked", () => {
    const { row } = renderGate(refused.score, "cost-key")
    const tag = row.querySelector("[data-slot=outcome-tag]")!
    expect(tag).toHaveAttribute("data-outcome", "skipped")
    expect(tag).toHaveTextContent(copy.labels.gateSources.refused)
    expect(tag).not.toHaveTextContent(copy.labels.outcomes.skipped)
    // A check a rule left out is still "Not asked".
    expect(renderGate(varied.score, "vienna-zone").row.querySelector("[data-slot=outcome-tag]")).toHaveTextContent(copy.labels.outcomes.skipped)
  })

  it("shows the decision that asked a follow-up check", () => {
    const { row } = renderGate(varied.score, "water-permit")
    expect(row).toHaveTextContent(copy.results.checks.followUp)
    expect(row.querySelector("[data-opened-by]")).toHaveTextContent(`Asked because ${copy.labels.branches["source-type"].name} is “${copy.labels.branches["source-type"].options.groundwater}”`)
  })

  it("shows a rule check without a probability", () => {
    const score = { ...varied.score, gates: [...varied.score.gates.filter((gate) => gate.id !== "deal-breaker"), { id: "deal-breaker", source: "rule" as const, probability: null, outcome: "fail" as const, cap: 2 }] }
    const { row } = renderGate(score, "deal-breaker")
    expect(row).toHaveTextContent(`No probability: ${copy.labels.gateSources.rule}`)
    expect(row.querySelector("[data-slot=pass-meter]")).toBeNull()
  })

  it("offers suggestions for a failed or unclear check and lists the saved ones", async () => {
    const { row, actions } = renderGate(varied.score, "operator", { suggestions: ["Name who maintains the network."], suggestionsLang: "en" })
    expect(within(row).getByText("Name who maintains the network.")).toBeInTheDocument()
    // Marked as AI output in sight, and in the language it was written in.
    expect(within(row).getByText(copy.results.aiGenerated)).toBeInTheDocument()
    expect(row.querySelector("[data-slot=suggestion-texts]")).toHaveAttribute("lang", "en")
    await userEvent.click(within(row).getByRole("button", { name: `Suggest improvements for ${copy.labels.gates.operator.name}` }))
    expect(actions.suggest).toHaveBeenCalledWith(["operator"])
    const passed = renderGate(varied.score, "anchor").row
    expect(within(passed).queryByRole("button")).not.toBeInTheDocument()
  })

  it("renders nothing for an unknown check id", () => {
    const score = { ...varied.score, gates: [{ id: "retired", source: "model" as const, probability: 0.5, outcome: "unclear" as const, cap: null }] }
    renderGate(score, "retired")
    expect(screen.queryByText("retired")).not.toBeInTheDocument()
  })
})

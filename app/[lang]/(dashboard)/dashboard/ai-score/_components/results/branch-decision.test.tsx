import { screen } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"
import { BRANCHES } from "@/lib/ai/plan-score/branches"
import type { AiBranch } from "@/lib/project"
import { BranchDecision } from "./branch-decision"
import { scored, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, renderResults } from "./test-utils/render"

let fixture: Scored
beforeAll(async () => {
  fixture = await scored()
})

const copy = aiScoreCopy("en")
const renderBranch = (branch: AiBranch, lang: "en" | "de" = "en") =>
  renderResults(
    <ul>
      <BranchDecision branch={branch} />
    </ul>,
    { lang },
  )

describe("BranchDecision", () => {
  it("shows the chosen option and a bar for every option at its probability", () => {
    const branch = fixture.score.branches.find((entry) => entry.id === "anchor-type")!
    const { container } = renderBranch(branch)
    const names = copy.labels.branches["anchor-type"]
    expect(container.querySelector("[data-chosen]")).toHaveTextContent(`Chosen: ${names.options.residential}`)
    expect(container.querySelector("[data-chosen]")).toHaveTextContent(`${Math.round(branch.probabilities.residential * 100)}% sure`)
    const options = [...container.querySelectorAll<HTMLElement>("[data-option]")]
    expect(options.map((option) => option.dataset.option)).toEqual(BRANCHES.find((entry) => entry.id === "anchor-type")!.options.map((option) => option.id))
    for (const option of options) {
      expect(parseFloat(option.querySelector<HTMLElement>("[data-bar]")!.style.width)).toBeCloseTo(branch.probabilities[option.dataset.option!] * 100, 6)
    }
    expect(container.querySelector('[data-option="residential"] [data-bar]')).toHaveClass("bg-hot")
    expect(container.querySelector('[data-option="public"] [data-bar]')).not.toHaveClass("bg-hot")
  })

  it("links to the follow-up check it opened", () => {
    renderBranch(fixture.score.branches.find((entry) => entry.id === "source-type")!)
    expect(screen.getByRole("link", { name: `Opened the follow-up check “${copy.labels.gates["water-permit"].name}”` })).toHaveAttribute("href", "#ai-score-check-water-permit")
  })

  it("says when the chosen option opens nothing", () => {
    renderBranch({ id: "source-type", choice: "unclear", probabilities: { unclear: 0.7, groundwater: 0.3 } })
    expect(screen.getByText(copy.results.checks.opensNone)).toBeInTheDocument()
  })

  it("shows a refused decision without bars", () => {
    const { container } = renderBranch({ id: "ownership", choice: "refused", probabilities: {} })
    expect(screen.getByText(copy.results.checks.refusedBranch)).toBeInTheDocument()
    expect(container.querySelector("[data-option]")).toBeNull()
  })

  it("renders nothing for an unknown branch", () => {
    const { container } = renderBranch({ id: "retired", choice: "x", probabilities: {} })
    expect(container.querySelector("[data-branch]")).toBeNull()
  })
})

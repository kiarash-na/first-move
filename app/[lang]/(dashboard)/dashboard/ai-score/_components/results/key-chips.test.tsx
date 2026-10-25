import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { KeyChips } from "./key-chips"
import { aiScoreCopy, renderResults } from "./test-utils/render"

describe("KeyChips", () => {
  it("links each known key to its row, once, and drops unknown keys", () => {
    const copy = aiScoreCopy("en")
    renderResults(<KeyChips keys={["pain-point", "operator", "pain-point", "unknown-key"]} />)
    const list = screen.getByRole("list", { name: copy.results.report.pointsTo })
    expect(list.querySelectorAll("a")).toHaveLength(2)
    expect(screen.getByRole("link", { name: copy.labels.judgements["pain-point"] })).toHaveAttribute("href", "#ai-score-part-pain-point")
    expect(screen.getByRole("link", { name: copy.labels.gates.operator.name })).toHaveAttribute("href", "#ai-score-check-operator")
  })

  it("renders nothing without known keys", () => {
    const { container } = renderResults(<KeyChips keys={["unknown-key"]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

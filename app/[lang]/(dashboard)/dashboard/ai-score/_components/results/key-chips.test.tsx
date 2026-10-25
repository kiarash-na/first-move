import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { KeyChips } from "./key-chips"
import { aiScoreCopy, renderResults } from "./test-utils/render"

/** Rows of a run that chose the residential anchor: its follow-up check is there, the public one is not. */
const ROWS: ReadonlySet<string> = new Set(["pain-point", "operator", "anchor-residential"])

describe("KeyChips", () => {
  it("links each known key to its row, once, and drops unknown keys", () => {
    const copy = aiScoreCopy("en")
    renderResults(<KeyChips keys={["pain-point", "operator", "pain-point", "unknown-key"]} rows={ROWS} />)
    const list = screen.getByRole("list", { name: copy.results.report.pointsTo })
    expect(list.querySelectorAll("a")).toHaveLength(2)
    expect(screen.getByRole("link", { name: copy.labels.judgements["pain-point"] })).toHaveAttribute("href", "#ai-score-part-pain-point")
    expect(screen.getByRole("link", { name: copy.labels.gates.operator.name })).toHaveAttribute("href", "#ai-score-check-operator")
  })

  it("drops a follow-up check this run did not ask, so no chip points to a missing row", () => {
    const copy = aiScoreCopy("en")
    renderResults(<KeyChips keys={["anchor-public", "anchor-residential"]} rows={ROWS} />)
    expect(screen.getAllByRole("link")).toHaveLength(1)
    expect(screen.getByRole("link", { name: copy.labels.gates["anchor-residential"].name })).toHaveAttribute("href", "#ai-score-check-anchor-residential")
  })

  it("keeps the page language inside AI text of the other language", () => {
    renderResults(<KeyChips keys={["operator"]} rows={ROWS} lang="en" />)
    expect(screen.getByRole("list")).toHaveAttribute("lang", "en")
  })

  it("renders nothing without known keys", () => {
    const { container } = renderResults(<KeyChips keys={["unknown-key", "anchor-public"]} rows={ROWS} />)
    expect(container).toBeEmptyDOMElement()
  })
})

import { screen, within } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"

import type { AiScore } from "@/lib/project"
import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example, scored } from "../test-utils/scored"
import { aggregateOfScore } from "./aggregate-view"
import { graphFromScore, graphNodes } from "./flow-model"
import { FlowTable } from "./flow-table"

let score: AiScore
beforeAll(async () => {
  score = await scored(example(), { gates: { anchor: 0.05 } })
})

describe("FlowTable", () => {
  it("lists every node, the dimensions, the score and the report in reading order", () => {
    const graph = graphFromScore(score)
    const report = { model: "anthropic/claude-haiku-5.5", lang: "en" as const, headline: "H.", summary: "S.", strengths: [], gaps: [], actions: [] }
    renderAiScore(<FlowTable graph={graph} aggregate={aggregateOfScore(score)} report={report} />, { store: aiScoreStore(example()).store })
    const table = screen.getByRole("table", { name: "Decision flow as a table" })
    const rows = within(table).getAllByRole("row").slice(1)
    expect(rows).toHaveLength(1 + graphNodes(graph).length + 7 + 1 + 1)
    expect(rows[0]).toHaveTextContent("Quick Check signal")
    expect(rows[0]).toHaveTextContent("Turn 0 · Read the plan")
    const anchor = rows.find((row) => row.dataset.row === "gate-anchor")!
    expect(anchor).toHaveTextContent("Fail · caps at 2")
    expect(anchor).toHaveTextContent("5%")
    const branch = rows.find((row) => row.dataset.row === "branch-source-type")!
    expect(branch).toHaveTextContent("Groundwater → Permit route for water or ground")
    expect(rows.find((row) => row.dataset.row === "dimension-participation")).toHaveTextContent("Capped at level 2")
    expect(rows.at(-2)).toHaveTextContent(/AI Plan Score.*±/)
    expect(rows.at(-1)).toHaveTextContent("Written by anthropic/claude-haiku-5.5")
  })

  it("lists only what is decided during a run", () => {
    renderAiScore(<FlowTable graph={graphFromScore({ ...score, judgements: [], gates: [], branches: [] })} aggregate={null} report={null} />, {
      store: aiScoreStore(example()).store,
    })
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(2)
  })
})

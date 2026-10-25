import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it } from "vitest"

import { JUDGEMENTS } from "@/lib/ai/plan-score/judgements"
import type { AiScore } from "@/lib/project"
import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example, scored } from "../test-utils/scored"
import { FlowGraph } from "./flow-graph"
import { flowView } from "./flow-source"

let score: AiScore
beforeAll(async () => {
  score = await scored(example(), { gates: { anchor: 0.05 } })
})

const columns = () => within(screen.getByRole("list", { name: "Decision flow" })).getAllByRole("listitem").filter((item) => item.dataset.slot === "flow-column")

describe("FlowGraph", () => {
  it("draws a saved score: seven columns, every node and one edge per opened follow-up", () => {
    const view = flowView({ mode: "saved", score, changed: [], writing: false })
    const { container } = renderAiScore(<FlowGraph {...view} />, { store: aiScoreStore(example()).store })
    expect(columns().map((column) => column.dataset.column)).toEqual(["0", "1", "2", "3", "4", "aggregate", "report"])
    expect(columns().every((column) => column.dataset.state === "done")).toBe(true)
    const nodes = container.querySelectorAll("[data-flow-node]")
    const count = (kind: string) => container.querySelectorAll(`[data-flow-node^="${kind}:"]`).length
    expect(count("judgement")).toBe(JUDGEMENTS.length)
    expect(count("gate")).toBe(score.gates.length)
    expect(count("branch")).toBe(3)
    expect(count("signal")).toBe(1)
    expect(count("dimension")).toBe(7)
    expect(count("score")).toBe(1)
    expect(count("report")).toBe(1)
    expect(nodes).toHaveLength(JUDGEMENTS.length + score.gates.length + 3 + 1 + 7 + 1 + 1)
    const edges = [...container.querySelectorAll("path[data-edge]")].map((path) => path.getAttribute("data-edge"))
    expect(edges).toEqual(["anchor-type>anchor-residential", "source-type>water-permit", "ownership>owner-community"])
  })

  it("puts each node in the turn that decided it", () => {
    renderAiScore(<FlowGraph {...flowView({ mode: "saved", score, changed: [], writing: false })} />, { store: aiScoreStore(example()).store })
    const [read, opportunity, logic] = columns()
    expect(within(read).getByRole("button", { name: /Further analysis required/ })).toBeInTheDocument()
    expect(read).toHaveTextContent("27 of 27 plan parts filled")
    expect(within(opportunity).getByRole("button", { name: /Anchor customer.*Fail · caps at 2/ })).toHaveAttribute("data-cap", "2")
    expect(within(opportunity).getByRole("button", { name: /Main heat source/ })).toHaveTextContent("Groundwater")
    expect(within(logic).getByRole("button", { name: /Permit route for water or ground/ })).toHaveAttribute("data-branch", "source-type")
  })

  it("opens a node's detail from the graph", async () => {
    renderAiScore(<FlowGraph {...flowView({ mode: "saved", score, changed: [], writing: false })} />, { store: aiScoreStore(example()).store })
    await userEvent.click(screen.getByRole("button", { name: /^Site description/ }))
    expect(screen.getByRole("dialog", { name: "Site description" })).toHaveTextContent("Probability per level")
  })

  it("waits in every column before a run", () => {
    renderAiScore(<FlowGraph {...flowView({ mode: "idle" })} />, { store: aiScoreStore(example()).store })
    expect(columns().slice(0, 6).every((column) => column.dataset.state === "pending")).toBe(true)
    expect(document.querySelectorAll("[data-flow-node]")).toHaveLength(0)
  })
})

import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { FlowColumn } from "./flow-column"

const show = (props: Partial<Parameters<typeof FlowColumn>[0]>) =>
  renderAiScore(
    <ol>
      <FlowColumn id="1" eyebrow="Turn 1" title="Opportunity" note="Jev" state="done" hasNodes {...props} />
    </ol>,
    { store: aiScoreStore(example()).store },
  )

describe("FlowColumn", () => {
  it("is a step named by its title, with who decides it", () => {
    show({ children: <button type="button">node</button> })
    const column = screen.getByRole("listitem", { name: "Opportunity" })
    expect(column).toHaveTextContent("Turn 1")
    expect(column).toHaveTextContent("Jev")
    expect(column).toHaveAttribute("data-state", "done")
    expect(screen.getByRole("button", { name: "node" })).toBeInTheDocument()
  })

  it("pulses with ghost nodes while it decides, only when motion is allowed", () => {
    show({ state: "running", questions: 4, hasNodes: false })
    const column = screen.getByRole("listitem", { name: "Opportunity" })
    expect(column).toHaveAttribute("aria-busy", "true")
    expect(column).toHaveTextContent("Deciding…")
    expect(column.querySelectorAll("[data-slot='ghost']")).toHaveLength(4)
    expect(column.querySelector("header")?.className).toContain("motion-safe:animate-pulse")
  })

  it("says when it waits, stopped or had nothing to decide", () => {
    const first = show({ state: "pending", hasNodes: false })
    expect(screen.getByRole("listitem")).toHaveTextContent("Waiting")
    first.unmount()
    const second = show({ state: "failed", hasNodes: false })
    expect(screen.getByRole("listitem")).toHaveTextContent("Stopped")
    second.unmount()
    show({ state: "done", hasNodes: false })
    expect(screen.getByRole("listitem")).toHaveTextContent("Nothing to decide here")
  })
})

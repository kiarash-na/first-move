import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FlowEdges } from "./flow-edges"
import type { FlowEdge } from "./flow-model"

function Graph({ edges, withTarget = true }: { edges: FlowEdge[]; withTarget?: boolean }) {
  return (
    <div data-testid="graph">
      <button type="button" data-flow-node="branch:source-type">
        branch
      </button>
      {withTarget && (
        <button type="button" data-flow-node="gate:water-permit">
          gate
        </button>
      )}
      <FlowEdges edges={edges} layoutKey="1" />
    </div>
  )
}

const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect

describe("FlowEdges", () => {
  it("draws one arrow per edge between the measured nodes, hidden from assistive tech", () => {
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      const node = this.getAttribute("data-flow-node")
      if (node === "branch:source-type") return rect(100, 300, 180, 50)
      if (node === "gate:water-permit") return rect(300, 400, 180, 50)
      return rect(100, 100, 1000, 600)
    })
    const { container } = render(<Graph edges={[{ from: "source-type", to: "water-permit" }]} />)
    const svg = container.querySelector("svg[data-slot='flow-edges']")!
    expect(svg).toHaveAttribute("aria-hidden", "true")
    const paths = svg.querySelectorAll("path[data-edge]")
    expect(paths).toHaveLength(1)
    expect(paths[0]).toHaveAttribute("data-edge", "source-type>water-permit")
    expect(paths[0]).toHaveAttribute("d", "M 180 225 C 196 225, 184 325, 200 325")
    expect(paths[0].getAttribute("marker-end")).toMatch(/^url\(#flow-arrow-[A-Za-z0-9_-]+\)$/)
    spy.mockRestore()
  })

  it("skips an edge whose node is not drawn yet", () => {
    const { container } = render(<Graph edges={[{ from: "source-type", to: "water-permit" }]} withTarget={false} />)
    expect(container.querySelectorAll("path[data-edge]")).toHaveLength(0)
  })
})

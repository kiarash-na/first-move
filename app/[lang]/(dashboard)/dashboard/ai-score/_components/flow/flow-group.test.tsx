import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { FlowGroup } from "./flow-group"

describe("FlowGroup", () => {
  it("lists its nodes under a label", () => {
    render(<FlowGroup label="Checks" items={[{ key: "a", node: <button type="button">A</button> }, { key: "b", node: <button type="button">B</button> }]} />)
    const list = screen.getByRole("list", { name: "Checks" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(2)
  })

  it("renders nothing without nodes", () => {
    const { container } = render(<FlowGroup label="Checks" items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

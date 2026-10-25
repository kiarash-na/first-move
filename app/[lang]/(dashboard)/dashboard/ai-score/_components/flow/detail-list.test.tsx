import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DetailList } from "./detail-list"

describe("DetailList", () => {
  it("shows term and value pairs and drops empty ones", () => {
    const { container } = render(
      <DetailList
        rows={[
          ["Outcome", "Pass"],
          ["Probability", null],
          ["Cap", ""],
          ["Source", <em key="s">Jev</em>],
        ]}
      />,
    )
    expect([...container.querySelectorAll("dt")].map((node) => node.textContent)).toEqual(["Outcome", "Source"])
    expect([...container.querySelectorAll("dd")].map((node) => node.textContent)).toEqual(["Pass", "Jev"])
  })
})

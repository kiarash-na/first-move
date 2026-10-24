import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AssumptionsSection } from "./assumptions-section"

describe("AssumptionsSection", () => {
  it("is a region named by its heading", () => {
    render(
      <AssumptionsSection id="x" title="Energy sources">
        <p>body</p>
      </AssumptionsSection>,
    )
    expect(screen.getByRole("region", { name: "Energy sources" })).toHaveTextContent("body")
  })
})

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HowBlock } from "./how-block"

describe("HowBlock", () => {
  it("is a region named by its heading", () => {
    render(
      <HowBlock title="Formulas">
        <p>E = Σ k · p(k)</p>
      </HowBlock>,
    )
    expect(screen.getByRole("region", { name: "Formulas" })).toHaveTextContent("E = Σ k · p(k)")
    expect(screen.getByRole("heading", { level: 4, name: "Formulas" })).toBeInTheDocument()
  })
})

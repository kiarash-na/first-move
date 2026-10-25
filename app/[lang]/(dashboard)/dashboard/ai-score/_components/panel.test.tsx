import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Panel } from "./panel"

describe("Panel", () => {
  it("is a region named by its title, with eyebrow, lead, actions and content", () => {
    render(
      <Panel id="setup" eyebrow="01" title="Connect your key" lead="Bring your own key." actions={<button type="button">Act</button>}>
        <p>Body</p>
      </Panel>,
    )
    const region = screen.getByRole("region", { name: "Connect your key" })
    expect(region).toHaveAttribute("id", "setup")
    expect(region).toHaveTextContent("01")
    expect(region).toHaveTextContent("Bring your own key.")
    expect(screen.getByRole("heading", { level: 2, name: "Connect your key" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Act" })).toBeInTheDocument()
    expect(screen.getByText("Body")).toBeInTheDocument()
  })
})

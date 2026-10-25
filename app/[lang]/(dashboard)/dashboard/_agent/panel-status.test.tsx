import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PanelStatus } from "./panel-status"
import { assistantCopy, renderAgent } from "./test-utils/render"

const copy = assistantCopy()

describe("PanelStatus", () => {
  it("says the assistant is loading, above the launcher", () => {
    renderAgent(<PanelStatus failed={false} bottom="80px" />)
    const note = screen.getByRole("status")
    expect(note).toHaveTextContent(copy.panel.loading)
    expect(note).toHaveStyle({ bottom: "80px" })
  })

  it("says when it could not load, as an alert", () => {
    renderAgent(<PanelStatus failed bottom="80px" />)
    expect(screen.getByRole("alert")).toHaveTextContent(copy.panel.loadFailed)
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})

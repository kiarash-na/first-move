import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../_components/test-utils/render"
import { StepFrame } from "./step-frame"
import { openProject, stopTabs } from "./test-utils/open-project"

afterEach(stopTabs)

describe("StepFrame", () => {
  it("frames a step: orange eyebrow, title, lead, AI Plan Score, completeness, step navigation, prompts, content", async () => {
    const tab = await openProject()
    renderDashboard(
      <StepFrame step="reality-check">
        <p>Panels</p>
      </StepFrame>,
      { store: tab.store },
    )
    expect(screen.getByRole("heading", { level: 1, name: "Reality check" })).toBeInTheDocument()
    expect(screen.getByText("Business Plan · 03").className).toContain("text-hot")
    expect(screen.getByText(/Use rough but transparent assumptions/)).toBeInTheDocument()
    expect(screen.getByText("Pitch completeness")).toBeInTheDocument()
    const badge = screen.getByRole("link", { name: /Get an AI Plan Score/ })
    const meter = screen.getByRole("link", { name: /Pitch completeness/ })
    expect(badge.compareDocumentPosition(meter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole("navigation", { name: "Business Plan steps" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Guiding questions/ })).toBeInTheDocument()
    expect(screen.getByText("Panels")).toBeInTheDocument()
  })

  it("labels an example's steps 'Illustrative inputs only' (OQ-23)", async () => {
    const tab = await openProject({ example: "new-build-quarter" })
    renderDashboard(
      <StepFrame step="opportunity">
        <p>Panels</p>
      </StepFrame>,
      { store: tab.store },
    )
    expect(screen.getByText("Illustrative inputs only")).toBeInTheDocument()
  })
})

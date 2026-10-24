import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../_components/test-utils/project-store"
import { StepLayout } from "./step-layout"

describe("StepLayout", () => {
  it("frames a step with stepper, live result, a collapsed How we calculate and the footer", async () => {
    const { store } = projectStore(exampleProject("school-kindergarten-flats"))
    const { container } = renderDashboard(
      <StepLayout step="sources">
        <p>step body</p>
      </StepLayout>,
      { store },
    )
    expect(screen.getByText("step body")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: quickCheck.ui.stepper.label })).toBeInTheDocument()
    expect(screen.getByRole("complementary", { name: quickCheck.ui.rail.title })).toBeInTheDocument()
    expect(container.querySelector("[data-slot=mobile-rail]")).not.toBeNull()
    expect(container.querySelector("[data-slot=step-footer]")).not.toBeNull()
    const how = screen.getByRole("button", { name: calc.ui.title })
    expect(how).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(how)
    expect(await screen.findByText(calc.steps.sources)).toBeVisible()
  })
})

import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { openProject, stopTabs } from "../../../_components/test-utils/open-project"
import { ImplementationStep } from "./implementation-step"

afterEach(stopTabs)

describe("ImplementationStep (BM-STEP-04)", () => {
  it("has refinements, scalability by context, next steps and the pitch readiness", async () => {
    const tab = await openProject()
    renderDashboard(<ImplementationStep />, { store: tab.store })
    for (const name of ["Refinements", "Scalability and replication", "Next steps", "Pitch readiness"]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument()
    }
    expect(screen.getByLabelText("Key decisions and the decision gate")).toBeInTheDocument()
  })

  it("moves the readiness while the plan is edited", async () => {
    const tab = await openProject()
    renderDashboard(<ImplementationStep />, { store: tab.store })
    expect(screen.getByText("Not started")).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("Geographical conditions"), "Other valleys")
    expect(await screen.findByText("In progress")).toBeInTheDocument()
    expect(tab.store.getState().active?.businessPlan.scalability.geographical).toBe("Other valleys")
  })
})

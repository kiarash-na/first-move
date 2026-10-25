import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { ReadinessHow } from "./readiness-how"

afterEach(stopTabs)

describe("ReadinessHow (pitch completeness)", () => {
  it("is a quiet disclosure, closed until asked (D-33)", async () => {
    const tab = await openProject()
    renderDashboard(<ReadinessHow />, { store: tab.store })
    const toggle = screen.getByRole("button", { name: "How completeness is counted" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText(/average of the six parts/)).toBeNull()
    await userEvent.click(toggle)
    expect(screen.getByText(/average of the six parts/)).toBeInTheDocument()
  })
})

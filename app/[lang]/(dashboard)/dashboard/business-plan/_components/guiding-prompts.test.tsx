import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { BUSINESS_PLAN_PAGES } from "@/lib/dashboard/routes"
import { promptsFor } from "@/lib/business-plan"
import { renderDashboard } from "../../_components/test-utils/render"
import { GuidingPrompts } from "./guiding-prompts"
import { openProject, stopTabs } from "./test-utils/open-project"

afterEach(stopTabs)

describe("GuidingPrompts", () => {
  it.each(BUSINESS_PLAN_PAGES)("lists the prompts of %s with kind and source", async (step) => {
    const tab = await openProject()
    renderDashboard(<GuidingPrompts step={step} />, { store: tab.store })
    expect(screen.getAllByRole("listitem")).toHaveLength(promptsFor(step).length)
  })

  it("shows the key questions of the brief where they help", async () => {
    const tab = await openProject()
    renderDashboard(<GuidingPrompts step="business-logic" />, { store: tab.store })
    expect(screen.getByText(/Who benefits, and who pays/)).toBeInTheDocument()
    expect(screen.getAllByText(/BM-SCOPE-03/).length).toBeGreaterThan(0)
    expect(screen.getAllByText("Key question").length).toBeGreaterThan(0)
  })

  it("can be folded away", async () => {
    const tab = await openProject()
    renderDashboard(<GuidingPrompts step="opportunity" />, { store: tab.store })
    const toggle = screen.getByRole("button", { name: /Guiding questions/ })
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "false")
  })
})

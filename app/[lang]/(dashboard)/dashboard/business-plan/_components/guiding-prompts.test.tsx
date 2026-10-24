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

  it("links the 5GDHC information of BM-SCOPE-10 and names the replication examples of ALG-08", async () => {
    const tab = await openProject()
    const { unmount } = renderDashboard(<GuidingPrompts step="business-logic" />, { store: tab.store })
    const link = screen.getByRole("link", { name: /Information about 5GDHC networks/ })
    expect(link).toHaveAttribute("href", "https://www.geothermie-oesterreich.at/was-ist-geothermie/geothermie-in-anergienetzen/")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
    unmount()
    renderDashboard(<GuidingPrompts step="implementation" />, { store: tab.store })
    expect(screen.getByText(/Viertel Zwei, Vienna/)).toBeInTheDocument()
    expect(screen.getByText("ALG-08")).toBeInTheDocument()
  })
})

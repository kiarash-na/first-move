import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { QcUnavailable } from "./qc-unavailable"

afterEach(stopTabs)

const shared = { totalBuildings: null, areaM2: null, sources: [] }

describe("QcUnavailable", () => {
  it("links to the Quick Check when it is off", async () => {
    const tab = await openProject()
    renderDashboard(<QcUnavailable prefill={{ status: "off", shared }} />, { store: tab.store, lang: "de" })
    expect(screen.getByRole("link", { name: /Open Quick Check/ })).toHaveAttribute("href", "/de/dashboard/quick-check/area")
    expect(screen.getByText(/The Business Plan works without it/)).toBeInTheDocument()
  })

  it("links to the step to finish when it is incomplete", async () => {
    const tab = await openProject()
    renderDashboard(
      <QcUnavailable prefill={{ status: "incomplete", shared, nextStep: "sources", flags: {} as never }} />,
      { store: tab.store },
    )
    expect(screen.getByRole("link", { name: /Continue Quick Check/ })).toHaveAttribute("href", "/en/dashboard/quick-check/sources")
  })
})

import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { renderDashboard } from "../test-utils/render"
import { ChartCard } from "./chart-card"

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

function setup() {
  const tab = testTab()
  tabs.push(tab)
  return renderDashboard(<ChartCard title="Investment" lead="Where it goes" chart={<p>the plot</p>} table={<p>the rows</p>} />, { store: tab.store })
}

describe("ChartCard", () => {
  it("shows the chart first and switches to the table and back", async () => {
    const user = userEvent.setup()
    setup()
    expect(screen.getByRole("heading", { name: "Investment" })).toBeInTheDocument()
    expect(screen.getByText("the plot")).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Chart" })).toBeChecked()

    await user.click(screen.getByRole("radio", { name: "Table" }))
    expect(screen.getByText("the rows")).toBeInTheDocument()
    expect(screen.queryByText("the plot")).not.toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "Chart" }))
    expect(screen.getByText("the plot")).toBeInTheDocument()
  })

  it("keeps one view selected when the active one is pressed again", async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole("radio", { name: "Chart" }))
    expect(screen.getByText("the plot")).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Chart" })).toBeChecked()
  })
})

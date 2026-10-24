import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { exampleWith, renderOverview } from "./test-utils/overview-render"
import { AddModuleCard } from "./add-module-card"

describe("AddModuleCard", () => {
  it("turns the Business Plan on through store.patch", async () => {
    const user = userEvent.setup()
    const project = exampleWith("school-kindergarten-flats", { "meta.modules.businessPlan": false })
    const { harness } = renderOverview(<AddModuleCard module="businessPlan" />, project)
    await user.click(screen.getByRole("button", { name: "Add Business Plan" }))
    expect(harness.patch).toHaveBeenCalledWith({ "meta.modules.businessPlan": true })
    expect(harness.current().meta.modules.businessPlan).toBe(true)
  })

  it("turns the Quick Check on", async () => {
    const user = userEvent.setup()
    const project = exampleWith("school-kindergarten-flats", { "meta.modules.quickCheck": false })
    const { harness } = renderOverview(<AddModuleCard module="quickCheck" />, project)
    expect(screen.getByRole("heading", { name: "Add the Quick Check" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Add Quick Check" }))
    expect(harness.current().meta.modules.quickCheck).toBe(true)
  })
})

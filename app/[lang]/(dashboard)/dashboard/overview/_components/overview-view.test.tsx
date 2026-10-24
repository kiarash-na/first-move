import { act, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { EXAMPLES } from "@/lib/examples"
import { run } from "@/lib/quick-check"
import { emptyProject } from "../../_components/test-utils/project-store"
import { exampleWith, renderOverview } from "./test-utils/overview-render"
import { OverviewView } from "./overview-view"

describe("OverviewView", () => {
  it.each(EXAMPLES.map((example) => example.id))("shows the verdict, key numbers, charts and Business Plan of %s", (id) => {
    const project = exampleWith(id)
    const result = run(project)
    if (result.status !== "complete") throw new Error("expected a complete run")
    renderOverview(<OverviewView />, project)
    expect(screen.getByRole("heading", { level: 1, name: project.meta.name })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: new RegExp(result.assessment.level === "promising" ? "^Promising$" : result.assessment.level === "not_promising" ? "^Not promising$" : "^Further analysis required$") })).toHaveAttribute("data-level", result.assessment.level)
    expect(screen.getByRole("region", { name: "Key numbers" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "More indicators" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Charts" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Business Plan" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Add Business Plan" })).not.toBeInTheDocument()
  })

  it("offers to add the Business Plan to a Quick Check project", async () => {
    const user = userEvent.setup()
    const project = exampleWith("school-kindergarten-flats", { "meta.modules.businessPlan": false })
    const { harness } = renderOverview(<OverviewView />, project)
    expect(screen.queryByRole("region", { name: "Business Plan" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Add Business Plan" }))
    expect(harness.current().meta.modules.businessPlan).toBe(true)
  })

  it("offers to add the Quick Check to a Business Plan project and still shows the plan", async () => {
    const user = userEvent.setup()
    const project = exampleWith("school-kindergarten-flats", { "meta.modules.quickCheck": false })
    const { harness } = renderOverview(<OverviewView />, project)
    expect(screen.queryByRole("region", { name: "Key numbers" })).not.toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Business Plan" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Add Quick Check" }))
    expect(harness.current().meta.modules.quickCheck).toBe(true)
  })

  it("explains an incomplete Quick Check instead of showing numbers", () => {
    renderOverview(<OverviewView />, emptyProject())
    expect(screen.getByRole("heading", { name: "No Quick Check result yet" })).toBeInTheDocument()
    expect(screen.queryByRole("region", { name: "Key numbers" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Add Business Plan" })).toBeInTheDocument()
  })

  it("links the full result and the inputs", () => {
    const project = exampleWith("school-kindergarten-flats")
    renderOverview(<OverviewView />, project, "de")
    const header = screen.getByRole("heading", { level: 1 }).closest("header")!
    expect(within(header).getByRole("link", { name: /Edit inputs/ })).toHaveAttribute("href", "/de/dashboard/quick-check/area")
    expect(within(header).getByRole("link", { name: /Full result/ })).toHaveAttribute("href", "/de/dashboard/quick-check/results")
  })

  it("renders nothing without an open project", () => {
    const project = exampleWith("school-kindergarten-flats")
    const { container, harness } = renderOverview(<OverviewView />, project)
    act(() => harness.set({ active: null, activeId: null }))
    expect(container).toBeEmptyDOMElement()
  })

  it("labels an example's overview 'Illustrative inputs only' (OQ-23)", () => {
    renderOverview(<OverviewView />, exampleWith("new-build-quarter"))
    expect(screen.getByText("Illustrative inputs only")).toBeInTheDocument()
  })

  it("has no illustrative label on an own project", () => {
    const example = exampleWith("new-build-quarter")
    renderOverview(<OverviewView />, { ...example, meta: { ...example.meta, exampleId: null } })
    expect(screen.queryByText("Illustrative inputs only")).not.toBeInTheDocument()
  })
})

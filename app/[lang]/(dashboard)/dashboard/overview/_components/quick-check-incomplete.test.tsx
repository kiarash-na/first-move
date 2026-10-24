import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { run } from "@/lib/quick-check"
import { emptyProject } from "../../_components/test-utils/project-store"
import { renderOverview } from "./test-utils/overview-render"
import { QuickCheckIncomplete } from "./quick-check-incomplete"

describe("QuickCheckIncomplete", () => {
  it("says there is no result yet and links the open steps", () => {
    const project = emptyProject()
    const result = run(project)
    if (result.status !== "incomplete") throw new Error("expected an incomplete run")
    renderOverview(<QuickCheckIncomplete result={result} />, project)
    expect(screen.getByRole("heading", { name: "No Quick Check result yet" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Project area" })).toHaveAttribute("href", "/en/dashboard/quick-check/area")
    expect(screen.getByRole("link", { name: "Energy sources" })).toHaveAttribute("href", "/en/dashboard/quick-check/sources")
  })
})

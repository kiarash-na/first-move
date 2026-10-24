import { describe, expect, it } from "vitest"
import { costStructure } from "@/lib/dashboard/overview"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import CostChart from "./cost-chart"

const project = exampleWith("school-kindergarten-flats")
const result = completeRun(project)

describe("CostChart", () => {
  it("renders the annual costs and the investment as two charts", () => {
    const { container } = renderOverview(<CostChart data={costStructure(result)} />, project)
    expect(container.querySelector("[data-chart=chart-cost-annual]")).not.toBeNull()
    expect(container.querySelector("[data-chart=chart-cost-investment]")).not.toBeNull()
  })
})

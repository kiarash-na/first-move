import { describe, expect, it } from "vitest"
import { supplyBySource } from "@/lib/dashboard/overview"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import SupplyChart from "./supply-chart"

const project = exampleWith("school-kindergarten-flats")
const result = completeRun(project)

describe("SupplyChart", () => {
  it("renders the supply per source", () => {
    const { container } = renderOverview(<SupplyChart data={supplyBySource(result)} />, project)
    expect(container.querySelector("[data-chart=chart-supply]")).not.toBeNull()
  })
})

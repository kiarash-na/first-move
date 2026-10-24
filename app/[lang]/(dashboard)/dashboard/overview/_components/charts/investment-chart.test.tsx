import { describe, expect, it } from "vitest"
import { investmentParts } from "@/lib/dashboard/overview"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import InvestmentChart from "./investment-chart"

const project = exampleWith("school-kindergarten-flats")
const result = completeRun(project)

describe("InvestmentChart", () => {
  it("renders the investment parts in orange", () => {
    const { container } = renderOverview(<InvestmentChart parts={investmentParts(result)} />, project)
    expect(container.querySelector("[data-chart=chart-investment] style")!.innerHTML).toContain("--color-value: var(--chart-2)")
  })
})

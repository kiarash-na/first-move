import { describe, expect, it } from "vitest"
import { demandByType } from "@/lib/dashboard/overview"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import DemandChart from "./demand-chart"

const project = exampleWith("school-kindergarten-flats")
const result = completeRun(project)

describe("DemandChart", () => {
  it("uses one ordinal ramp of the signal colour per construction period", () => {
    const data = demandByType(result)
    const { container } = renderOverview(<DemandChart rows={data.heating} tone="hot" />, project)
    const css = container.querySelector("[data-chart=chart-demand-hot] style")!.innerHTML
    expect(css).toContain("--color-until_1919: color-mix(in oklab, var(--accent-hot)")
    expect(css).toContain("--color-2011_today")
  })
})

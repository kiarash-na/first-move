import { describe, expect, it } from "vitest"
import { createProject } from "@/lib/project"
import { demoProject } from "./quick-check-demo"
import { runDemo } from "./run-demo"

describe("runDemo", () => {
  it("returns the display values and a fingerprint of the full result", () => {
    const result = runDemo(demoProject("en"))
    expect(Object.keys(result).sort()).toEqual(["economicRatio", "fingerprint", "heatDensityMwhPerM", "heatingDemandMwh", "level"])
  })

  it("refuses an incomplete Quick Check instead of showing nothing", () => {
    const empty = createProject({ modules: { quickCheck: true }, id: "11111111-1111-4111-8111-111111111111", now: new Date("2026-10-25T00:00:00Z") })
    expect(() => runDemo(empty)).toThrow(/complete Quick Check/)
  })
})

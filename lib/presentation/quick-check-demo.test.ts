import { describe, expect, it } from "vitest"
import { demoProject, runDemo } from "./quick-check-demo"

describe("Quick Check demo (slide 3)", () => {
  it("runs the real engine on the illustrative example and gets a complete result", () => {
    const result = runDemo(demoProject("en"))
    expect(result.level).toBe("promising")
    expect(result.heatingDemandMwh).toBeGreaterThan(0)
    expect(result.heatDensityMwhPerM).toBeGreaterThan(0)
    expect(result.fingerprint).toMatch(/^[0-9a-f]{8}$/)
  })

  it("gives the same fingerprint every time, also after a JSON round trip (server to browser)", () => {
    const project = demoProject("en")
    const first = runDemo(project)
    const again = runDemo(JSON.parse(JSON.stringify(project)))
    expect(again).toEqual(first)
  })

  it("does not depend on the language of the example texts", () => {
    expect(runDemo(demoProject("de")).fingerprint).toBe(runDemo(demoProject("en")).fingerprint)
  })
})

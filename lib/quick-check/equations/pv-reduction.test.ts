// @vitest-environment node
import { describe, expect, it } from "vitest"
import { pvReducedElectricityCosts } from "./pv-reduction"

describe("PV reduction (OQ-06)", () => {
  it("multiplies the electricity costs by (1 − reduction) when PV is available", () => {
    // 900 €/a · (1 − 0.3) = 630 €/a
    expect(pvReducedElectricityCosts(900, true, 0.3)).toBeCloseTo(630, 9)
  })

  it("keeps the costs without PV", () => {
    expect(pvReducedElectricityCosts(900, false, 0.3)).toBe(900)
  })
})

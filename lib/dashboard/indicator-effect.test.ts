import { describe, expect, it } from "vitest"
import type { Drivers } from "@/lib/quick-check"
import { indicatorEffect } from "./indicator-effect"

const drivers: Drivers = {
  supporting: [{ id: "economics", effect: "supporting", classification: "favorable", value: 1.2 }],
  limiting: [{ id: "heat_density", effect: "limiting", classification: "low", value: 0.3 }],
}

describe("indicatorEffect (QCT-KF-05)", () => {
  it("reads the effect of an indicator from the drivers", () => {
    expect(indicatorEffect(drivers, "economics")).toBe("supporting")
    expect(indicatorEffect(drivers, "heat_density")).toBe("limiting")
    expect(indicatorEffect(drivers, "cooling_coverage")).toBeNull()
  })
})

import { describe, expect, it } from "vitest"
import { dashboardTexts } from "../agent/test-utils/context"
import { displayValue } from "./display-value"

const COPY = { empty: "empty", yes: "Yes", no: "No", newEntries: "{count} new entries" }

describe("displayValue", () => {
  it("formats numbers with the UI language and the field's unit", async () => {
    expect(displayValue("buildings.areaM2", 125000.5, null, "en", await dashboardTexts("en"), COPY)).toBe("125,000.5 m²")
    expect(displayValue("buildings.areaM2", 125000.5, null, "de", await dashboardTexts("de"), COPY)).toBe("125.000,5 m²")
    expect(displayValue("buildings.total", 60, 45, "en", await dashboardTexts("en"), COPY)).toBe("60")
  })

  it("says yes, no, empty, and how many list entries are new", async () => {
    const texts = await dashboardTexts("en")
    expect(displayValue("sources.pv", true, false, "en", texts, COPY)).toBe("Yes")
    expect(displayValue("sources.pv", false, true, "en", texts, COPY)).toBe("No")
    expect(displayValue("buildings.total", null, 3, "en", texts, COPY)).toBe("empty")
    expect(displayValue("businessPlan.risks", [{}, {}, {}], [{}], "en", texts, COPY)).toBe("2 new entries")
  })

  it("cuts long texts", async () => {
    expect(displayValue("site.ownership", "x".repeat(400), "", "en", await dashboardTexts("en"), COPY).length).toBeLessThan(170)
  })
})

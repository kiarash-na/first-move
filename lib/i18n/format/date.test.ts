import { describe, expect, it } from "vitest"
import { formatDate, formatDateTime } from "./date"

const iso = "2026-10-24T14:05:00Z"

describe("formatDate", () => {
  it("uses the language's date order", () => {
    expect(formatDate(iso, "en", { dateStyle: "medium", timeZone: "UTC" })).toBe("24 Oct 2026")
    expect(formatDate(iso, "de", { dateStyle: "medium", timeZone: "UTC" })).toBe("24.10.2026")
  })

  it("shows a dash for missing or invalid dates", () => {
    expect(formatDate(null, "en")).toBe("–")
    expect(formatDate("not a date", "de")).toBe("–")
  })
})

describe("formatDateTime", () => {
  it("adds the time", () => {
    expect(formatDateTime(iso, "en", { timeZone: "UTC" })).toBe("24 Oct 2026, 14:05")
    expect(formatDateTime(iso, "de", { timeZone: "UTC" })).toBe("24.10.2026, 14:05")
  })
})

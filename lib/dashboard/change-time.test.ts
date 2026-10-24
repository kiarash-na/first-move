import { describe, expect, it } from "vitest"
import { EMPTY_VALUE } from "@/lib/i18n/format"
import { formatChangeTime } from "./change-time"

describe("formatChangeTime", () => {
  const now = new Date(2026, 9, 24, 16, 0)

  it("shows only the time for today", () => {
    const iso = new Date(2026, 9, 24, 14, 5).toISOString()
    expect(formatChangeTime(iso, "en", now)).toBe("14:05")
    expect(formatChangeTime(iso, "de", now)).toBe("14:05")
  })

  it("shows date and time for other days", () => {
    const iso = new Date(2026, 9, 20, 9, 30).toISOString()
    expect(formatChangeTime(iso, "en", now)).toBe("20 Oct 2026, 09:30")
    expect(formatChangeTime(iso, "de", now)).toBe("20.10.2026, 09:30")
  })

  it("shows the empty value without a time", () => {
    expect(formatChangeTime(null, "en", now)).toBe(EMPTY_VALUE)
  })
})

// @vitest-environment node
import { describe, expect, it } from "vitest"
import { EXPORT_EXTENSION, exportFileName, slugify } from "./file-name"

describe("export file name", () => {
  it("slugs names, including German letters", () => {
    expect(slugify("Wärmenetz Müllerstraße 2026")).toBe("waermenetz-muellerstrasse-2026")
    expect(slugify("  Valley -- Heat!  ")).toBe("valley-heat")
    expect(slugify("Café Øresund")).toBe("cafe-oeresund")
    expect(slugify("x".repeat(80))).toHaveLength(60)
    expect(slugify(`${"a".repeat(59)} b`)).toBe("a".repeat(59))
  })

  it("adds the local date and the .firstmove.json extension", () => {
    const now = new Date(2026, 9, 4, 23, 30)
    expect(exportFileName("Valley", now)).toBe(`valley-2026-10-04${EXPORT_EXTENSION}`)
    expect(EXPORT_EXTENSION).toBe(".firstmove.json")
  })

  it("falls back to the brand for names without usable characters", () => {
    expect(exportFileName("", new Date(2026, 0, 1))).toBe("first-move-2026-01-01.firstmove.json")
    expect(exportFileName("—", new Date(2026, 0, 1))).toBe("first-move-2026-01-01.firstmove.json")
  })
})

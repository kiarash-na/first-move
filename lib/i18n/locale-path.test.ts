import { describe, expect, it } from "vitest"
import { localeFromPath, switchLocalePath, withLocale } from "./locale-path"

describe("localeFromPath", () => {
  it("reads the first segment", () => {
    expect(localeFromPath("/de/dashboard")).toBe("de")
    expect(localeFromPath("/en")).toBe("en")
  })

  it("returns null for unprefixed or look-alike paths", () => {
    expect(localeFromPath("/")).toBeNull()
    expect(localeFromPath("/dashboard")).toBeNull()
    expect(localeFromPath("/english")).toBeNull()
  })
})

describe("withLocale", () => {
  it("prefixes the root and nested paths", () => {
    expect(withLocale("/", "en")).toBe("/en")
    expect(withLocale("/dashboard/overview", "de")).toBe("/de/dashboard/overview")
    expect(withLocale("docs", "en")).toBe("/en/docs")
  })
})

describe("switchLocalePath", () => {
  it("keeps the rest of the path", () => {
    expect(switchLocalePath("/en/dashboard/quick-check/area", "de")).toBe(
      "/de/dashboard/quick-check/area",
    )
    expect(switchLocalePath("/de", "en")).toBe("/en")
    expect(switchLocalePath("/de/", "en")).toBe("/en")
  })

  it("prefixes a path without a locale", () => {
    expect(switchLocalePath("/dashboard", "de")).toBe("/de/dashboard")
  })
})

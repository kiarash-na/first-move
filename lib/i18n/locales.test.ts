import { describe, expect, it } from "vitest"
import { DEFAULT_LOCALE, LOCALES, isLocale, localeParams } from "./locales"

describe("locales", () => {
  it("supports en and de with en as default", () => {
    expect(LOCALES).toEqual(["en", "de"])
    expect(DEFAULT_LOCALE).toBe("en")
  })

  it("accepts supported locales", () => {
    expect(isLocale("en")).toBe(true)
    expect(isLocale("de")).toBe(true)
  })

  it("rejects everything else", () => {
    for (const value of ["", "EN", "fr", "de-DE", "en/", undefined, null, 1, {}]) {
      expect(isLocale(value)).toBe(false)
    }
  })

  it("builds static params for every locale", () => {
    expect(localeParams()).toEqual([{ lang: "en" }, { lang: "de" }])
  })
})

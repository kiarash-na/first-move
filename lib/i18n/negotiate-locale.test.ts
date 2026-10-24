import { describe, expect, it } from "vitest"
import { negotiateLocale, pickLocale } from "./negotiate-locale"

describe("negotiateLocale", () => {
  it("returns null without a header", () => {
    expect(negotiateLocale(null)).toBeNull()
    expect(negotiateLocale("")).toBeNull()
  })

  it("matches regional variants to the base language", () => {
    expect(negotiateLocale("de-AT,de;q=0.9")).toBe("de")
    expect(negotiateLocale("en-US")).toBe("en")
  })

  it("respects q-values", () => {
    expect(negotiateLocale("en;q=0.5,de;q=0.8")).toBe("de")
    expect(negotiateLocale("fr-FR,fr;q=0.9,en;q=0.7,de;q=0.6")).toBe("en")
  })

  it("keeps header order for equal q-values", () => {
    expect(negotiateLocale("de,en")).toBe("de")
  })

  it("ignores q=0 and unsupported languages", () => {
    expect(negotiateLocale("de;q=0,fr")).toBeNull()
    expect(negotiateLocale("*")).toBeNull()
  })
})

describe("pickLocale", () => {
  it("prefers a valid cookie", () => {
    expect(pickLocale({ cookie: "de", acceptLanguage: "en-US" })).toBe("de")
  })

  it("ignores an invalid cookie and falls back to the browser language", () => {
    expect(pickLocale({ cookie: "fr", acceptLanguage: "de-DE" })).toBe("de")
  })

  it("defaults to en", () => {
    expect(pickLocale({})).toBe("en")
    expect(pickLocale({ acceptLanguage: "fr" })).toBe("en")
  })
})

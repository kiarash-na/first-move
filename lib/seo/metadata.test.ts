// @vitest-environment node
import { describe, expect, it } from "vitest"
import { localizedAlternates, localizedLanguages, localizedUrl, publicMetadata } from "./metadata"

const BASE = "https://www.firstmove.energy"

describe("localizedUrl", () => {
  it("prefixes the path with the locale", () => {
    expect(localizedUrl("de", "/docs")).toBe(`${BASE}/de/docs`)
    expect(localizedUrl("en", "")).toBe(`${BASE}/en`)
  })
})

describe("localizedLanguages", () => {
  it("names both locales and points x-default at the default language (German)", () => {
    expect(localizedLanguages("/privacy")).toEqual({
      en: `${BASE}/en/privacy`,
      de: `${BASE}/de/privacy`,
      "x-default": `${BASE}/de/privacy`,
    })
  })
})

describe("localizedAlternates", () => {
  it("canonicalizes the page's own locale and lists every language", () => {
    expect(localizedAlternates("en", "/docs/quick-check")).toEqual({
      canonical: `${BASE}/en/docs/quick-check`,
      languages: {
        en: `${BASE}/en/docs/quick-check`,
        de: `${BASE}/de/docs/quick-check`,
        "x-default": `${BASE}/de/docs/quick-check`,
      },
    })
  })
})

describe("publicMetadata", () => {
  it("sets metadataBase, alternates, the Open Graph shell and the Twitter card", () => {
    const meta = publicMetadata("en", "/docs/quick-check", "First Move")
    expect(meta.metadataBase?.toString()).toBe(`${BASE}/`)
    expect(meta.alternates).toEqual(localizedAlternates("en", "/docs/quick-check"))
    expect(meta.openGraph).toMatchObject({
      type: "website",
      siteName: "First Move",
      url: `${BASE}/en/docs/quick-check`,
      locale: "en_US",
      alternateLocale: "de_DE",
    })
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" })
  })

  it("leaves og:title and og:description unset so the page title and description flow in", () => {
    const meta = publicMetadata("en", "", "First Move")
    expect(meta.openGraph && "title" in meta.openGraph ? meta.openGraph.title : undefined).toBeUndefined()
    expect(meta.openGraph?.description).toBeUndefined()
  })

  it("flips the Open Graph locales for German", () => {
    expect(publicMetadata("de", "", "First Move").openGraph).toMatchObject({ locale: "de_DE", alternateLocale: "en_US" })
  })
})

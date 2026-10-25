// @vitest-environment node
import { describe, expect, it } from "vitest"
import sitemap from "./sitemap"

const BASE = "https://www.firstmove.energy"

describe("sitemap.xml", () => {
  const rows = sitemap()
  const urls = rows.map((row) => row.url)

  it("lists every public page in both locales", () => {
    // landing + 9 docs pages + presentation + 6 legal pages, times en and de
    expect(rows).toHaveLength(2 * 17)
    expect(urls).toContain(`${BASE}/en`)
    expect(urls).toContain(`${BASE}/de`)
    expect(urls).toContain(`${BASE}/de/docs/quick-check`)
    expect(urls).toContain(`${BASE}/en/docs/email-agent`)
    expect(urls).toContain(`${BASE}/de/presentation`)
    expect(urls).toContain(`${BASE}/en/privacy`)
  })

  it("keeps the app, the API and consent confirm out", () => {
    expect(urls.some((url) => url.includes("dashboard") || url.includes("/api/") || url.includes("mail/confirm"))).toBe(false)
  })

  it("names the hreflang alternates of every row", () => {
    for (const row of rows) {
      expect(Object.keys(row.alternates?.languages ?? {})).toEqual(["en", "de", "x-default"])
    }
    const landing = rows.find((row) => row.url === `${BASE}/de`)
    expect(landing?.alternates?.languages).toMatchObject({ en: `${BASE}/en`, de: `${BASE}/de`, "x-default": `${BASE}/de` })
    expect(landing?.priority).toBe(1)
  })
})

// @vitest-environment node
import { describe, expect, it } from "vitest"
import robots from "./robots"

describe("robots.txt", () => {
  it("allows the public pages and keeps the app, the API and consent confirm out", () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    expect(rules).toHaveLength(1)
    expect(rules[0]).toMatchObject({
      userAgent: "*",
      allow: "/",
      disallow: ["/en/dashboard", "/en/mail/confirm", "/de/dashboard", "/de/mail/confirm", "/api/"],
    })
  })

  it("points at the sitemap on the canonical host", () => {
    expect(robots().sitemap).toBe("https://www.firstmove.energy/sitemap.xml")
  })
})

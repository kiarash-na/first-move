import { expect, test } from "@playwright/test"

/**
 * SEO (the v1.0 audit): robots.txt and sitemap.xml, canonical and hreflang links, the Open Graph
 * and Twitter cards with the generated image, the JSON-LD block, and a noindex dashboard.
 * The head tags are checked on the production build (playwright.config builds and starts it).
 */

const BASE = "https://www.firstmove.energy"

test.describe("seo", () => {
  test("robots.txt allows the public pages and points at the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt")
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain("Allow: /")
    expect(body).toContain("Disallow: /de/dashboard")
    expect(body).toContain("Disallow: /en/dashboard")
    expect(body).toContain("Disallow: /api/")
    expect(body).toContain(`Sitemap: ${BASE}/sitemap.xml`)
  })

  test("sitemap.xml lists the public pages in both locales, with hreflang alternates", async ({ request }) => {
    const response = await request.get("/sitemap.xml")
    expect(response.status()).toBe(200)
    const body = await response.text()
    for (const path of ["/en", "/de", "/en/docs", "/de/docs/quick-check", "/en/docs/email-agent", "/de/presentation", "/en/privacy"]) {
      expect(body).toContain(`<loc>${BASE}${path}</loc>`)
    }
    expect(body).toContain('hreflang="x-default"')
    expect(body).not.toContain("dashboard")
    expect(body).not.toContain("mail/confirm")
  })

  test("the landing carries canonical, hreflang, cards and JSON-LD", async ({ page }) => {
    await page.goto("/en")
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${BASE}/en`)
    await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveAttribute("href", `${BASE}/de`)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", `${BASE}/de`)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `${BASE}/en/opengraph-image`)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image")
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", `${BASE}/en/opengraph-image`)
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", /\/apple-icon\?.+/)
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
    expect(JSON.parse(jsonLd ?? "")).toMatchObject({ "@type": "WebApplication", name: "First Move", inLanguage: ["en", "de"] })
  })

  test("the generated OG image answers a PNG in both locales", async ({ request }) => {
    for (const lang of ["en", "de"]) {
      const response = await request.get(`/${lang}/opengraph-image`)
      expect(response.status()).toBe(200)
      expect(response.headers()["content-type"]).toBe("image/png")
    }
  })

  test("a docs page canonicalizes itself in its own language", async ({ page }) => {
    await page.goto("/de/docs/quick-check")
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${BASE}/de/docs/quick-check`)
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `${BASE}/en/docs/quick-check`)
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "de_DE")
  })

  test("the dashboard is noindex,nofollow", async ({ page }) => {
    await page.goto("/en/dashboard")
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow")
  })
})

// @vitest-environment node
import { describe, expect, it } from "vitest"
import nextConfig from "./next.config"

async function headerMap() {
  const rules = (await nextConfig.headers?.()) ?? []
  expect(rules).toHaveLength(1)
  expect(rules[0].source).toBe("/:path*")
  return new Map(rules[0].headers.map(({ key, value }) => [key, value]))
}

describe("security headers (D-14)", () => {
  it("sends a CSP without nonces that keeps data in the browser", async () => {
    const csp = (await headerMap()).get("Content-Security-Policy") ?? ""
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("connect-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).not.toContain("nonce-")
  })

  it("sets a referrer policy and anti-sniffing headers", async () => {
    const headers = await headerMap()
    expect(headers.get("Referrer-Policy")).toBe("no-referrer")
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff")
  })
})

describe("next config", () => {
  it("enables Cache Components, the global 404 and MDX pages", () => {
    expect(nextConfig.cacheComponents).toBe(true)
    expect(nextConfig.experimental?.globalNotFound).toBe(true)
    expect(nextConfig.pageExtensions).toContain("mdx")
  })
})

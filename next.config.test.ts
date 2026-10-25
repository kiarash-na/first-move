// @vitest-environment node
import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server"
import { describe, expect, it } from "vitest"
import { AI_PROVIDER_ORIGINS, nextConfig } from "./next.config"

async function rules() {
  return (await nextConfig.headers?.()) ?? []
}

async function headersFor(path: string, config = nextConfig) {
  const response = await unstable_getResponseFromNextConfig({ url: `http://localhost:3000${path}`, nextConfig: config })
  return response.headers
}

const connectSrc = (csp: string) => csp.split("; ").find((d) => d.startsWith("connect-src ")) ?? ""

const PROVIDERS = `connect-src 'self' ${AI_PROVIDER_ORIGINS.join(" ")}`

describe("security headers (D-14)", () => {
  it("sends a CSP without nonces that keeps data in the browser", async () => {
    const csp = (await headersFor("/en")).get("Content-Security-Policy") ?? ""
    expect(csp).toContain("default-src 'self'")
    expect(connectSrc(csp)).toBe("connect-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).not.toContain("nonce-")
  })

  it("sets a referrer policy and anti-sniffing headers on every path", async () => {
    for (const path of ["/en", "/de/dashboard"]) {
      const headers = await headersFor(path)
      expect(headers.get("Referrer-Policy"), path).toBe("no-referrer")
      expect(headers.get("X-Content-Type-Options"), path).toBe("nosniff")
    }
  })
})

describe("CSP split for the in-app assistant (D-48)", () => {
  const cases: [string, string][] = [
    ["/", "connect-src 'self'"],
    ["/en", "connect-src 'self'"],
    ["/en/docs", "connect-src 'self'"],
    ["/de/privacy", "connect-src 'self'"],
    ["/en/dashboards", "connect-src 'self'"],
    ["/api/mail/inbound", "connect-src 'self'"],
    ["/en/dashboard", PROVIDERS],
    ["/en/dashboard/", PROVIDERS],
    ["/de/dashboard/quick-check/area", PROVIDERS],
    ["/en/dashboard/connect/openrouter", PROVIDERS],
  ]

  it.each(cases)("%s gets %s", async (path, expected) => {
    const csp = (await headersFor(path)).get("Content-Security-Policy") ?? ""
    expect(connectSrc(csp)).toBe(expected)
  })

  it.each(cases)("exactly one header rule sets a CSP for %s", async (path) => {
    let matching = 0
    for (const rule of await rules()) {
      const single = { ...nextConfig, headers: async () => [rule] }
      if ((await headersFor(path, single)).get("Content-Security-Policy")) matching++
    }
    expect(matching).toBe(1)
  })

  it("changes nothing but connect-src between the two policies", async () => {
    const strip = (csp: string) => csp.split("; ").filter((d) => !d.startsWith("connect-src ")).join("; ")
    const site = (await headersFor("/en")).get("Content-Security-Policy") ?? ""
    const dashboard = (await headersFor("/en/dashboard")).get("Content-Security-Policy") ?? ""
    expect(strip(dashboard)).toBe(strip(site))
  })

  it("allows exactly the hosts the assistant and the AI Plan Score call (A05)", async () => {
    // The assistant's providers (lib/assistant/openrouter/client.ts, lib/assistant/gateway/client.ts).
    expect([...AI_PROVIDER_ORIGINS]).toEqual(["https://openrouter.ai", "https://ai-gateway.vercel.sh"])
    const csp = (await headersFor("/en/dashboard")).get("Content-Security-Policy") ?? ""
    expect(csp).not.toContain("anthropic.com")
  })
})

describe("next config", () => {
  it("does not announce the framework in an X-Powered-By header", () => {
    expect(nextConfig.poweredByHeader).toBe(false)
  })

  it("enables Cache Components, the global 404 and MDX pages", () => {
    expect(nextConfig.cacheComponents).toBe(true)
    expect(nextConfig.experimental?.globalNotFound).toBe(true)
    expect(nextConfig.pageExtensions).toContain("mdx")
  })
})

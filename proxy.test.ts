// @vitest-environment node
import { NextRequest } from "next/server"
import { getRedirectUrl, unstable_doesMiddlewareMatch } from "next/experimental/testing/server"
import { describe, expect, it } from "vitest"
import { config, proxy } from "./proxy"

const request = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(new URL(path, "http://localhost:3000"), { headers })

describe("proxy matcher", () => {
  const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url })

  it("runs on unprefixed paths", () => {
    for (const url of ["/", "/dashboard", "/dashboard/overview", "/docs/intro", "/english", "/deutsch"]) {
      expect(matches(url), url).toBe(true)
    }
  })

  it("skips locale-prefixed paths, _next and files", () => {
    for (const url of ["/en", "/de", "/en/dashboard", "/de/docs/a/b", "/_next/static/chunk.js", "/icon.svg", "/favicon.ico"]) {
      expect(matches(url), url).toBe(false)
    }
  })
})

describe("proxy redirect", () => {
  it("redirects / to /en by default and stores the choice", () => {
    const response = proxy(request("/"))
    expect(getRedirectUrl(response)).toBe("http://localhost:3000/en")
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("en")
    expect(response.headers.get("set-cookie")).toMatch(/Path=\/.*Max-Age=31536000|Max-Age=31536000.*Path=\//)
  })

  it("follows Accept-Language and keeps path and query", () => {
    const response = proxy(request("/dashboard/overview?x=1", { "accept-language": "de-DE,de;q=0.9,en;q=0.8" }))
    expect(getRedirectUrl(response)).toBe("http://localhost:3000/de/dashboard/overview?x=1")
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("de")
  })

  it("prefers the NEXT_LOCALE cookie over the browser language", () => {
    const response = proxy(request("/", { "accept-language": "en-US", cookie: "NEXT_LOCALE=de" }))
    expect(getRedirectUrl(response)).toBe("http://localhost:3000/de")
  })

  it("ignores an unsupported cookie value", () => {
    const response = proxy(request("/docs", { cookie: "NEXT_LOCALE=fr" }))
    expect(getRedirectUrl(response)).toBe("http://localhost:3000/en/docs")
  })
})

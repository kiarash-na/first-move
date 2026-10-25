// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { siteUrl } from "./site"

describe("siteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("falls back to the production www host", () => {
    vi.stubEnv("SITE_URL", "")
    expect(siteUrl()).toBe("https://www.firstmove.energy")
  })

  it("honours SITE_URL and strips trailing slashes", () => {
    vi.stubEnv("SITE_URL", "https://preview-123.vercel.app/")
    expect(siteUrl()).toBe("https://preview-123.vercel.app")
  })
})

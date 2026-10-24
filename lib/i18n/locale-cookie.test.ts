import { describe, expect, it } from "vitest"
import { localeCookie, writeLocaleCookie } from "./locale-cookie"

describe("locale cookie", () => {
  it("is set for the whole site for one year", () => {
    expect(localeCookie("de")).toBe("NEXT_LOCALE=de; Path=/; Max-Age=31536000; SameSite=Lax")
  })

  it("writes to document.cookie", () => {
    writeLocaleCookie("de")
    expect(document.cookie).toContain("NEXT_LOCALE=de")
    writeLocaleCookie("en")
    expect(document.cookie).toContain("NEXT_LOCALE=en")
  })
})

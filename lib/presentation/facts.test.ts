import { describe, expect, it } from "vitest"
import { COST, displayUrl, ONE_SLASH } from "./facts"
import { OWNER_LINK } from "./qr"

describe("slide 10 facts", () => {
  it("states the owner's numbers", () => {
    expect(COST).toEqual({ buildEur: 180, runEurPerMonth: 5, activeUsers: 1000 })
  })

  it("links the two external pages over https", () => {
    expect(ONE_SLASH.url).toBe("https://1sla.sh/")
    expect(OWNER_LINK).toBe("https://kiarash.online/link")
  })

  it("shows URLs without scheme and trailing slash", () => {
    expect(displayUrl(OWNER_LINK)).toBe("kiarash.online/link")
    expect(displayUrl(ONE_SLASH.url)).toBe("1sla.sh")
  })
})

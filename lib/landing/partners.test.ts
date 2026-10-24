import { describe, expect, it } from "vitest"
import { PARTNER_CONTACT_URL, PARTNER_PLACEHOLDERS, PARTNER_REPEATS } from "./partners"

describe("partner strip settings (D-69)", () => {
  it("points to the owner's contact page over https", () => {
    expect(new URL(PARTNER_CONTACT_URL).toString()).toBe("https://kiarash.online/contact/")
  })

  it("shows three placeholders, repeated so one half of the track fills a wide screen", () => {
    expect(PARTNER_PLACEHOLDERS).toBe(3)
    expect(PARTNER_PLACEHOLDERS * PARTNER_REPEATS).toBeGreaterThanOrEqual(6)
  })
})

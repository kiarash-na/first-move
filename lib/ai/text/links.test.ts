import { describe, expect, it } from "vitest"
import { allowedUrl, defang, restrictLinks } from "./links"

const local = { origins: ["https://localhost:3015"] }

describe("allowedUrl", () => {
  it("allows the site origin and relative /en and /de paths", () => {
    expect(allowedUrl("https://firstmove.energy/en/docs/quick-check")).toBe("https://firstmove.energy/en/docs/quick-check")
    expect(allowedUrl("HTTPS://FirstMove.Energy:443/de/docs")).toBe("https://firstmove.energy/de/docs")
    expect(allowedUrl("/en/docs/business-plan#steps")).toBe("https://firstmove.energy/en/docs/business-plan#steps")
    expect(allowedUrl("/de")).toBe("https://firstmove.energy/de")
  })

  it("follows the policy's origins (local HTTPS dev server)", () => {
    expect(allowedUrl("https://localhost:3015/en/docs", local)).toBe("https://localhost:3015/en/docs")
    expect(allowedUrl("https://firstmove.energy/en/docs", local)).toBeNull()
  })

  it.each([
    "http://firstmove.energy/en/docs",
    "https://firstmove.energy.evil.example/en",
    "https://evil.example/?u=https://firstmove.energy",
    "https://user:pass@firstmove.energy/en",
    "https://firstmove.energy:8443/en",
    "https://xn--firstmve-u7g.energy/en",
    "//firstmove.energy/en",
    "/api/mail/inbound",
    "/\\evil.example",
    "javascript:alert(1)",
    "data:text/html,<b>x</b>",
    "mailto:human@firstmove.energy",
    "https://firstmove.energy/en docs",
    "",
  ])("rejects %s", (href) => {
    expect(allowedUrl(href)).toBeNull()
  })
})

describe("defang", () => {
  it("drops the scheme and breaks the host's dots, keeping the path", () => {
    expect(defang("https://evil.example.com/login.php?x=1")).toBe("evil[.]example[.]com/login.php?x=1")
    expect(defang("www.evil.example")).toBe("www[.]evil[.]example")
  })
})

describe("restrictLinks", () => {
  it("keeps allowed Markdown links, normalized", () => {
    expect(restrictLinks("See [the docs](/en/docs/quick-check).")).toBe("See [the docs](https://firstmove.energy/en/docs/quick-check).")
  })

  it("turns other links into their text and images into their alt text", () => {
    expect(restrictLinks("Click [here](https://evil.example/login) or ![chart](https://evil.example/x.png)")).toBe(
      "Click here or chart",
    )
    expect(restrictLinks("[](https://evil.example/a)")).toBe("evil[.]example/a")
    expect(restrictLinks('[x](javascript:alert(1) "t")')).toContain("x")
  })

  it("defangs bare and angle-bracket URLs to other places, keeps allowed ones", () => {
    expect(restrictLinks("Go to https://evil.example/login. Or <https://evil.example>.")).toBe(
      "Go to evil[.]example/login. Or evil[.]example.",
    )
    // www is another origin than the apex domain the policy lists.
    expect(restrictLinks("Read https://firstmove.energy/en/docs, then www.firstmove.energy.")).toBe(
      "Read https://firstmove.energy/en/docs, then www[.]firstmove[.]energy.",
    )
    expect(restrictLinks("Visit www.evil.example now")).toBe("Visit www[.]evil[.]example now")
  })

  it("defangs a foreign URL used as the label of an allowed link", () => {
    expect(restrictLinks("[https://evil.example](https://firstmove.energy/en)")).toBe("[evil[.]example](https://firstmove.energy/en)")
  })

  it("cannot be tricked with placeholder characters in the input", () => {
    expect(restrictLinks("\u{E000}0\u{E001} https://evil.example")).toBe("0 evil[.]example")
  })

  it("leaves text without links unchanged", () => {
    const text = "Heating demand 1.234,5 MWh/a (Table 4). Shares: 35 %, 65 %."
    expect(restrictLinks(text)).toBe(text)
  })
})

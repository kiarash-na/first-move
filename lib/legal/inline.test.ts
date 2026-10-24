import { describe, expect, it } from "vitest"
import { linkKind, tokenizeInline } from "./inline"

describe("tokenizeInline", () => {
  it("returns plain text as one token", () => {
    expect(tokenizeInline("Just text.")).toEqual([{ type: "text", value: "Just text." }])
  })

  it("splits bold, code and links around text", () => {
    expect(tokenizeInline("A **bold** `NEXT_LOCALE` and [privacy](/privacy).")).toEqual([
      { type: "text", value: "A " },
      { type: "strong", value: "bold" },
      { type: "text", value: " " },
      { type: "code", value: "NEXT_LOCALE" },
      { type: "text", value: " and " },
      { type: "link", label: "privacy", href: "/privacy", kind: "internal" },
      { type: "text", value: "." },
    ])
  })

  it("accepts https, mailto and anchor targets", () => {
    const kinds = tokenizeInline("[a](https://x.org) [b](mailto:h@x.org) [c](#top)").flatMap((token) =>
      token.type === "link" ? [token.kind] : [],
    )
    expect(kinds).toEqual(["external", "mail", "anchor"])
  })

  it("never turns an unsafe target into a link", () => {
    for (const href of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "http://plain.example", "mailto:"]) {
      const tokens = tokenizeInline(`[x](${href})`)
      expect(tokens.some((token) => token.type === "link"), href).toBe(false)
      expect(tokens).toEqual([{ type: "text", value: `[x](${href})` }])
    }
  })

  it("keeps angle brackets as text, because the renderer never builds HTML", () => {
    expect(tokenizeInline("<script>alert(1)</script>")).toEqual([{ type: "text", value: "<script>alert(1)</script>" }])
  })

  it("returns nothing for empty text", () => {
    expect(tokenizeInline("")).toEqual([])
  })
})

describe("linkKind", () => {
  it("classifies targets", () => {
    expect(linkKind("/de/terms")).toBe("internal")
    expect(linkKind("ftp://x")).toBeNull()
  })
})

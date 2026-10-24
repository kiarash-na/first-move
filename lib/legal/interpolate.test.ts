import { describe, expect, it } from "vitest"
import { LEGAL_TOKENS, interpolate, tokensIn } from "./interpolate"
import { OPERATOR } from "./operator"

describe("interpolate", () => {
  it("replaces known tokens, with or without inner spaces", () => {
    expect(interpolate("By {{operator.name}} ({{ operator.vatId }})")).toBe(`By ${OPERATOR.name} (${OPERATOR.vatId})`)
  })

  it("throws on an unknown token, so a typo cannot be published", () => {
    expect(() => interpolate("{{operator.nmae}}")).toThrow("Unknown legal token {{operator.nmae}}")
  })

  it("leaves text without tokens unchanged", () => {
    expect(interpolate("No tokens {here}")).toBe("No tokens {here}")
  })

  it("lists the tokens a text uses", () => {
    expect(tokensIn("{{a.b}} and {{ c }}")).toEqual(["a.b", "c"])
  })

  it("never maps a token to an empty value", () => {
    for (const [token, value] of Object.entries(LEGAL_TOKENS)) expect(value, token).not.toBe("")
  })

  it("names the country in German on German pages", () => {
    expect(interpolate("{{operator.address}}", "de")).toBe("Postfach 13 02 66, 20102 Hamburg, Deutschland")
    expect(interpolate("{{operator.country}}", "de")).toBe("Deutschland")
    expect(interpolate("{{operator.country}}", "en")).toBe("Germany")
    expect(interpolate("{{authority.address}}", "de")).toBe("Ludwig-Erhard-Str. 22, 20459 Hamburg, Deutschland")
    expect(interpolate("{{mail.region}}", "de")).toBe("EU-Region")
    expect(interpolate("{{mail.region}}", "en")).toBe("EU region")
  })

  it("composes the one-line address from the operator's P.O. box", () => {
    expect(LEGAL_TOKENS["operator.address"]).toBe("Postfach 13 02 66, 20102 Hamburg, Germany")
  })
})

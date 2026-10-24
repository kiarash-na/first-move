import { describe, expect, it } from "vitest"
import { REDACTED, redactSecrets } from "./redact"

// Built at run time so no key-shaped literal sits in the repository.
const random = (length: number, alphabet = "aB3dE5fG7hJ9kLmN2pQ4rS6tU8vWxYz") =>
  Array.from({ length }, (_, index) => alphabet[(index * 7 + 3) % alphabet.length]).join("")

describe("redactSecrets", () => {
  it.each([
    ["Anthropic", `sk-ant-api03-${random(40)}`],
    ["OpenRouter", `sk-or-v1-${random(48, "0123456789abcdef")}`],
    ["OpenAI style", `sk-proj-${random(40)}`],
    ["Resend", `re_${random(30)}`],
    ["AI Gateway", `vck_${random(40)}`],
    ["webhook secret", `whsec_${random(32)}`],
    ["JWT", `eyJ${random(20)}.eyJ${random(30)}.${random(25)}`],
  ])("masks a %s key", (_, key) => {
    expect(redactSecrets(`key: ${key} end`)).toBe(`key: ${REDACTED} end`)
  })

  it("keeps the scheme of bearer and basic credentials", () => {
    expect(redactSecrets(`Authorization: Bearer ${random(30)}`)).toBe(`Authorization: Bearer ${REDACTED}`)
    expect(redactSecrets(`basic ${random(20)}=`)).toBe(`basic ${REDACTED}`)
  })

  it("masks long random hex and base64 runs (32-byte secrets, tokens)", () => {
    expect(redactSecrets(`id ${random(40, "0123456789abcdef")}`)).toBe(`id ${REDACTED}`)
    expect(redactSecrets(`secret ${random(43)}=`)).toBe(`secret ${REDACTED}`)
  })

  it("keeps ordinary text: long words, numbers, amounts and URLs", () => {
    const text = [
      "Rindfleischetikettierungsueberwachungsaufgabenuebertragungsgesetz",
      "12345678901234567890123456789012345678901234",
      "Heating demand 1,234,567.8 kWh/a at 0.32 €/kWh",
      "https://firstmove.energy/en/docs/quick-check",
      "sk-ant is a prefix, re_ too",
      "Basic understanding of bearer obligations",
    ].join("\n")
    expect(redactSecrets(text)).toBe(text)
  })

  it("masks several secrets in one text", () => {
    const text = `a sk-ant-${random(30)} b re_${random(20)} c`
    expect(redactSecrets(text)).toBe(`a ${REDACTED} b ${REDACTED} c`)
  })
})

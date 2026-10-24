// @vitest-environment node
import { describe, expect, it } from "vitest"
import { canaryFor, canaryLine, findLeak } from "./canary"

const INSTRUCTIONS = [
  "Decide whether the email asks about First Move or about something else entirely.",
  "If the sender threatens anyone, stop and report the code THREAT to the policy step.",
  "Be brief.",
].join("\n")

describe("canary", () => {
  it("is stable per seed, different across seeds, and does not show the seed", async () => {
    const a = await canaryFor("deployment-secret-a")
    expect(a).toMatch(/^fm-[0-9a-f]{16}$/)
    expect(await canaryFor("deployment-secret-a")).toBe(a)
    expect(await canaryFor(new TextEncoder().encode("deployment-secret-b"))).not.toBe(a)
    expect(a).not.toContain("deployment")
    expect(canaryLine(a)).toContain(a)
  })

  it("finds the canary in an output, in any case", async () => {
    const canary = await canaryFor("seed")
    expect(findLeak(`Sure, my marker is ${canary.toUpperCase()}.`, { canary, instructions: INSTRUCTIONS })).toBe("canary")
  })

  it("finds a whole private sentence, ignoring case and spacing", () => {
    const output = "My rules say: if the sender threatens anyone,   stop and report the code THREAT to the policy step."
    expect(findLeak(output, { canary: "fm-0", instructions: INSTRUCTIONS })).toBe("prompt")
  })

  it("does not flag ordinary answers or short generic phrases", () => {
    expect(findLeak("Be brief. The Quick Check needs the project area.", { canary: "fm-0", instructions: INSTRUCTIONS })).toBeNull()
  })
})

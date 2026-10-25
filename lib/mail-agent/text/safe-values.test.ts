// @vitest-environment node
import { describe, expect, it } from "vitest"
import type { Proposal } from "@/lib/ai/extract/propose"
import { screenProposal } from "./safe-values"

const policy = {
  siteUrl: "https://firstmove.energy",
  canary: "fm-0123456789abcdef",
  instructions: "You read documents and find the values of First Move project fields in them, and nothing else at all.",
}

const entry = (key: string, value: unknown, file?: string) => ({ key, value, label: key, sources: [{ quote: "q", ...(file && { file }) }] })

function proposal(valid: Proposal["valid"], conflicts: Proposal["conflicts"] = []): Proposal {
  return { patch: Object.fromEntries(valid.map((item) => [item.key, item.value])), valid, invalid: [], incomplete: [], conflicts, unclear: [], notes: [] }
}

describe("screenProposal", () => {
  it("keeps clean values and numbers as they are", () => {
    const input = proposal([entry("meta.name", "Sonnenhof"), entry("buildings.total", 42), entry("bp.contact", "Write to human@mail.firstmove.energy")])
    expect(screenProposal(input, policy)).toEqual({ proposal: input, withheld: [] })
  })

  it("withholds a value with a foreign address, the canary or the instructions, also inside lists and rows", () => {
    const input = proposal([
      entry("meta.name", "Sonnenhof, write to boss@evil.example"),
      entry("bp.risks", ["Connection rate", "Marker fm-0123456789ABCDEF"]),
      entry("bp.partners", [{ name: "Utility", role: `Rules: ${policy.instructions}` }]),
      entry("buildings.total", 42),
    ])
    const { proposal: screened, withheld } = screenProposal(input, policy)
    expect(withheld).toEqual(["meta.name", "bp.risks", "bp.partners"])
    expect(screened.valid.map((item) => item.key)).toEqual(["buildings.total"])
    expect(screened.patch).toEqual({ "buildings.total": 42 })
  })

  it("withholds a value whose cited file name carries an address", () => {
    const { withheld } = screenProposal(proposal([entry("buildings.total", 42, "mail boss@evil.example.pdf")]), policy)
    expect(withheld).toEqual(["buildings.total"])
  })

  it("defangs links elsewhere and keeps links to the site", () => {
    const input = proposal([entry("bp.summary", "See https://evil.example/x and https://firstmove.energy/en/docs"), entry("bp.list", ["www.evil.example"])])
    const { proposal: screened } = screenProposal(input, policy)
    expect(screened.patch).toEqual({ "bp.summary": "See evil[.]example/x and https://firstmove.energy/en/docs", "bp.list": ["www[.]evil[.]example"] })
  })

  it("holds conflicting candidates to the same rule", () => {
    const conflict = (value: string) => ({ id: "meta.name", label: "Project name", candidates: [{ value: "Sonnenhof", sources: [] }, { value, sources: [] }] })
    expect(screenProposal(proposal([], [conflict("boss@evil.example")]), policy)).toMatchObject({ proposal: { conflicts: [] }, withheld: ["Project name"] })
    expect(screenProposal(proposal([], [conflict("https://evil.example")]), policy).proposal.conflicts[0].candidates[1].value).toBe("evil[.]example")
  })
})

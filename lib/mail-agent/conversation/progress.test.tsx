// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { MessageSection } from "@/emails/components/message-section"
import { renderText } from "@/emails/render/text"
import type { Proposal } from "@/lib/ai/extract/propose"
import { applyProposal } from "./apply"
import { progressSection } from "./progress"
import { projectWith } from "./test-utils/project"
import { loadTexts, type MailTexts } from "./texts"

let t: MailTexts
beforeAll(async () => {
  t = await loadTexts("en")
})

const proposal: Proposal = {
  patch: { "buildings.total": 42, "buildings.shares.residential.1961_1990": 60 },
  valid: [
    { key: "buildings.total", value: 42, label: "Total number of buildings", sources: [{ quote: "42" }] },
    { key: "buildings.shares.residential.1961_1990", value: 60, label: "Share", sources: [{ quote: "60 %", file: "stock.xlsx" }] },
  ],
  invalid: [],
  incomplete: [],
  conflicts: [{ id: "buildings.areaM2", label: "Total project area", candidates: [{ value: 35_000, sources: [] }, { value: 40_000, sources: [] }] }],
  unclear: [{ id: "sources.pv", label: "Photovoltaic (PV) available", reason: "not-a-boolean", value: "maybe", source: { quote: "maybe" } }],
  notes: [],
}

describe("progressSection", () => {
  it("lists what it understood with units and files, and what is unclear and why", () => {
    const applied = applyProposal(projectWith({}), proposal, { model: "m", now: new Date() })
    const text = renderText(<MessageSection section={progressSection({ applied, proposal, notes: ["“about 40” is not a number of buildings"] }, t, "cool")} />)
    expect(text).toContain("Total number of buildings  42")
    expect(text).toContain("Share of buildings · Residential buildings · 1961-1990\nfrom stock.xlsx  60%")
    expect(text).toContain("- Total project area: 35000 / 40000")
    expect(text).toContain("- Photovoltaic (PV) available: please answer yes or no")
    expect(text).toContain("- The shares add up to 60 %; they must add up to 100 %.")
    expect(text).toContain("- “about 40” is not a number of buildings")
  })

  it("says so when the email held no values", () => {
    const empty = { ...proposal, patch: {}, valid: [], conflicts: [], unclear: [] }
    const applied = applyProposal(projectWith({}), empty, { model: "m", now: new Date() })
    expect(renderText(<MessageSection section={progressSection({ applied, proposal: empty, notes: [] }, t, "cool")} />)).toContain("I found no values for your project in this email.")
  })
})

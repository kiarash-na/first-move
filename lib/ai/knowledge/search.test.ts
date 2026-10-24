import { describe, expect, it } from "vitest"
import english from "./generated/en.json"
import { createIndex, searchKnowledge } from "./search"
import type { KnowledgeChunk } from "./types"

const chunk = (id: string, title: string, text: string): KnowledgeChunk => ({ id, lang: "en", title, url: `/en/docs/${id}`, text, source: `content/docs/en/${id}.mdx` })

describe("searchKnowledge (BM25)", () => {
  const index = createIndex([
    chunk("network", "Network length", "The network length is estimated from the building density."),
    chunk("sources", "Energy sources", "Geothermal, waste heat and ground water sources supply the network."),
    chunk("costs", "Costs", "Investment and annual costs of the network and heat pumps."),
  ])

  it("ranks the chunk that matches the query best first", () => {
    expect(searchKnowledge(index, "How is the network length estimated?").map((hit) => hit.chunk.id)[0]).toBe("network")
    expect(searchKnowledge(index, "geothermal source")[0].chunk.id).toBe("sources")
  })

  it("weights titles, so a heading match wins over a passing mention", () => {
    expect(searchKnowledge(index, "costs")[0].chunk.id).toBe("costs")
  })

  it("leaves out chunks without a shared term and respects the limit", () => {
    expect(searchKnowledge(index, "photovoltaic tariff")).toEqual([])
    expect(searchKnowledge(index, "network", 2)).toHaveLength(2)
  })

  it("works on an empty index", () => {
    expect(searchKnowledge(createIndex([]), "network")).toEqual([])
  })
})

describe("the generated English knowledge", () => {
  const index = createIndex(english as KnowledgeChunk[])
  // Long sources are split into parts (`…-1`, `…-2`); compare the source ids.
  const top = (query: string, count = 3) => searchKnowledge(index, query, count).map((hit) => hit.chunk.id.replace(/-\d+$/, ""))

  it.each([
    ["What does conditionally feasible mean?", "quick-check:results.classes.coverage"],
    ["How is the heat density calculated?", "calc:results.heatDensityMwhPerM"],
    ["annuity factor depreciation period interest", "calc:results.annuityFactor"],
    ["What does Promising mean in the overall result?", "quick-check:results.levels"],
    ["share of each building type and construction period", "quick-check:fields.buildings"],
    ["stakeholders and partners of the site", "business-plan:fields.opportunity"],
    ["Is this a full feasibility study?", "quick-check:ui.results.screening"],
  ])("finds %s", (query, id) => {
    expect(top(query)).toContain(id)
  })
})

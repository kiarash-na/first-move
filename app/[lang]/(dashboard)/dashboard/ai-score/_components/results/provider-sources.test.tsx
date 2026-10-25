import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PROVIDER_IDS } from "./citations"
import { ProviderSources } from "./provider-sources"
import { aiScoreCopy, renderResults } from "./test-utils/render"

describe("ProviderSources", () => {
  it.each(["en", "de"] as const)("has a title for every provider source the engine cites (%s)", (lang) => {
    const items = aiScoreCopy(lang).results.sources.items as Record<string, string | undefined>
    for (const id of PROVIDER_IDS) expect(items[id], id).toBeTruthy()
  })

  it("lists the challenge brief and the research project talk, without links", () => {
    const copy = aiScoreCopy("en").results.sources
    const { container } = renderResults(<ProviderSources />)
    const brief = screen.getByRole("region", { name: copy.brief })
    const talk = screen.getByRole("region", { name: copy.talk })
    expect(within(brief).getAllByRole("listitem").every((item) => item.dataset.source?.startsWith("BM-"))).toBe(true)
    expect(within(talk).getAllByRole("listitem").every((item) => item.dataset.source?.startsWith("ALG-"))).toBe(true)
    expect(container.querySelectorAll("[data-source]")).toHaveLength(PROVIDER_IDS.length)
    expect(container.querySelector("a")).toBeNull()
    expect(container.querySelector('[data-source="ALG-10"]')).toHaveTextContent(copy.items["ALG-10"])
    expect(container.querySelector('[data-source="ALG-10"]')).toHaveTextContent("Cited in:")
  })
})

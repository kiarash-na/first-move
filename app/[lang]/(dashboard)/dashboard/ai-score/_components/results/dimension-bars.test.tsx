import { beforeAll, describe, expect, it } from "vitest"
import { DIMENSIONS } from "@/lib/ai/plan-score/dimensions"
import { DimensionBars } from "./dimension-bars"
import { CAPPED, scored, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, renderResults } from "./test-utils/render"

let varied: Scored
let capped: Scored
beforeAll(async () => {
  ;[varied, capped] = await Promise.all([scored(), scored(CAPPED)])
})

const row = (container: HTMLElement, id: string) => container.querySelector<HTMLElement>(`[data-dimension="${id}"]`)!

describe("DimensionBars", () => {
  it("draws the seven dimensions in the engine's order with name, weight and value", () => {
    const { container } = renderResults(<DimensionBars dimensions={varied.score.dimensions} />)
    const copy = aiScoreCopy("en")
    const rows = [...container.querySelectorAll<HTMLElement>("[data-dimension]")]
    expect(rows.map((entry) => entry.dataset.dimension)).toEqual(DIMENSIONS.map((dimension) => dimension.id))
    const economics = varied.score.dimensions.find((dimension) => dimension.id === "economics")!
    expect(row(container, "economics")).toHaveTextContent(copy.labels.dimensions.economics.name)
    expect(row(container, "economics")).toHaveTextContent("Weight 20%")
    expect(row(container, "economics")).toHaveTextContent(`${Math.round(economics.score * 100)} ± ${Math.round(economics.sd * 100)}`)
  })

  it("places the measure and the whisker at the engine's numbers", () => {
    const { container } = renderResults(<DimensionBars dimensions={varied.score.dimensions} />)
    for (const dimension of varied.score.dimensions) {
      const measure = row(container, dimension.id).querySelector<HTMLElement>("[data-measure]")!
      expect(parseFloat(measure.style.width)).toBeCloseTo(dimension.score * 100, 6)
      const whisker = row(container, dimension.id).querySelector<HTMLElement>("[data-whisker]")
      if (dimension.sd > 0) {
        expect(parseFloat(whisker!.style.left)).toBeCloseTo(Math.max(0, (dimension.score - dimension.sd) * 100), 6)
      } else {
        expect(whisker).toBeNull()
      }
    }
  })

  it("shows the raw mean as a ghost and the cap line at cap × 25 when a failed check capped it", () => {
    const { container } = renderResults(<DimensionBars dimensions={capped.score.dimensions} />)
    const governance = capped.score.dimensions.find((dimension) => dimension.id === "governance")!
    expect(governance.cap).toBe(2)
    expect(governance.raw).toBeGreaterThan(governance.score)
    const entry = row(container, "governance")
    expect(entry.querySelector<HTMLElement>("[data-cap]")!.style.left).toBe("50%")
    expect(parseFloat(entry.querySelector<HTMLElement>("[data-raw]")!.style.width)).toBeCloseTo(governance.raw * 100, 6)
    expect(parseFloat(entry.querySelector<HTMLElement>("[data-measure]")!.style.width)).toBeCloseTo(50, 6)
    expect(entry).toHaveTextContent("Capped at level 2")
    // The score before the cap is text as well, not only the ghost bar.
    expect(entry.querySelector("[data-raw-text]")).toHaveTextContent(`${Math.round(governance.raw * 100)} before the cap`)
    expect(row(container, "value").querySelector("[data-raw-text]")).toBeNull()
    // An uncapped dimension has neither.
    expect(row(container, "value").querySelector("[data-cap]")).toBeNull()
    expect(row(container, "value").querySelector("[data-raw]")).toBeNull()
  })

  it("hides the marks from assistive technology", () => {
    const { container } = renderResults(<DimensionBars dimensions={varied.score.dimensions} />)
    expect(container.querySelector("[data-measure]")!.parentElement).toHaveAttribute("aria-hidden", "true")
  })
})

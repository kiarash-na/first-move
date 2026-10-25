import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { PROMISING_FROM, SOLID_FROM } from "@/lib/ai/plan-score/aggregate"
import { DIMENSIONS } from "@/lib/ai/plan-score/dimensions"
import { GATE_FAIL, GATE_PASS } from "@/lib/ai/plan-score/gates"
import { LEVEL_IDS, MAX_LEVEL } from "@/lib/ai/plan-score/scale"
import { HowWeScore } from "./how-we-score"
import { aiScoreCopy, renderResults } from "./test-utils/render"

const copy = aiScoreCopy("en")
const how = copy.results.how

async function open(lang: "en" | "de" = "en") {
  const view = renderResults(<HowWeScore />, { lang })
  await userEvent.click(screen.getByRole("button", { name: aiScoreCopy(lang).results.how.title }))
  return view
}

describe("HowWeScore (D-33)", () => {
  it("is collapsed by default", () => {
    renderResults(<HowWeScore />)
    expect(screen.getByRole("button", { name: how.title })).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText(how.lead)).not.toBeInTheDocument()
  })

  it("lists the five evidence levels and the turns", async () => {
    const { container } = await open()
    expect([...container.querySelectorAll("[data-level]")].map((item) => item.textContent)).toEqual(
      LEVEL_IDS.map((id, level) => `${level}${copy.labels.levels[id].name} · ${copy.labels.levels[id].description}`),
    )
    expect(container.querySelectorAll("[data-turn]")).toHaveLength(5)
  })

  it("takes the thresholds, caps and points per level from the engine", async () => {
    const { container } = await open()
    const checks = container.querySelector("[data-checks]")!
    expect(checks).toHaveTextContent(`at ${GATE_PASS} or above and fails at ${GATE_FAIL} or below`)
    expect(checks).toHaveTextContent("caps its dimension at level 2 or 3")
    expect(checks).toHaveTextContent(`caps at level 2 and keeps the label below ${copy.labels.scoreLevels.solid.name}`)
    expect(container.querySelector('[data-formula="expected"]')).toHaveTextContent(`E = Σ k · p(k), k = 0 … ${MAX_LEVEL}`)
    expect(container.querySelector('[data-formula="dimensionScore"]')).toHaveTextContent(`S = ${100 / MAX_LEVEL} · L`)
    expect(container.querySelector('[data-formula="band"]')).toHaveTextContent("Band = √(Σ (w · SD)²)")
    expect(container.querySelector('[data-label="early"]')).toHaveTextContent(`below ${PROMISING_FROM}`)
    expect(container.querySelector('[data-label="solid"]')).toHaveTextContent(`${SOLID_FROM} and above`)
    expect(screen.getByText(/Shown rounded to 5 points/)).toBeInTheDocument()
  })

  it("lists the weights of every dimension and their total", async () => {
    const { container } = await open()
    for (const dimension of DIMENSIONS) {
      expect(container.querySelector(`[data-weight="${dimension.id}"]`)).toHaveTextContent(`${copy.labels.dimensions[dimension.id].name}${Math.round(dimension.weight * 100)}%`)
    }
    expect(screen.getByText(/sum to 100%/)).toBeInTheDocument()
  })

  it("says how to read it", async () => {
    await open()
    for (const id of ["calibration", "opinion", "length"] as const) expect(screen.getByText(how.caveats[id])).toBeInTheDocument()
  })

  it("works in German", async () => {
    const { container } = await open("de")
    expect(container.querySelector("[data-checks]")).toHaveTextContent(`${GATE_PASS.toString().replace(".", ",")}`)
  })
})

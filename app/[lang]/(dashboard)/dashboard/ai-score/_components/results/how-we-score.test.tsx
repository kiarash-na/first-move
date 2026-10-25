import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { PROMISING_FROM, SOLID_FROM } from "@/lib/ai/plan-score/aggregate"
import { BRANCHES } from "@/lib/ai/plan-score/branches"
import { DIMENSIONS } from "@/lib/ai/plan-score/dimensions"
import { levelVariance } from "@/lib/ai/plan-score/distribution"
import { GATE_FAIL, GATE_PASS, OPTION_WEIGHT } from "@/lib/ai/plan-score/gates"
import { judgementOf } from "@/lib/ai/plan-score/judgements"
import { LEVEL_COUNT, LEVEL_IDS, MAX_LEVEL } from "@/lib/ai/plan-score/scale"
import { MIN_BAND, POINTS_PER_LEVEL, toPoints } from "./display"
import { HowWeScore } from "./how-we-score"
import { scored } from "./test-utils/fixtures"
import { aiScoreCopy, renderResults } from "./test-utils/render"

const copy = aiScoreCopy("en")
const how = copy.results.how

async function open(lang: "en" | "de" = "en") {
  const view = renderResults(<HowWeScore />, { lang })
  await userEvent.click(screen.getByRole("button", { name: aiScoreCopy(lang).results.how.title }))
  return view
}

describe("HowWeScore (D-33)", () => {
  it("is collapsed by default, under a heading of its own", () => {
    renderResults(<HowWeScore />)
    expect(screen.getByRole("button", { name: how.title })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("heading", { level: 3, name: how.title })).toContainElement(screen.getByRole("button", { name: how.title }))
    expect(screen.queryByText(how.lead)).not.toBeInTheDocument()
  })

  it("lists the five evidence levels and the turns", async () => {
    const { container } = await open()
    expect([...container.querySelectorAll("[data-level]")].map((item) => item.textContent)).toEqual(
      LEVEL_IDS.map((id, level) => `${level}${copy.labels.levels[id].name} · ${copy.labels.levels[id].description}`),
    )
    expect(container.querySelectorAll("[data-turn]")).toHaveLength(5)
    expect(screen.getByRole("heading", { level: 4, name: `${LEVEL_COUNT} evidence levels` })).toBeInTheDocument()
  })

  it("names the choice questions from the engine's branches", async () => {
    await open()
    const body = screen.getByText(/pick the follow-up check/)
    for (const branch of BRANCHES) expect(body).toHaveTextContent(`“${copy.labels.branches[branch.id as keyof typeof copy.labels.branches].name}”`)
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
    expect(container.querySelector('[data-formula="dimensionSpread"]')).toHaveTextContent(`SD = ${POINTS_PER_LEVEL} · √(Σ σ²) / n, in points`)
    expect(container.querySelector('[data-formula="choicePass"]')).toHaveTextContent(
      `v = ${OPTION_WEIGHT.pass} for a passing option, ${OPTION_WEIGHT.partial} for a partial one, ${OPTION_WEIGHT.fail} for a failing one`,
    )
    expect(container.querySelector('[data-label="early"]')).toHaveTextContent(`below ${PROMISING_FROM}`)
    expect(container.querySelector('[data-label="solid"]')).toHaveTextContent(`${SOLID_FROM} and above`)
    expect(screen.getByText(/Shown rounded to 5 points/)).toHaveTextContent(`in whole points and at least ${MIN_BAND},`)
  })

  it("states spread formulas that give the engine's numbers", async () => {
    // σ of a part = √(Σ p(k)·(k − E)²); SD of a dimension = points per level · √(Σ σ²) / n over its
    // counted parts (empty: σ 0; refused: not counted); Band = √(Σ (w · SD)²), all in points.
    const { score } = await scored()
    const sds = score.dimensions.map((dimension) => {
      const parts = score.judgements.filter((entry) => judgementOf(entry.id)?.dimension === dimension.id && entry.source !== "refused")
      const sigmas = parts.map((entry) => (entry.probabilities ? Math.sqrt(levelVariance(entry.probabilities)) : 0))
      const sd = parts.length === 0 ? 0 : (POINTS_PER_LEVEL * Math.sqrt(sigmas.reduce((sum, sigma) => sum + sigma ** 2, 0))) / parts.length
      expect(toPoints(dimension.sd), dimension.id).toBeCloseTo(sd, 1)
      return { weight: dimension.weight, sd }
    })
    expect(sds.some((entry) => entry.sd > 0)).toBe(true)
    expect(score.sd).toBeCloseTo(Math.sqrt(sds.reduce((sum, entry) => sum + (entry.weight * entry.sd) ** 2, 0)), 1)
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

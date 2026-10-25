// @vitest-environment node
import { describe, expect, it } from "vitest"
import de from "@/dictionaries/de/ai-score.json"
import en from "@/dictionaries/en/ai-score.json"
import { displayScore } from "@/lib/business-plan"
import { BLIND_SOURCE } from "./geblergasse-2017"
import { PROMISING_FROM, recordedRun, SHOWN_DECISIONS, SOLID_FROM, TURN_SIZES } from "./recorded-run"
import recorded from "./result.json"

describe("the recorded run the landing plays (PLAN-LANDING-POLISH-00)", () => {
  const run = recordedRun(en.labels)

  it("takes every number from the recording: the 27 levels in four turns, the score, the band, the dimensions", () => {
    expect(TURN_SIZES.reduce((sum, size) => sum + size, 0)).toBe(recorded.judgements.length)
    expect(run.judgements).toBe(recorded.judgements.length)
    expect(run.turns.map((turn) => turn.turn)).toEqual([1, 2, 3, 4])
    expect(run.turns.map((turn) => turn.levels.length)).toEqual([...TURN_SIZES])
    expect(run.turns.flatMap((turn) => turn.levels)).toEqual(recorded.judgements.map((judgement) => judgement.level))
    for (const level of run.turns.flatMap((turn) => turn.levels)) {
      expect(level).toBeGreaterThanOrEqual(0)
      expect(level).toBeLessThanOrEqual(4)
    }
    expect(run.score).toBe(recorded.score.shown)
    expect(run.band).toBe(recorded.score.band)
    expect({ score: run.score, band: run.band }).toEqual(displayScore(recorded.score.value, recorded.score.sd))
    expect(run.level).toBe(recorded.score.level)
    expect(run.capped).toBe(recorded.score.capped)
    expect(run.dimensions).toEqual(recorded.dimensions.map((dimension) => ({ id: dimension.id, score: dimension.score, capped: dimension.cap !== null })))
    expect(run.at).toBe(recorded.at)
    expect(run.planCreated).toBe(BLIND_SOURCE.created)
  })

  it("shows one real decision per turn, named from the ai-score dictionary", () => {
    const [source, boundary, dealBreaker, decisionGate] = run.turns.map((turn) => turn.decision)
    const branch = recorded.branches.find((entry) => entry.id === "source-type")!
    expect(source).toEqual({
      kind: "branch",
      name: en.labels.branches["source-type"].name,
      result: en.labels.branches["source-type"].options[branch.choice as keyof typeof en.labels.branches["source-type"]["options"]],
      outcome: null,
    })
    for (const [decision, id] of [[boundary, "boundary"], [dealBreaker, "deal-breaker"], [decisionGate, "decision-gate"]] as const) {
      const gate = recorded.gates.find((entry) => entry.id === id)!
      expect(decision).toEqual({
        kind: "gate",
        name: en.labels.gates[id].name,
        result: en.labels.outcomes[gate.outcome as keyof typeof en.labels.outcomes],
        outcome: gate.outcome,
      })
    }
    expect(SHOWN_DECISIONS.map((entry) => entry.turn)).toEqual([1, 2, 3, 4])
  })

  it("names the decisions in German with the German dictionary", () => {
    const german = recordedRun(de.labels)
    expect(german.turns[1].decision.name).toBe(de.labels.gates.boundary.name)
    expect(german.turns[1].decision.result).toBe(de.labels.outcomes[german.turns[1].decision.outcome!])
    expect(german.turns.map((turn) => turn.levels)).toEqual(run.turns.map((turn) => turn.levels))
  })

  it("keeps the band's thresholds and the score inside the band it is labelled with", () => {
    expect([PROMISING_FROM, SOLID_FROM]).toEqual([40, 70])
    if (run.level === "early") expect(run.score).toBeLessThan(PROMISING_FROM)
    if (run.level === "promising") expect(run.score).toBeGreaterThanOrEqual(PROMISING_FROM)
    if (run.level === "solid") expect(run.score).toBeGreaterThanOrEqual(SOLID_FROM)
    // A must-have failed: the label stays below Solid however many points the plan has.
    if (run.capped) expect(run.level).not.toBe("solid")
  })

  it("refuses a recording that does not fit the method", () => {
    expect(() => recordedRun(en.labels, { ...recorded, judgements: recorded.judgements.slice(1) })).toThrow(/27 judgements/)
    expect(() => recordedRun(en.labels, { ...recorded, score: { ...recorded.score, level: "great" } })).toThrow(/Unknown level/)
    expect(() => recordedRun(en.labels, { ...recorded, dimensions: [{ ...recorded.dimensions[0], id: "style" }] })).toThrow(/Unknown dimension/)
  })
})

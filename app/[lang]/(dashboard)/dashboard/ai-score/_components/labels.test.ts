import { describe, expect, it } from "vitest"
import de from "@/dictionaries/de/ai-score.json"
import en from "@/dictionaries/en/ai-score.json"
import { BRANCHES, FOLLOW_UP_GATE_IDS } from "@/lib/ai/plan-score/branches"
import { DIMENSION_IDS } from "@/lib/ai/plan-score/dimensions"
import { GATES } from "@/lib/ai/plan-score/gates"
import { JUDGEMENTS } from "@/lib/ai/plan-score/judgements"
import { LEVEL_IDS } from "@/lib/ai/plan-score/scale"
import { AI_FIELD_SOURCES, AI_GATE_OUTCOMES, AI_GATE_SOURCES, AI_SCORE_LEVELS } from "@/lib/project"

/** Every id the engine can store has a name in both languages, so the page never shows an id. */
describe.each([
  ["en", en],
  ["de", de],
] as const)("ai-score labels (%s)", (_lang, copy) => {
  const { labels } = copy

  it("names every score label, evidence level and dimension", () => {
    for (const id of AI_SCORE_LEVELS) expect(labels.scoreLevels[id].name, id).toBeTruthy()
    for (const id of LEVEL_IDS) expect(labels.levels[id].name, id).toBeTruthy()
    for (const id of DIMENSION_IDS) expect(labels.dimensions[id].name, id).toBeTruthy()
  })

  it("names every judgement, gate, follow-up gate and choice option", () => {
    for (const judgement of JUDGEMENTS) expect(labels.judgements[judgement.id as keyof typeof labels.judgements], judgement.id).toBeTruthy()
    for (const id of [...GATES.map((gate) => gate.id), ...FOLLOW_UP_GATE_IDS]) {
      expect(labels.gates[id as keyof typeof labels.gates]?.name, id).toBeTruthy()
    }
    for (const gate of GATES.filter((entry) => entry.options)) {
      const options = labels.gateOptions[gate.id as keyof typeof labels.gateOptions] as Record<string, string>
      for (const option of gate.options!) expect(options[option.id], `${gate.id}.${option.id}`).toBeTruthy()
    }
  })

  it("names every branch and option", () => {
    for (const branch of BRANCHES) {
      const entry = labels.branches[branch.id as keyof typeof labels.branches]
      expect(entry.name, branch.id).toBeTruthy()
      for (const option of branch.options) expect((entry.options as Record<string, string>)[option.id], `${branch.id}.${option.id}`).toBeTruthy()
    }
  })

  it("names every outcome, source and turn", () => {
    for (const id of AI_GATE_OUTCOMES) expect(labels.outcomes[id], id).toBeTruthy()
    for (const id of AI_FIELD_SOURCES) expect(labels.fieldSources[id], id).toBeTruthy()
    for (const id of AI_GATE_SOURCES) expect(labels.gateSources[id], id).toBeTruthy()
    for (const turn of ["0", "1", "2", "3", "4"] as const) expect(labels.turns[turn], turn).toBeTruthy()
  })
})

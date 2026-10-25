import type { Locale } from "@/lib/i18n/locales"
import { BLIND_SOURCE, KNOWN_OUTCOME } from "./geblergasse-2017"
import recorded from "./result.json"

/**
 * What slide 5 shows of the recorded blind test (`result.json`, written by
 * `lib/assistant/plan-score/blind-test.live.test.ts`): numbers and ids, plus the engine's first
 * suggested action in the slide's language. Labels come from the `ai-score` dictionary.
 */
export interface BlindSummary {
  /** ISO date of the run. */
  at: string
  decisionModel: string
  textModel: string
  engine: { judgements: number; turns: number; gates: number; branches: number; dimensions: number; levels: number }
  decisionsMs: number
  /** As the app shows it: rounded to 5, with its band. */
  score: number
  band: number
  level: "early" | "promising" | "solid"
  capped: boolean
  /** 0..1 after caps, in the engine's order. */
  dimensions: { id: string; score: number; capped: boolean }[]
  gates: { pass: number; fail: number; unclear: number }
  /** Failed gates whose cap keeps the plan below Solid (cap level 2). */
  mustHaveFailed: string[]
  branches: { id: string; choice: string }[]
  action: string | null
  input: { created: string; url: string }
  outcome: typeof KNOWN_OUTCOME
}

type Recorded = typeof recorded
type Report = { actions: string[] }

function isLevel(value: string): value is BlindSummary["level"] {
  return value === "early" || value === "promising" || value === "solid"
}

export function blindSummary(lang: Locale, data: Recorded = recorded): BlindSummary {
  const reports = data.report as Partial<Record<Locale, Report>>
  const level = data.score.level
  if (!isLevel(level)) throw new Error(`Unknown level ${level}`)
  const count = (outcome: string) => data.gates.filter((gate) => gate.outcome === outcome).length
  return {
    at: data.at,
    decisionModel: data.models.decision,
    textModel: data.models.text,
    engine: data.engine,
    decisionsMs: data.timing.decisionsMs,
    score: data.score.shown,
    band: data.score.band,
    level,
    capped: data.score.capped,
    dimensions: data.dimensions.map((dimension) => ({ id: dimension.id, score: dimension.score, capped: dimension.cap !== null })),
    gates: { pass: count("pass"), fail: count("fail"), unclear: count("unclear") },
    mustHaveFailed: data.gates.filter((gate) => gate.outcome === "fail" && gate.cap === 2).map((gate) => gate.id),
    branches: data.branches.map((branch) => ({ id: branch.id, choice: branch.choice })),
    action: reports[lang]?.actions[0] ?? reports.en?.actions[0] ?? null,
    input: { created: BLIND_SOURCE.created, url: BLIND_SOURCE.url },
    outcome: KNOWN_OUTCOME,
  }
}

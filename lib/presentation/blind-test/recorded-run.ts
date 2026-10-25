import type { Dictionary } from "@/lib/i18n/dictionaries"
import { BLIND_SOURCE } from "./geblergasse-2017"
import recorded from "./result.json"

/**
 * The recorded blind test (`result.json`, the run slide 5 replays) as the landing's AI Plan
 * Score chapter plays it (PLAN-LANDING-POLISH-00 step f): the 27 judgements in their four turns
 * with the evidence level Jev gave each one, one real decision per turn, the score as the app
 * shows it and the seven dimensions after their caps. Nothing here is typed in: every number
 * comes from the recording.
 *
 * The landing may not import `lib/ai` (PLAN-AGENT-00 boundary), so the engine's turn sizes,
 * thresholds and the turn of each shown decision are mirrored here and pinned against the
 * engine by `lib/ai/plan-score/method.test.ts`.
 */

/** Judgements per turn, in the engine's order (`JUDGEMENTS`): 8 + 8 + 5 + 6 = 27. */
export const TURN_SIZES = [8, 8, 5, 6] as const

/** The engine's labels (`aggregate.ts`): Early < 40 ≤ Promising < 70 ≤ Solid. */
export const PROMISING_FROM = 40
export const SOLID_FROM = 70

export type RecordedTurnNumber = 1 | 2 | 3 | 4
export type RecordedOutcome = "pass" | "unclear" | "fail"
export type RecordedLevel = "early" | "promising" | "solid"
export type RecordedDimensionId = "value" | "technology" | "economics" | "governance" | "participation" | "evidence" | "path"

const DIMENSION_IDS: readonly RecordedDimensionId[] = ["value", "technology", "economics", "governance", "participation", "evidence", "path"]

/** The one decision of the recording shown per turn: a branch or gate the engine asks in that turn. */
export const SHOWN_DECISIONS: readonly { turn: RecordedTurnNumber; kind: "branch" | "gate"; id: string }[] = [
  { turn: 1, kind: "branch", id: "source-type" },
  { turn: 2, kind: "gate", id: "boundary" },
  { turn: 3, kind: "gate", id: "deal-breaker" },
  { turn: 4, kind: "gate", id: "decision-gate" },
]

export interface RecordedDecision {
  kind: "branch" | "gate"
  /** The question's name in the page's language, e.g. "System boundary". */
  name: string
  /** What Jev decided, in the page's language: a branch's choice or a gate's outcome. */
  result: string
  /** A gate's outcome; null for a branch. */
  outcome: RecordedOutcome | null
}

export interface RecordedTurn {
  turn: RecordedTurnNumber
  /** The evidence level (0..4, as Jev's expectation) of each judgement of the turn. */
  levels: readonly number[]
  decision: RecordedDecision
}

export interface RecordedRun {
  /** ISO time of the run. */
  at: string
  /** ISO date the scored plan was written. */
  planCreated: string
  judgements: number
  turns: readonly RecordedTurn[]
  /** As the app shows it: rounded to 5, with its band (one standard deviation). */
  score: number
  band: number
  level: RecordedLevel
  /** A must-have gate failed, so the plan stays below Solid. */
  capped: boolean
  /** 0..1 after caps, in the engine's order. */
  dimensions: readonly { id: RecordedDimensionId; score: number; capped: boolean }[]
}

/** The names the decisions need, from the `ai-score` dictionary. */
export type RecordedRunLabels = Pick<Dictionary<"ai-score">["labels"], "gates" | "branches" | "outcomes">

type Recorded = typeof recorded
type Named = Record<string, { name: string } | undefined>
type Branches = Record<string, { name: string; options: Record<string, string | undefined> } | undefined>

function isLevel(value: string): value is RecordedLevel {
  return value === "early" || value === "promising" || value === "solid"
}

function isOutcome(value: string): value is RecordedOutcome {
  return value === "pass" || value === "unclear" || value === "fail"
}

function isDimension(value: string): value is RecordedDimensionId {
  return (DIMENSION_IDS as readonly string[]).includes(value)
}

function decisionOf(entry: (typeof SHOWN_DECISIONS)[number], labels: RecordedRunLabels, data: Recorded): RecordedDecision {
  if (entry.kind === "branch") {
    const branch = data.branches.find((candidate) => candidate.id === entry.id)
    const label = (labels.branches as Branches)[entry.id]
    if (!branch || !label) throw new Error(`Unknown branch ${entry.id}`)
    return { kind: "branch", name: label.name, result: label.options[branch.choice] ?? branch.choice, outcome: null }
  }
  const gate = data.gates.find((candidate) => candidate.id === entry.id)
  const label = (labels.gates as Named)[entry.id]
  if (!gate || !label) throw new Error(`Unknown gate ${entry.id}`)
  if (!isOutcome(gate.outcome)) throw new Error(`Unknown outcome ${gate.outcome}`)
  return { kind: "gate", name: label.name, result: labels.outcomes[gate.outcome], outcome: gate.outcome }
}

/** The recorded run, with the decisions named in the dictionary's language. */
export function recordedRun(labels: RecordedRunLabels, data: Recorded = recorded): RecordedRun {
  const total = TURN_SIZES.reduce((sum, size) => sum + size, 0)
  if (data.judgements.length !== total) throw new Error(`Expected ${total} judgements, found ${data.judgements.length}`)
  if (!isLevel(data.score.level)) throw new Error(`Unknown level ${data.score.level}`)

  let offset = 0
  const turns = SHOWN_DECISIONS.map((entry, index) => {
    const levels = data.judgements.slice(offset, offset + TURN_SIZES[index]).map((judgement) => judgement.level)
    offset += TURN_SIZES[index]
    return { turn: entry.turn, levels, decision: decisionOf(entry, labels, data) }
  })

  return {
    at: data.at,
    planCreated: BLIND_SOURCE.created,
    judgements: total,
    turns,
    score: data.score.shown,
    band: data.score.band,
    level: data.score.level,
    capped: data.score.capped,
    dimensions: data.dimensions.map((dimension) => {
      if (!isDimension(dimension.id)) throw new Error(`Unknown dimension ${dimension.id}`)
      return { id: dimension.id, score: dimension.score, capped: dimension.cap !== null }
    }),
  }
}

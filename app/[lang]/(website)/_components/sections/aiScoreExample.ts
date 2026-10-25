/**
 * The illustrative run the AI Plan Score chapter plays (PLAN-LANDING-FIX-00 step 9). Fixed data,
 * labelled "Example run" on the page: the landing never imports `lib/ai` (PLAN-AGENT-00 boundary),
 * so the shape of the method is mirrored here and pinned by `aiScoreExample.test.ts`:
 * four turns over the 27 judgements (8, 8, 5, 6), each with the dimension it belongs to in
 * `lib/ai/plan-score/judgements.ts`, one decision per turn, and the aggregation and labels of
 * `lib/ai/plan-score/aggregate.ts`: a dimension scores 25 × the mean level of its judgements, the
 * score is the weighted sum of the dimensions (Early < 40 ≤ Promising < 70 ≤ Solid).
 */
import { displayScore } from '@/lib/business-plan/ai-score-status'

export const PROMISING_FROM = 40
export const SOLID_FROM = 70
/** The top of the evidence scale (Missing 0 … Evidenced 4). */
const MAX_LEVEL = 4

export type ExampleLevel = 'early' | 'promising' | 'solid'
export type ExampleOutcome = 'pass' | 'unclear' | 'fail'
export type ExampleTurn = 1 | 2 | 3 | 4
export type ExampleDimension = 'value' | 'technology' | 'economics' | 'governance' | 'participation' | 'evidence' | 'path'

export interface ExampleTurnRun {
  turn: ExampleTurn
  /** Expected evidence level, 0..4, of each judgement of the turn. */
  levels: readonly number[]
  /** The dimension of each judgement, in the engine's order (`JUDGEMENTS`). */
  dimensions: readonly ExampleDimension[]
  decision: { kind: 'branch' } | { kind: 'gate'; outcome: ExampleOutcome }
}

/** The same rule as the engine's `labelOf`: a must-have cap keeps a plan below Solid. */
export function labelOf(score: number, mustHaveCap = false): ExampleLevel {
  if (score < PROMISING_FROM) return 'early'
  return score >= SOLID_FROM && !mustHaveCap ? 'solid' : 'promising'
}

export const EXAMPLE_TURNS: readonly ExampleTurnRun[] = [
  {
    turn: 1,
    levels: [3, 2, 3, 2, 3, 1, 2, 3],
    dimensions: ['technology', 'participation', 'participation', 'value', 'value', 'value', 'value', 'technology'],
    decision: { kind: 'branch' },
  },
  {
    turn: 2,
    levels: [2, 2, 2, 3, 3, 3, 3, 2],
    dimensions: ['value', 'technology', 'governance', 'participation', 'economics', 'economics', 'governance', 'governance'],
    decision: { kind: 'gate', outcome: 'pass' },
  },
  {
    turn: 3,
    levels: [3, 2, 2, 3, 2],
    dimensions: ['participation', 'economics', 'economics', 'evidence', 'evidence'],
    decision: { kind: 'gate', outcome: 'unclear' },
  },
  {
    turn: 4,
    levels: [2, 3, 2, 1, 3, 2],
    dimensions: ['evidence', 'path', 'path', 'path', 'path', 'path'],
    decision: { kind: 'gate', outcome: 'pass' },
  },
]

/** The engine's weights (D-75), in its order. */
const WEIGHTS: readonly { id: ExampleDimension; weight: number }[] = [
  { id: 'value', weight: 0.15 },
  { id: 'technology', weight: 0.1 },
  { id: 'economics', weight: 0.2 },
  { id: 'governance', weight: 0.2 },
  { id: 'participation', weight: 0.15 },
  { id: 'evidence', weight: 0.1 },
  { id: 'path', weight: 0.1 },
]

const CELLS = EXAMPLE_TURNS.flatMap((turn) => turn.levels.map((level, index) => ({ level, dimension: turn.dimensions[index] })))

/**
 * Dimension scores 0..100, derived from the cells as the engine does: 25 × the mean level of the
 * dimension's judgements, kept to four decimals of the 0..1 fraction. No gate failed, so no cap.
 */
export const EXAMPLE_DIMENSIONS: readonly { id: ExampleDimension; weight: number; score: number }[] = WEIGHTS.map(({ id, weight }) => {
  const levels = CELLS.filter((cell) => cell.dimension === id).map((cell) => cell.level)
  const mean = levels.reduce((sum, level) => sum + level, 0) / levels.length
  return { id, weight, score: Math.round((mean / MAX_LEVEL) * 10_000) / 100 }
})

/** The weighted mean of the dimensions (0..100, one decimal) and the example's spread. */
export const EXAMPLE_RAW_SCORE = Math.round(EXAMPLE_DIMENSIONS.reduce((sum, dimension) => sum + dimension.weight * dimension.score, 0) * 10) / 10
export const EXAMPLE_SD = 6.2

/** Shown exactly as the app shows it: rounded to 5 points, the band to whole points. */
export const EXAMPLE_SCORE = displayScore(EXAMPLE_RAW_SCORE, EXAMPLE_SD)
export const EXAMPLE_LEVEL: ExampleLevel = labelOf(EXAMPLE_RAW_SCORE)

/** How many judgements (items) the example scores: the engine's 27, over the plan's 42 fields. */
export const EXAMPLE_JUDGEMENTS = EXAMPLE_TURNS.reduce((sum, turn) => sum + turn.levels.length, 0)

/**
 * The illustrative run the AI Plan Score chapter plays (PLAN-LANDING-FIX-00 step 9). Fixed data,
 * labelled "Example run" on the page: the landing never imports `lib/ai` (PLAN-AGENT-00 boundary),
 * so the shape of the method is mirrored here and pinned by `aiScoreExample.test.ts`:
 * four turns over the 27 judgements (8, 8, 5, 6), one decision per turn, seven dimensions and the
 * labels of `lib/ai/plan-score/aggregate.ts` (Early < 40 ≤ Promising < 70 ≤ Solid).
 */
import { displayScore } from '@/lib/business-plan/ai-score-status'

export const PROMISING_FROM = 40
export const SOLID_FROM = 70

export type ExampleLevel = 'early' | 'promising' | 'solid'
export type ExampleOutcome = 'pass' | 'unclear' | 'fail'
export type ExampleTurn = 1 | 2 | 3 | 4
export type ExampleDimension = 'value' | 'technology' | 'economics' | 'governance' | 'participation' | 'evidence' | 'path'

export interface ExampleTurnRun {
  turn: ExampleTurn
  /** Expected evidence level, 0..4, of each judgement of the turn. */
  levels: readonly number[]
  decision: { kind: 'branch' } | { kind: 'gate'; outcome: ExampleOutcome }
}

/** The same rule as the engine's `labelOf`: a must-have cap keeps a plan below Solid. */
export function labelOf(score: number, mustHaveCap = false): ExampleLevel {
  if (score < PROMISING_FROM) return 'early'
  return score >= SOLID_FROM && !mustHaveCap ? 'solid' : 'promising'
}

export const EXAMPLE_TURNS: readonly ExampleTurnRun[] = [
  { turn: 1, levels: [3, 2, 3, 2, 3, 1, 2, 3], decision: { kind: 'branch' } },
  { turn: 2, levels: [2, 2, 2, 3, 3, 2, 3, 2], decision: { kind: 'gate', outcome: 'pass' } },
  { turn: 3, levels: [3, 2, 1, 2, 2], decision: { kind: 'gate', outcome: 'unclear' } },
  { turn: 4, levels: [2, 3, 2, 1, 3, 2], decision: { kind: 'gate', outcome: 'pass' } },
]

/** Dimension scores 0..100 of the example; the weights are the engine's (D-75). */
export const EXAMPLE_DIMENSIONS: readonly { id: ExampleDimension; weight: number; score: number }[] = [
  { id: 'value', weight: 0.15, score: 68 },
  { id: 'technology', weight: 0.1, score: 72 },
  { id: 'economics', weight: 0.2, score: 58 },
  { id: 'governance', weight: 0.2, score: 62 },
  { id: 'participation', weight: 0.15, score: 58 },
  { id: 'evidence', weight: 0.1, score: 50 },
  { id: 'path', weight: 0.1, score: 68 },
]

/** The weighted mean of the dimensions (0..100, one decimal) and the example's spread. */
export const EXAMPLE_RAW_SCORE = Math.round(EXAMPLE_DIMENSIONS.reduce((sum, dimension) => sum + dimension.weight * dimension.score, 0) * 10) / 10
export const EXAMPLE_SD = 6.2

/** Shown exactly as the app shows it: rounded to 5 points, the band to whole points. */
export const EXAMPLE_SCORE = displayScore(EXAMPLE_RAW_SCORE, EXAMPLE_SD)
export const EXAMPLE_LEVEL: ExampleLevel = labelOf(EXAMPLE_RAW_SCORE)

/** How many judgements the example scores: the 27 fields of the plan. */
export const EXAMPLE_JUDGEMENTS = EXAMPLE_TURNS.reduce((sum, turn) => sum + turn.levels.length, 0)

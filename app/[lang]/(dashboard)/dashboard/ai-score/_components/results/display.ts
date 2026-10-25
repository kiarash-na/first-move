import { LEVEL_IDS, MAX_LEVEL, type LevelId } from "@/lib/ai/plan-score/scale"
import { displayScore } from "@/lib/business-plan"

/**
 * Display helpers of the saved AI Plan Score (PLAN-AI-SCORE-00 step 6). Every number comes from
 * the engine's constants, never retyped (D-33): the 0..100 scale has `MAX_LEVEL` levels, so a
 * dimension score is `POINTS_PER_LEVEL` × its level.
 */
export const POINTS_PER_LEVEL = 100 / MAX_LEVEL

/** The level an expected level is named after: the nearest one. */
export function nearestLevel(expected: number): LevelId {
  return LEVEL_IDS[Math.min(MAX_LEVEL, Math.max(0, Math.round(expected)))]
}

/**
 * The step `displayScore` rounds the score to, read from the core function instead of retyped:
 * the smallest positive whole score it keeps unchanged.
 */
export const ROUNDING_STEP: number = (() => {
  for (let points = 1; points <= 100; points++) if (displayScore(points, 0).score === points) return points
  return 1
})()

/** A position on the 0..100 scale, kept inside it. */
export const clampPoints = (points: number) => Math.min(100, Math.max(0, points))

/** A 0..1 unit of the engine (dimension score, raw, SD) as points on the 0..100 scale. */
export const toPoints = (unit: number) => unit * 100

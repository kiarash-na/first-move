import { LEVEL_COUNT } from "./scale"

/**
 * Reading Jev's answers (PLAN-AI-SCORE-01 § Aggregation). A `score` answer carries a probability
 * per level; its mean is the expected level and its spread says how sure the model is. Pure.
 */

/** Probabilities for levels 0..4 from Jev's map (`"0"`..`"4"`), renormalised; null without a usable map. */
export function levelProbabilities(map: Record<string, number> | undefined): number[] | null {
  if (!map) return null
  const values = Array.from({ length: LEVEL_COUNT }, (_, level) => Math.max(0, Number(map[String(level)] ?? 0)))
  const total = values.reduce((sum, value) => sum + value, 0)
  if (!Number.isFinite(total) || total <= 0) return null
  return values.map((value) => value / total)
}

/** The point mass on one level, for answers that come without a distribution. */
export function pointMass(level: number): number[] {
  const rounded = Math.min(LEVEL_COUNT - 1, Math.max(0, Math.round(level)))
  return Array.from({ length: LEVEL_COUNT }, (_, index) => (index === rounded ? 1 : 0))
}

export function expectedLevel(probabilities: readonly number[]): number {
  return probabilities.reduce((sum, p, level) => sum + p * level, 0)
}

export function levelVariance(probabilities: readonly number[]): number {
  const mean = expectedLevel(probabilities)
  return probabilities.reduce((sum, p, level) => sum + p * (level - mean) ** 2, 0)
}

/** 1 − normalised entropy: 1 when one level holds everything, 0 when all are equally likely. */
export function concentration(probabilities: readonly number[]): number {
  const n = probabilities.length
  if (n < 2) return 1
  const entropy = probabilities.reduce((sum, p) => (p > 0 ? sum - p * Math.log(p) : sum), 0)
  return Math.max(0, Math.min(1, 1 - entropy / Math.log(n)))
}

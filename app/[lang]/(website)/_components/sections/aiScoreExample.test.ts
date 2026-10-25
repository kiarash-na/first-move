import { describe, expect, it } from 'vitest'
import {
  EXAMPLE_DIMENSIONS,
  EXAMPLE_JUDGEMENTS,
  EXAMPLE_LEVEL,
  EXAMPLE_RAW_SCORE,
  EXAMPLE_SCORE,
  EXAMPLE_TURNS,
  labelOf,
  PROMISING_FROM,
  SOLID_FROM,
} from './aiScoreExample'

describe('the AI Plan Score example run', () => {
  it('mirrors the engine: 27 judgements in four turns (8, 8, 5, 6), seven weighted dimensions', () => {
    expect(EXAMPLE_TURNS.map((turn) => turn.levels.length)).toEqual([8, 8, 5, 6])
    expect(EXAMPLE_JUDGEMENTS).toBe(27)
    expect(EXAMPLE_TURNS.map((turn) => turn.turn)).toEqual([1, 2, 3, 4])
    expect(EXAMPLE_DIMENSIONS).toHaveLength(7)
    expect(EXAMPLE_DIMENSIONS.reduce((sum, dimension) => sum + dimension.weight, 0)).toBeCloseTo(1)
    for (const turn of EXAMPLE_TURNS) for (const level of turn.levels) expect(level).toBeGreaterThanOrEqual(0)
    for (const turn of EXAMPLE_TURNS) for (const level of turn.levels) expect(level).toBeLessThanOrEqual(4)
  })

  it('labels like lib/ai/plan-score/aggregate.ts: Early < 40 ≤ Promising < 70 ≤ Solid, a must-have cap stays below Solid', () => {
    expect([PROMISING_FROM, SOLID_FROM]).toEqual([40, 70])
    expect(labelOf(39.9)).toBe('early')
    expect(labelOf(40)).toBe('promising')
    expect(labelOf(69.9)).toBe('promising')
    expect(labelOf(70)).toBe('solid')
    expect(labelOf(85, true)).toBe('promising')
  })

  it('is a Promising plan, shown rounded to 5 points like the app', () => {
    expect(EXAMPLE_RAW_SCORE).toBeGreaterThanOrEqual(PROMISING_FROM)
    expect(EXAMPLE_RAW_SCORE).toBeLessThan(SOLID_FROM)
    expect(EXAMPLE_LEVEL).toBe('promising')
    expect(EXAMPLE_SCORE).toEqual({ score: 60, band: 6 })
    expect(EXAMPLE_SCORE.score % 5).toBe(0)
  })
})

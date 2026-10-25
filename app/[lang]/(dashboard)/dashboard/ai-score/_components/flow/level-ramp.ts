import { LEVEL_COUNT, LEVEL_IDS, MAX_LEVEL, type LevelId } from "@/lib/ai/plan-score/scale"

/**
 * The sequential orange ramp of the evidence levels 0..4 (dataviz: ordinal, one hue, light to
 * dark in light mode and dark to bright in dark mode). Mixed from `--accent-hot` and the card
 * surface only (D-17, no new hue); the top light step darkens the orange with Ink 950. Validated
 * with the dataviz ordinal checks (monotone lightness, adjacent ΔL ≥ 0.06, light end ≥ 2:1 on the
 * card) for both themes on 2026-10-25:
 * light #dba78f #d18d6e #c5734d #b85826 #984213 on #f7fbfb; dark #6c3b24 #914824 #b95520 #e26215
 * #ff7300 on the dark card. Put `LEVEL_RAMP_CLASS` on any element whose children use `levelFill`.
 */
export const LEVEL_RAMP_CLASS = [
  "[--level-0:color-mix(in_oklab,var(--accent-hot)_48%,var(--card))]",
  "[--level-1:color-mix(in_oklab,var(--accent-hot)_63%,var(--card))]",
  "[--level-2:color-mix(in_oklab,var(--accent-hot)_78%,var(--card))]",
  "[--level-3:color-mix(in_oklab,var(--accent-hot)_93%,var(--card))]",
  "[--level-4:color-mix(in_oklab,var(--ink-950)_13%,var(--accent-hot))]",
  "dark:[--level-0:color-mix(in_oklab,var(--accent-hot)_40%,var(--card))]",
  "dark:[--level-1:color-mix(in_oklab,var(--accent-hot)_54%,var(--card))]",
  "dark:[--level-2:color-mix(in_oklab,var(--accent-hot)_68%,var(--card))]",
  "dark:[--level-3:color-mix(in_oklab,var(--accent-hot)_82%,var(--card))]",
  "dark:[--level-4:var(--accent-hot)]",
].join(" ")

/** The step of an expected level: rounded to the nearest whole level. */
export function levelStep(level: number): number {
  return Math.min(MAX_LEVEL, Math.max(0, Math.round(level)))
}

/** The fill of a level step (or of an expected level, rounded). */
export function levelFill(level: number): string {
  return `var(--level-${levelStep(level)})`
}

/** The name id of an expected level: `specific` for 2.4. */
export function levelId(level: number): LevelId {
  return LEVEL_IDS[levelStep(level)]
}

/** Every step, for the legend. */
export const LEVEL_STEPS: readonly number[] = Array.from({ length: LEVEL_COUNT }, (_, index) => index)

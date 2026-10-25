/**
 * The evidence scale every judgement is scored on (PLAN-AI-SCORE-01 § Scale). Five ordered levels,
 * so Jev's `score` answer is a probability for each and the expected level a number from 0 to 4.
 * The descriptors describe quality, never length (rubric design, SRC-BROOKHART-2018; verbosity
 * bias, SRC-ZHENG-2023); level 1 follows ARENA's "little or no evidence of verifiable technical or
 * financial data" and level 4 the evidence ladder of SRC-GHNF-2026 and SRC-BLAND-2020. The UI
 * shows its own copy (`ai-score.json`).
 */
export const LEVEL_COUNT = 5
export const MAX_LEVEL = LEVEL_COUNT - 1

export const LEVEL_IDS = ["missing", "vague", "specific", "quantified", "evidenced"] as const
export type LevelId = (typeof LEVEL_IDS)[number]

export const LEVEL_CRITERIA: readonly string[] = [
  "Missing or irrelevant: empty, a placeholder such as 'tbd', or not about this item or this site.",
  "Vague: a general claim that could fit any project, such as 'customers save money' or 'the municipality supports us'. No named actor, place or number.",
  "Specific: names the actors, buildings, sources or mechanisms of this site, but gives no numbers or no basis for them.",
  "Specific and quantified: the key quantities with units and a stated basis or assumption, such as '14 of 20 buildings, 70 %' or '500 € per metre of trench'. A figure quoted from the tool's Quick Check counts as a stated basis here, not as evidence.",
  "Quantified and evidenced or tested: the numbers are backed by named data or commitments (metered consumption, a letter of intent, an authority pre-check, a quote, a survey), or they are tested (a sensitivity or break-even value, a case in which the plan fails), and the text says what happens if a number is wrong. Claiming 'validated' without naming the evidence is not enough.",
]

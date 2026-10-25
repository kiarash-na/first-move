import { z } from "zod"

/**
 * The last AI Plan Score of a project (schema v3, D-73, PLAN-AI-SCORE-00). System-managed like
 * `provenance`: never a registry field, never patchable, written only by the store's
 * `setAiScore`. Core code only reads it; the AI layer (`lib/ai/plan-score`) produces it. Ids are
 * plain strings here, because core never imports the AI layer's lists.
 */
export const AI_SCORE_LIMITS = {
  judgements: 60,
  judgementFields: 8,
  gates: 40,
  branches: 12,
  dimensions: 12,
  options: 12,
  model: 120,
  headline: 160,
  text: 900,
  item: 320,
  items: 5,
  keys: 8,
  suggestions: 3,
} as const

/** Three broad labels, to avoid false precision (PLAN-AI-SCORE-01 § Aggregation). */
export const AI_SCORE_LEVELS = ["early", "promising", "solid"] as const
export const AI_GATE_OUTCOMES = ["pass", "unclear", "fail", "skipped"] as const
/** How a judgement got its level: `empty` = no text, scored 0 without AI; `refused` = the model gave no answer. */
export const AI_FIELD_SOURCES = ["empty", "model", "refused"] as const

const id = z.string().regex(/^[A-Za-z0-9._-]{1,80}$/)
const unit = z.number().min(0).max(1)
const model = z.string().min(1).max(AI_SCORE_LIMITS.model)
const text = (max: number) => z.string().min(1).max(max)
const list = <T extends z.ZodType>(item: T, max: number) => z.array(item).max(max)

/** One judgement on the 5-level evidence scale (0 missing … 4 evidenced): one field, or several merged. */
export const aiJudgementSchema = z.strictObject({
  id,
  /** The registry ids the judgement reads. */
  fields: list(id, AI_SCORE_LIMITS.judgementFields).min(1),
  /** Short hash of those fields' values when they were scored, to tell when they changed. */
  hash: z.string().regex(/^[0-9a-f]{8}$/),
  source: z.enum(AI_FIELD_SOURCES),
  /** Expected level 0..4 (probability-weighted mean); null when refused. */
  level: z.number().min(0).max(4).nullable(),
  /** P(level 0..4); null for empty or refused fields. */
  probabilities: z.array(unit).length(5).nullable(),
})

/** How a gate was decided: by a rule before any AI, by the model, or not (the model declined). */
export const AI_GATE_SOURCES = ["rule", "model", "refused"] as const

export const aiGateSchema = z.strictObject({
  id,
  source: z.enum(AI_GATE_SOURCES),
  /** P(the gate passes); null when decided by a rule, skipped or refused. */
  probability: unit.nullable(),
  outcome: z.enum(AI_GATE_OUTCOMES),
  /** The level (2 or 3) this failed gate capped its dimension at, or null. */
  cap: z.number().int().min(2).max(3).nullable(),
})

export const aiBranchSchema = z.strictObject({
  id,
  choice: id,
  probabilities: z.record(id, unit).refine((map) => Object.keys(map).length <= AI_SCORE_LIMITS.options),
})

export const aiDimensionSchema = z.strictObject({
  id,
  weight: unit,
  /** 0..1, after a cap. */
  score: unit,
  /** 0..1, the mean of the judgements before a cap. */
  raw: unit,
  /** One standard deviation of the score, 0..1. */
  sd: unit,
  /** The level (0..4) a failed gate capped the dimension at, or null. */
  cap: z.number().int().min(0).max(4).nullable(),
})

const pointer = z.strictObject({
  text: text(AI_SCORE_LIMITS.item),
  keys: list(id, AI_SCORE_LIMITS.keys),
})

/** The short report the chosen text model writes from the numbers (AI-generated). */
export const aiReportSchema = z.strictObject({
  model,
  lang: z.enum(["en", "de"]),
  headline: text(AI_SCORE_LIMITS.headline),
  summary: text(AI_SCORE_LIMITS.text),
  strengths: list(pointer, AI_SCORE_LIMITS.items),
  gaps: list(pointer, AI_SCORE_LIMITS.items),
  actions: list(text(AI_SCORE_LIMITS.item), AI_SCORE_LIMITS.items),
})

/** On-demand improvement suggestions for weak fields and failed gates (D-77, AI-generated). */
export const aiSuggestionsSchema = z.strictObject({
  model,
  lang: z.enum(["en", "de"]),
  at: z.iso.datetime(),
  items: list(
    z.strictObject({ key: id, texts: list(text(AI_SCORE_LIMITS.item), AI_SCORE_LIMITS.suggestions).min(1) }),
    AI_SCORE_LIMITS.judgements + AI_SCORE_LIMITS.gates,
  ),
})

export const aiScoreSchema = z
  .strictObject({
    /** Version of the scoring method (rubric, gates, weights), not of the schema. */
    method: z.string().regex(/^\d+\.\d+\.\d+$/),
    at: z.iso.datetime(),
    decisionModel: model,
    /** 0..100 */
    score: z.number().min(0).max(100),
    /** One standard deviation in points. */
    sd: z.number().min(0).max(100),
    level: z.enum(AI_SCORE_LEVELS),
    /** A must-have gate failed (a cap at level 2), which keeps the label below Solid. */
    capped: z.boolean(),
    dimensions: list(aiDimensionSchema, AI_SCORE_LIMITS.dimensions),
    judgements: list(aiJudgementSchema, AI_SCORE_LIMITS.judgements),
    gates: list(aiGateSchema, AI_SCORE_LIMITS.gates),
    branches: list(aiBranchSchema, AI_SCORE_LIMITS.branches),
    /** The Quick Check figures the run used as context, or null when it had none. */
    quickCheck: z
      .strictObject({
        level: z.enum(["promising", "further_analysis", "not_promising"]),
        heatDensityMwhPerM: z.number().min(0),
        economicRatio: z.number().min(0).nullable(),
      })
      .nullable(),
    usage: z.strictObject({ decisionTokens: z.number().int().min(0), textTokens: z.number().int().min(0) }),
    report: aiReportSchema.nullable(),
    suggestions: aiSuggestionsSchema.nullable(),
  })
  .meta({ description: "System-managed: the last AI Plan Score (AI-generated). Not patchable." })

export type AiScore = z.infer<typeof aiScoreSchema>
export type AiJudgement = z.infer<typeof aiJudgementSchema>
export type AiGate = z.infer<typeof aiGateSchema>
export type AiBranch = z.infer<typeof aiBranchSchema>
export type AiDimension = z.infer<typeof aiDimensionSchema>
export type AiReport = z.infer<typeof aiReportSchema>
export type AiSuggestions = z.infer<typeof aiSuggestionsSchema>
export type AiScoreLevel = (typeof AI_SCORE_LEVELS)[number]
export type AiGateOutcome = (typeof AI_GATE_OUTCOMES)[number]

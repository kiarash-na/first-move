import { GATES } from "@/lib/ai/plan-score/gates"
import { JUDGEMENTS, TURNS } from "@/lib/ai/plan-score/judgements"
import { turnQuestions } from "@/lib/ai/plan-score/questions"
import { quickCheckSignal } from "@/lib/ai/plan-score/quick-check-signal"
import { REPORT_MAX_OUTPUT_TOKENS } from "@/lib/ai/plan-score/report"
import { buildState, estimateTokens, isJudgementFilled } from "@/lib/ai/plan-score/state"
import { planExcerpts, TEXT_RULES } from "@/lib/ai/plan-score/text-input"
import type { TextModel } from "@/lib/assistant/gateway/models"
import type { Project } from "@/lib/project"

/**
 * A rough cost of one run (an order of magnitude, shown before the first run): Jev reads the
 * plan state plus the turn's questions four times; the text model reads the scores and plan
 * excerpts once and writes the report. Same token estimate as the engine (three characters a
 * token). No network; nothing here is sent.
 */

/** Jev's input price in USD per million tokens (Gateway catalogue, 2026-10-24, PLAN-AI-SCORE-00). */
export const JEV_INPUT_PRICE = 0.042
/** The scores and gates the report prompt lists, about one line per judgement and gate. */
const SCORE_FACTS_TOKENS = (JUDGEMENTS.length + GATES.length) * 40
/** The report's output cap, reasoning included (`REPORT_MAX_OUTPUT_TOKENS` of the engine): the most it can cost. */
export const REPORT_OUTPUT_TOKENS = REPORT_MAX_OUTPUT_TOKENS

export interface CostEstimate {
  /** Plan state plus questions, summed over the four turns. */
  decisionTokens: number
  decisionUsd: number
  textInputTokens: number
  textOutputTokens: number
  /** Null when the model's prices are not known (a custom id). */
  textUsd: number | null
  totalUsd: number | null
}

export function estimateCost(project: Project, model: Pick<TextModel, "price"> | null): CostEstimate {
  const signal = quickCheckSignal(project)
  const filled = new Set(JUDGEMENTS.filter((judgement) => isJudgementFilled(project, judgement)).map((judgement) => judgement.id))
  const state = estimateTokens(buildState(project, signal, {}))
  const decisionTokens = TURNS.reduce((sum, turn) => sum + state + estimateTokens(turnQuestions(turn, filled, {}, { project, signal }).questions), 0)
  const decisionUsd = (decisionTokens * JEV_INPUT_PRICE) / 1e6
  const textInputTokens = estimateTokens(TEXT_RULES) + SCORE_FACTS_TOKENS + estimateTokens(planExcerpts(project, [...filled]))
  const textUsd = model ? (textInputTokens * model.price.input + REPORT_OUTPUT_TOKENS * model.price.output) / 1e6 : null
  return {
    decisionTokens,
    decisionUsd,
    textInputTokens,
    textOutputTokens: REPORT_OUTPUT_TOKENS,
    textUsd,
    totalUsd: textUsd === null ? null : decisionUsd + textUsd,
  }
}

/** An amount as an order of magnitude: one significant digit, or "below" a floor. */
export function roughAmount(usd: number, floor = 0.001): { below: boolean; value: number } {
  if (usd < floor) return { below: true, value: floor }
  const magnitude = 10 ** Math.floor(Math.log10(usd))
  return { below: false, value: Math.round(usd / magnitude) * magnitude }
}

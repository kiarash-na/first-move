import { writeReport } from "@/lib/ai/plan-score/report"
import { scorePlan, type RunEvent } from "@/lib/ai/plan-score/run"
import { writeSuggestions } from "@/lib/ai/plan-score/suggest"
import type { TextLang } from "@/lib/ai/plan-score/text-input"
import type { AiScore, Project } from "@/lib/project"
import type { GatewayClient } from "../gateway/client"
import { gatewayErrorCode, type GatewayErrorCode } from "../gateway/errors"
import { textProviderOptions } from "../gateway/models"

/**
 * One AI Plan Score run in the browser (PLAN-AI-SCORE-00): Jev scores the plan through the user's
 * Gateway key, then the chosen text model writes the short report. A failed report never loses
 * the score; it comes back as `reportError`.
 */
export interface AnalysisOptions {
  client: GatewayClient
  textModelId: string
  lang: TextLang
  onEvent?: (event: RunEvent) => void
  abortSignal?: AbortSignal
  now?: () => Date
}

export interface AnalysisResult {
  score: AiScore
  reportError: GatewayErrorCode | null
}

export async function runAnalysis(project: Project, options: AnalysisOptions): Promise<AnalysisResult> {
  const { score } = await scorePlan(project, { decisionModel: options.client.decisionModel(), abortSignal: options.abortSignal, onEvent: options.onEvent, now: options.now })
  try {
    const report = await writeReport(project, score, {
      model: options.client.textModel(options.textModelId),
      modelId: options.textModelId,
      lang: options.lang,
      providerOptions: textProviderOptions(options.textModelId),
      abortSignal: options.abortSignal,
    })
    return { score: { ...score, report: report.value, usage: { ...score.usage, textTokens: report.tokens } }, reportError: null }
  } catch (error) {
    return { score, reportError: gatewayErrorCode(error) }
  }
}

/** Writes the report again for a saved score, e.g. in the other language or with another model. */
export async function rewriteReport(project: Project, score: AiScore, options: Omit<AnalysisOptions, "onEvent">): Promise<AiScore> {
  const report = await writeReport(project, score, {
    model: options.client.textModel(options.textModelId),
    modelId: options.textModelId,
    lang: options.lang,
    providerOptions: textProviderOptions(options.textModelId),
    abortSignal: options.abortSignal,
  })
  return { ...score, report: report.value, usage: { ...score.usage, textTokens: score.usage.textTokens + report.tokens } }
}

/** On-demand suggestions (D-77) for `keys`, or for every weak judgement and failed gate. */
export async function suggest(project: Project, score: AiScore, options: Omit<AnalysisOptions, "onEvent"> & { keys?: readonly string[] }): Promise<AiScore> {
  const result = await writeSuggestions(project, score, {
    model: options.client.textModel(options.textModelId),
    modelId: options.textModelId,
    lang: options.lang,
    keys: options.keys,
    providerOptions: textProviderOptions(options.textModelId),
    abortSignal: options.abortSignal,
    now: options.now,
  })
  return { ...score, suggestions: result.value, usage: { ...score.usage, textTokens: score.usage.textTokens + result.tokens } }
}

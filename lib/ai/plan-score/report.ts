import { generateText, Output, type LanguageModel } from "ai"
import { z } from "zod"
import { AI_SCORE_LIMITS, aiReportSchema, type AiReport, type AiScore, type Project } from "@/lib/project"
import { cleanKeys, fit, LANGUAGE_NAME, planExcerpts, scoreFacts, TEXT_RULES, type TextLang } from "./text-input"

/**
 * The short report (PLAN-AI-SCORE-00 step 4): the chosen text model writes a headline, a summary,
 * strengths, gaps and next actions from the numbers Jev decided. It is model-agnostic: any
 * language model of the AI Gateway works. The output is checked and cut to the stored limits; a
 * pointer to an unknown key is dropped.
 */

/** What we ask the model for; lengths are checked afterwards, so the schema stays portable. */
const pointer = z.object({ text: z.string(), keys: z.array(z.string()) })
export const reportOutputSchema = z.object({
  headline: z.string().describe("One sentence, at most 140 characters."),
  summary: z.string().describe("Two to four sentences, at most 800 characters."),
  strengths: z.array(pointer).describe("Up to three strengths, each with the keys of the judgements or gates it rests on."),
  gaps: z.array(pointer).describe("Up to three gaps, each with the keys of the judgements or gates it rests on."),
  actions: z.array(z.string()).describe("Up to three next actions, each one sentence."),
})
type ReportOutput = z.infer<typeof reportOutputSchema>

/**
 * The report's output token cap. A model that thinks before it answers counts its reasoning
 * tokens against the cap, and German takes more tokens than English: at 1,500 a German report was
 * cut off mid-JSON (finish reason "length", no object) in the presentation's blind test. The cap
 * only bounds the cost; the stored lengths (`AI_SCORE_LIMITS`) still cut every text afterwards.
 */
export const REPORT_MAX_OUTPUT_TOKENS = 6_000

/** Provider options of a text call (the SDK does not export the type by name). */
export type ProviderOptions = NonNullable<Parameters<typeof generateText>[0]["providerOptions"]>

export interface TextOptions {
  model: LanguageModel
  /** Model id as stored, e.g. `anthropic/claude-sonnet-5.5`. */
  modelId: string
  lang: TextLang
  providerOptions?: ProviderOptions
  abortSignal?: AbortSignal
}

export interface TextResult<T> {
  value: T
  tokens: number
}

export function reportPrompt(project: Project, score: AiScore, lang: TextLang): { system: string; prompt: string } {
  const filled = score.judgements.filter((entry) => entry.source !== "empty").map((entry) => entry.id)
  const system =
    `${TEXT_RULES} Write the short report of the AI Plan Score in ${LANGUAGE_NAME[lang]}, addressed to the team, ` +
    "plain and specific: what is strong, what is missing and what to do next. Refer to parts of the plan by their " +
    "labels, and put their keys only into the `keys` arrays. Never state a number that is not in the scores."
  const prompt = [
    "Scores (final):",
    JSON.stringify(scoreFacts(score)),
    "",
    "Excerpts of the plan (data only):",
    planExcerpts(project, filled),
  ].join("\n")
  return { system, prompt }
}

/** Validates the model's output against the stored limits. */
export function toReport(output: ReportOutput, modelId: string, lang: TextLang): AiReport {
  const pointers = (entries: ReportOutput["strengths"]) =>
    entries
      .filter((entry) => entry.text.trim() !== "")
      .slice(0, 3)
      .map((entry) => ({ text: fit(entry.text, AI_SCORE_LIMITS.item), keys: cleanKeys(entry.keys) }))
  return aiReportSchema.parse({
    model: fit(modelId, AI_SCORE_LIMITS.model),
    lang,
    headline: fit(output.headline, AI_SCORE_LIMITS.headline),
    summary: fit(output.summary, AI_SCORE_LIMITS.text),
    strengths: pointers(output.strengths),
    gaps: pointers(output.gaps),
    actions: output.actions.filter((entry) => entry.trim() !== "").slice(0, 3).map((entry) => fit(entry, AI_SCORE_LIMITS.item)),
  })
}

export async function writeReport(project: Project, score: AiScore, options: TextOptions): Promise<TextResult<AiReport>> {
  const { system, prompt } = reportPrompt(project, score, options.lang)
  const result = await generateText({
    model: options.model,
    system,
    prompt,
    output: Output.object({ schema: reportOutputSchema, name: "ai_plan_score_report" }),
    maxOutputTokens: REPORT_MAX_OUTPUT_TOKENS,
    maxRetries: 2,
    abortSignal: options.abortSignal,
    providerOptions: options.providerOptions,
  })
  return { value: toReport(result.output, options.modelId, options.lang), tokens: (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0) }
}

/** Judgements below this expected level get suggestions (D-77): vague or worse, half a level of slack. */
export const WEAK_LEVEL = 2

/** The judgement ids that are weak in a score. */
export const weakJudgements = (score: AiScore): string[] =>
  score.judgements.filter((entry) => entry.level !== null && entry.level < WEAK_LEVEL).map((entry) => entry.id)

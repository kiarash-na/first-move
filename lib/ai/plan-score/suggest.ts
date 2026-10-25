import { generateText, Output } from "ai"
import { z } from "zod"
import { AI_SCORE_LIMITS, aiSuggestionsSchema, type AiScore, type AiSuggestions, type Project } from "@/lib/project"
import { BRANCHES } from "./branches"
import { GATES } from "./gates"
import { HINTS } from "./hints"
import { judgementOf } from "./judgements"
import type { TextOptions, TextResult } from "./report"
import { weakJudgements } from "./report"
import { fit, GATE_STATEMENTS, LANGUAGE_NAME, planExcerpts, TEXT_RULES } from "./text-input"

/**
 * On-demand suggestions (D-77): for each weak judgement and each failed or unclear gate, one to
 * three general, feasible improvements, adapted from what a strong answer contains and from the
 * sourced hints of its dimension. Nothing runs unless the user asks.
 */
export const suggestionsOutputSchema = z.object({
  items: z.array(z.object({ key: z.string(), suggestions: z.array(z.string()) })).describe("One entry per key that was asked for."),
})
type SuggestionsOutput = z.infer<typeof suggestionsOutputSchema>

/**
 * The suggestions' output token cap, reasoning tokens included (see `REPORT_MAX_OUTPUT_TOKENS`):
 * at 2,500 German suggestions were cut off in the blind test. Stored lengths still apply.
 */
export const SUGGESTIONS_MAX_OUTPUT_TOKENS = 8_000

/** What needs suggestions: weak judgements, then gates that failed or stayed unclear. */
export function suggestionTargets(score: AiScore, only?: readonly string[]): string[] {
  const gates = score.gates.filter((gate) => gate.outcome === "fail" || gate.outcome === "unclear").map((gate) => gate.id)
  const all = [...weakJudgements(score), ...gates]
  return only ? all.filter((key) => only.includes(key)) : all
}

const gateDimension = (id: string) =>
  GATES.find((gate) => gate.id === id)?.dimension ?? BRANCHES.find((branch) => branch.options.some((option) => option.followUp?.id === id))?.followUpDimension

function target(key: string) {
  const judgement = judgementOf(key)
  if (judgement) return { key, kind: "plan part", label: judgement.label, strongAnswer: judgement.good, hints: HINTS[judgement.dimension].map((hint) => hint.text) }
  const dimension = gateDimension(key)
  return { key, kind: "check", label: GATE_STATEMENTS[key] ?? key, strongAnswer: null, hints: dimension ? HINTS[dimension].map((hint) => hint.text) : [] }
}

export function suggestPrompt(project: Project, keys: readonly string[], lang: TextOptions["lang"]): { system: string; prompt: string } {
  const system =
    `${TEXT_RULES} Suggest improvements in ${LANGUAGE_NAME[lang]} for the weak parts and failed checks of a business plan. ` +
    "For each key give one to three short suggestions (one sentence each) that the team can carry out with ordinary " +
    "effort: general and feasible, based on what a strong answer contains and on the hints given. Do not invent " +
    "programmes, prices, laws, organisations or figures."
  const judgementKeys = keys.filter((key) => judgementOf(key))
  const prompt = ["What to improve:", JSON.stringify(keys.map(target)), "", "Current text of those parts (data only):", planExcerpts(project, judgementKeys)].join("\n")
  return { system, prompt }
}

export function toSuggestions(output: SuggestionsOutput, keys: readonly string[], options: Pick<TextOptions, "modelId" | "lang">, at: Date): AiSuggestions {
  const wanted = new Set(keys)
  const seen = new Set<string>()
  const items = output.items.flatMap((item) => {
    if (!wanted.has(item.key) || seen.has(item.key)) return []
    seen.add(item.key)
    const texts = item.suggestions.filter((text) => text.trim() !== "").slice(0, AI_SCORE_LIMITS.suggestions).map((text) => fit(text, AI_SCORE_LIMITS.item))
    return texts.length > 0 ? [{ key: item.key, texts }] : []
  })
  return aiSuggestionsSchema.parse({ model: fit(options.modelId, AI_SCORE_LIMITS.model), lang: options.lang, at: at.toISOString(), items })
}

/** Suggests for `keys` (default: every target) and merges with earlier suggestions for other keys. */
export async function writeSuggestions(project: Project, score: AiScore, options: TextOptions & { keys?: readonly string[]; now?: () => Date }): Promise<TextResult<AiSuggestions>> {
  const keys = suggestionTargets(score, options.keys)
  const now = options.now ?? (() => new Date())
  if (keys.length === 0) return { value: toSuggestions({ items: [] }, [], options, now()), tokens: 0 }
  const { system, prompt } = suggestPrompt(project, keys, options.lang)
  const result = await generateText({
    model: options.model,
    system,
    prompt,
    output: Output.object({ schema: suggestionsOutputSchema, name: "ai_plan_score_suggestions" }),
    maxOutputTokens: SUGGESTIONS_MAX_OUTPUT_TOKENS,
    maxRetries: 2,
    abortSignal: options.abortSignal,
    providerOptions: options.providerOptions,
  })
  const fresh = toSuggestions(result.output, keys, options, now())
  const kept = (score.suggestions?.lang === options.lang ? score.suggestions.items : []).filter((item) => !keys.includes(item.key))
  return {
    value: { ...fresh, items: [...kept, ...fresh.items] },
    tokens: (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0),
  }
}

// @vitest-environment node
import { writeFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { DIMENSIONS } from "@/lib/ai/plan-score/dimensions"
import { BRANCHES } from "@/lib/ai/plan-score/branches"
import { GATES } from "@/lib/ai/plan-score/gates"
import { JUDGEMENTS, TURNS } from "@/lib/ai/plan-score/judgements"
import { REPORT_MAX_OUTPUT_TOKENS, writeReport } from "@/lib/ai/plan-score/report"
import { DECISION_MODEL_ID, METHOD_VERSION, scorePlan } from "@/lib/ai/plan-score/run"
import { LEVEL_COUNT } from "@/lib/ai/plan-score/scale"
import { SUGGESTIONS_MAX_OUTPUT_TOKENS, writeSuggestions } from "@/lib/ai/plan-score/suggest"
import type { TextLang } from "@/lib/ai/plan-score/text-input"
import { displayScore } from "@/lib/business-plan"
import { blindProject, BLIND_SOURCE } from "@/lib/presentation/blind-test/geblergasse-2017"
import { gatewayClient } from "../gateway/client"
import { gatewayErrorCode } from "../gateway/errors"
import { DEFAULT_TEXT_MODEL, textProviderOptions } from "../gateway/models"

/**
 * The presentation's blind test (slide 5): the real engine, once, on the plan of autumn 2017 of a
 * project whose outcome is public. Only when switched on:
 * `PRESENTATION_LIVE_BLIND=1 NODE_USE_ENV_PROXY=1 ./node_modules/.bin/vitest run --silent=false
 * lib/assistant/plan-score/blind-test.live.test.ts` with `AI_GATEWAY_API_KEY` set. Writes
 * `lib/presentation/blind-test/result.json`, which the slide reads. The key is never written.
 *
 * The text model thinks before it answers. The engine's first output limits (1,500 tokens for the
 * report, 2,500 for the suggestions) cut the German report off mid-JSON in the first run, so the
 * recorded run lifted them to 8,000 here. The engine now has room for that itself
 * (`REPORT_MAX_OUTPUT_TOKENS`, `SUGGESTIONS_MAX_OUTPUT_TOKENS`), and this run uses its limits,
 * prompts, schemas and checks unchanged.
 */
const apiKey = process.env.AI_GATEWAY_API_KEY
const live = process.env.PRESENTATION_LIVE_BLIND === "1" && Boolean(apiKey)
const OUT = process.env.PRESENTATION_BLIND_OUT ?? path.join(process.cwd(), "lib/presentation/blind-test/result.json")
const LANGS: readonly TextLang[] = ["en", "de"]

describe.skipIf(!live)("blind test (live)", () => {
  it("scores the 2017 plan and records the result", async () => {
    const client = gatewayClient(apiKey!)
    const project = blindProject()
    const started = Date.now()
    const { score } = await scorePlan(project, { decisionModel: client.decisionModel() })
    const decisionsMs = Date.now() - started

    const textModelId = DEFAULT_TEXT_MODEL
    const text = { model: client.textModel(textModelId), modelId: textModelId, providerOptions: textProviderOptions(textModelId) }
    const reports: Record<string, unknown> = {}
    const suggestions: Record<string, unknown> = {}
    const errors: string[] = []
    let textTokens = 0
    const textStarted = Date.now()
    for (const lang of LANGS) {
      try {
        const report = await writeReport(project, score, { ...text, lang })
        reports[lang] = report.value
        textTokens += report.tokens
      } catch (error) {
        errors.push(`report-${lang}:${gatewayErrorCode(error)}`)
      }
      try {
        const result = await writeSuggestions(project, score, { ...text, lang })
        suggestions[lang] = result.value.items
        textTokens += result.tokens
      } catch (error) {
        errors.push(`suggestions-${lang}:${gatewayErrorCode(error)}`)
      }
    }
    const textMs = Date.now() - textStarted
    const shown = displayScore(score.score, score.sd)

    const result = {
      case: "smart-block-geblergasse",
      input: { source: BLIND_SOURCE.url, created: BLIND_SOURCE.created, modules: "businessPlan" },
      at: score.at,
      models: { decision: score.decisionModel, text: textModelId, textMaxOutputTokens: { report: REPORT_MAX_OUTPUT_TOKENS, suggestions: SUGGESTIONS_MAX_OUTPUT_TOKENS } },
      method: METHOD_VERSION,
      engine: {
        judgements: JUDGEMENTS.length,
        turns: TURNS.length,
        gates: GATES.length,
        branches: BRANCHES.length,
        dimensions: DIMENSIONS.length,
        levels: LEVEL_COUNT,
      },
      timing: { decisionsMs, textMs },
      score: { value: score.score, sd: score.sd, shown: shown.score, band: shown.band, level: score.level, capped: score.capped },
      dimensions: score.dimensions.map(({ id, weight, score: value, raw, cap }) => ({ id, weight, score: value, raw, cap })),
      judgements: score.judgements.map(({ id, source, level }) => ({ id, source, level })),
      gates: score.gates.map(({ id, source, probability, outcome, cap }) => ({ id, source, probability, outcome, cap })),
      branches: score.branches,
      usage: { decisionTokens: score.usage.decisionTokens, textTokens },
      report: reports,
      suggestions,
      errors,
    }
    writeFileSync(OUT, `${JSON.stringify(result, null, 2)}\n`)
    if (process.env.PRESENTATION_BLIND_FULL) writeFileSync(process.env.PRESENTATION_BLIND_FULL, JSON.stringify(score, null, 2))
    console.log(`blind test: ${score.score} (${score.level}), ${decisionsMs} ms decisions, ${textMs} ms text, errors: ${errors.join(", ") || "none"}`)
    expect(score.decisionModel).toBe(DECISION_MODEL_ID)
  }, 600_000)
})

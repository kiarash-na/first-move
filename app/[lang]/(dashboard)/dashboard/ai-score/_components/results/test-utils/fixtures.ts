import { scorePlan } from "@/lib/ai/plan-score/run"
import { mockJev, type MockJevAnswers } from "@/lib/ai/plan-score/test-utils/mock-jev"
import { getExample, localizeExample } from "@/lib/examples"
import { aiReportSchema, aiSuggestionsSchema, type AiReport, type AiScore, type AiSuggestions, type Project } from "@/lib/project"

/**
 * Tests only: saved scores produced by the engine with the mock Jev (`run.ts`), so every view is
 * checked against real engine output, plus hand-built reports and suggestions that pass the schema.
 * Model ids are neutral test ids.
 */
export const NOW = () => new Date("2026-10-24T12:00:00.000Z")

export const exampleProject = (id = "housing-cooperatives"): Project => localizeExample(getExample(id)!, "en")

/** Varied answers: strong, weak, uncertain and refused parts; checks that pass, fail, stay unclear or cap. */
export const VARIED: MockJevAnswers = {
  levels: {
    site: [0, 0, 0.1, 0.3, 0.6],
    "pain-point": [0.3, 0.5, 0.2, 0, 0],
    needs: [0, 0.1, 0.2, 0.5, 0.2],
    advantage: [0.25, 0.25, 0.2, 0.15, 0.15],
    "connection-rate": [0.6, 0.4, 0, 0, 0],
  },
  gates: { anchor: 0.95, "extra-value": 0.5, operator: 0.1, boundary: "all", "lifetime-cover": "yes" },
  branches: { "anchor-type": "residential", "source-type": "groundwater", ownership: "community" },
  refuse: ["financing"],
  inputTokens: 1200,
}

/** As `VARIED`, but no owner is stated: the must-have check `boundary` fails and caps governance at 2. */
export const CAPPED: MockJevAnswers = { ...VARIED, levels: { ...VARIED.levels, ...strongLevels() }, gates: { ...VARIED.gates, boundary: "none" } }

function strongLevels(): Record<string, number[]> {
  return Object.fromEntries(["value-proposition", "partners", "operations", "allocation", "cost-basis", "revenue"].map((id) => [id, [0, 0, 0, 0.1, 0.9]]))
}

export interface Scored {
  project: Project
  score: AiScore
}

/** A project with its saved score, scored by the engine with the mock Jev. */
export async function scored(answers: MockJevAnswers = VARIED, project: Project = exampleProject()): Promise<Scored> {
  const { score } = await scorePlan(project, { decisionModel: mockJev(answers).model, now: NOW })
  return { project: { ...project, aiScore: score }, score }
}

export function report(lang: "en" | "de" = "en", overrides: Partial<AiReport> = {}): AiReport {
  return aiReportSchema.parse({
    model: "provider/text-model",
    lang,
    headline: lang === "en" ? "A specific plan that still lacks a decided owner." : "Ein konkreter Plan, dem noch ein Eigentümer fehlt.",
    summary: lang === "en" ? "The site and the needs are clear. Ownership and the operator are open." : "Standort und Bedarf sind klar. Eigentum und Betreiber sind offen.",
    strengths: [{ text: lang === "en" ? "The site is described with numbers." : "Der Standort ist mit Zahlen beschrieben.", keys: ["site", "anchor"] }],
    gaps: [{ text: lang === "en" ? "No operator is named." : "Kein Betreiber ist genannt.", keys: ["operator", "pain-point", "unknown-key"] }],
    actions: [lang === "en" ? "Name the operator and its duties." : "Nennen Sie den Betreiber und seine Pflichten."],
    ...overrides,
  })
}

export function suggestions(lang: "en" | "de" = "en", items: AiSuggestions["items"] = SUGGESTION_ITEMS): AiSuggestions {
  return aiSuggestionsSchema.parse({ model: "provider/text-model", lang, at: "2026-10-24T13:30:00.000Z", items })
}

export const SUGGESTION_ITEMS: AiSuggestions["items"] = [
  { key: "pain-point", texts: ["Name the boilers that reach the end of their life and when.", "Quote one bill to show the price swings."] },
  { key: "operator", texts: ["Name who maintains the network and who bills the customers."] },
]

/** A saved score with a report and, optionally, suggestions. */
export const withText = (score: AiScore, text: { report?: AiReport | null; suggestions?: AiSuggestions | null; textTokens?: number }): AiScore => ({
  ...score,
  report: text.report === undefined ? score.report : text.report,
  suggestions: text.suggestions === undefined ? score.suggestions : text.suggestions,
  usage: { ...score.usage, textTokens: text.textTokens ?? score.usage.textTokens },
})

import { untrustedDocument, UNTRUSTED_RULE } from "@/lib/ai/prompts/untrusted"
import type { AiScore, Project } from "@/lib/project"
import { displayScore } from "./aggregate"
import { BRANCHES } from "./branches"
import { DIMENSION_LABELS, type DimensionId } from "./dimensions"
import { GATES } from "./gates"
import { JUDGEMENTS, judgementOf } from "./judgements"
import { judgementValue } from "./state"

/**
 * What the text model gets (report and suggestions): the numbers Jev decided, with English
 * labels, and excerpts of the plan as untrusted data. The model never sees anything it could
 * change a number with: the numbers are final (D-71).
 */
export const TEXT_RULES =
  "You are part of First Move, a planning tool for fifth-generation district heating and cooling (5GDHC, anergy) " +
  "networks. You write for the project team. The scores below were decided by a separate decision model and are " +
  "final: never change, recompute, round differently or contradict them, and never invent figures, sources, " +
  "organisations or quotes. Write plain sentences: no markdown, no lists inside a text, no links. " +
  UNTRUSTED_RULE

export const LANGUAGE_NAME = { en: "English", de: "German" } as const
export type TextLang = keyof typeof LANGUAGE_NAME

/**
 * The language instruction of every text call. German addresses the reader formally, as the UI
 * does ("Sie"): the first German blind-test texts said "ihr".
 */
export const LANGUAGE_RULE: Record<TextLang, string> = {
  en: "Write in English.",
  de:
    'Write in German. Address the reader formally, as the app does: "Sie", "Ihr" and "Ihnen", capitalised. ' +
    'Never use the informal "du", "dich", "dir" or "dein", nor the informal plural "ihr", "euch" or "euer".',
}

const EXCERPT = 280

const excerpt = (value: unknown) => {
  const text = typeof value === "string" ? value : JSON.stringify(value)
  return text.length > EXCERPT ? `${text.slice(0, EXCERPT)}…` : text
}

/** Every statement a gate asks, plain and follow-up, by id. */
export const GATE_STATEMENTS: Record<string, string> = Object.fromEntries([
  ...GATES.map((gate) => [gate.id, gate.question]),
  ...BRANCHES.flatMap((branch) => branch.options.flatMap((option) => (option.followUp ? [[option.followUp.id, option.followUp.question]] : []))),
])

/** The keys a text may point to: judgements and gates. */
export const POINTER_KEYS: ReadonlySet<string> = new Set([...JUDGEMENTS.map((judgement) => judgement.id), ...Object.keys(GATE_STATEMENTS)])

export function scoreFacts(score: AiScore) {
  return {
    aiPlanScore: { ...displayScore(score.score, score.sd), label: score.level, mustHaveGateFailed: score.capped },
    quickCheck: score.quickCheck,
    dimensions: score.dimensions.map((dimension) => ({
      name: DIMENSION_LABELS[dimension.id as DimensionId] ?? dimension.id,
      percent: Math.round(dimension.score * 100),
      cappedAtLevel: dimension.cap,
    })),
    decisions: score.branches.map((branch) => {
      const definition = BRANCHES.find((entry) => entry.id === branch.id)
      return { question: definition?.question ?? branch.id, answer: definition?.options.find((option) => option.id === branch.choice)?.criterion ?? branch.choice }
    }),
    gates: score.gates.map((gate) => ({ key: gate.id, statement: GATE_STATEMENTS[gate.id] ?? gate.id, outcome: gate.outcome, cappedDimensionAtLevel: gate.cap })),
    judgements: score.judgements.map((entry) => ({
      key: entry.id,
      label: judgementOf(entry.id)?.label ?? entry.id,
      levelOf4: entry.level === null ? null : Math.round(entry.level * 10) / 10,
      empty: entry.source === "empty",
    })),
  }
}

/** Some judgements' texts as one untrusted block, cut to excerpts. */
export function planExcerpts(project: Project, ids: readonly string[]): string {
  const lines = ids.flatMap((id) => {
    const judgement = judgementOf(id)
    if (!judgement) return []
    return [`${judgement.label} (${id}): ${excerpt(judgementValue(project, judgement))}`]
  })
  return untrustedDocument("business-plan", lines.join("\n"))
}

/** Keeps only pointers to real items and gates, at most `max`. */
export function cleanKeys(keys: readonly string[] | undefined, max = 8): string[] {
  return [...new Set((keys ?? []).filter((key) => POINTER_KEYS.has(key)))].slice(0, max)
}

/** Cuts a model text to a stored limit at a word boundary. */
export function fit(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max / 2))}…`
}

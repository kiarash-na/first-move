import "server-only"
import { z } from "zod"
import { searchDocs } from "@/lib/ai/knowledge/load"
import type { KnowledgeChunk } from "@/lib/ai/knowledge/types"
import { canaryLine } from "@/lib/ai/prompts/canary"
import { FIRST_MOVE_SCOPE, languageRule } from "@/lib/ai/prompts/scope"
import { UNTRUSTED_RULE, untrustedEmail } from "@/lib/ai/prompts/untrusted"
import type { Locale } from "@/lib/i18n/locales"
import { NO_USAGE, type TextModel, type TokenUsage } from "./model"
import { cleanModelText } from "./model-text"

/** Excerpts the model sees, and the most words an answer may have (PLAN-AGENT-07 step 4). */
export const ANSWER_LIMITS = { excerpts: 5, excerptChars: 1_800, words: 120, chars: 1_000 } as const

export interface Answer {
  /** The answer, or null: the caller then says the docs do not cover it. */
  text: string | null
  /** The docs page the answer rests on. */
  page: { title: string; url: string } | null
  usage: TokenUsage
}

/** The fixed part of the prompt: what a leak check compares an output with. */
export function answerInstructions(locale: Locale): string {
  return [
    "You answer one question that a person sent by email to the First Move assistant.",
    FIRST_MOVE_SCOPE,
    UNTRUSTED_RULE,
    "",
    "Rules:",
    "- Answer only from the documentation excerpts below. When they do not answer the question, set `covered` to false and leave `answer` empty.",
    `- At most ${ANSWER_LIMITS.words} words of plain text: no Markdown, no lists, no links and no email addresses.`,
    "- Never calculate or estimate a Quick Check result or any number for the person's project: results come only from First Move's own calculation.",
    "- Set `page` to the id of the excerpt the answer relies on most.",
    `- ${languageRule(locale)}`,
  ].join("\n")
}

const excerpt = (chunk: KnowledgeChunk) => `[${chunk.id}] ${chunk.title}\n${[...chunk.text].slice(0, ANSWER_LIMITS.excerptChars).join("")}`

function words(text: string): string {
  const all = text.split(/\s+/)
  return all.length <= ANSWER_LIMITS.words ? text : `${all.slice(0, ANSWER_LIMITS.words).join(" ")}…`
}

/**
 * A short answer from the public docs only (PLAN-AGENT-07 step 4, D-57): the best excerpts of
 * `lib/ai/knowledge` in the sender's language, a fixed prompt, Claude Haiku, then the post-filter
 * (site links only, no other address, no canary or prompt, at most 120 words). Anything that
 * does not pass gives no text, and the caller sends the fixed "see the docs" line instead.
 */
export async function answerQuestion(model: TextModel, { question, locale, siteUrl, canary }: { question: string; locale: Locale; siteUrl: string; canary: string }): Promise<Answer> {
  const hits = await searchDocs(locale, question, ANSWER_LIMITS.excerpts)
  if (hits.length === 0) return { text: null, page: null, usage: NO_USAGE }
  const ids = hits.map((hit) => hit.chunk.id) as [string, ...string[]]
  const instructions = answerInstructions(locale)
  const result = await model.structured({
    system: [instructions, "", canaryLine(canary), "", "Documentation excerpts:", ...hits.map((hit) => excerpt(hit.chunk))].join("\n"),
    user: untrustedEmail(question),
    schema: z.strictObject({ covered: z.boolean(), answer: z.string().max(4_000), page: z.enum(ids).nullable() }),
    maxTokens: 800,
  })
  if (!result.ok || !result.value.covered) return { text: null, page: null, usage: result.usage }
  const text = cleanModelText(words(result.value.answer), { siteUrl, canary, instructions, maxChars: ANSWER_LIMITS.chars })
  const chunk = hits.find((hit) => hit.chunk.id === result.value.page)?.chunk ?? hits[0].chunk
  return { text, page: text ? { title: chunk.title, url: new URL(chunk.url, siteUrl).href } : null, usage: result.usage }
}

import "server-only"
import type { FieldCatalogue } from "@/lib/ai/extract/field-catalogue"
import type { Texts } from "@/lib/ai/extract/field-label"
import { extractionSchema } from "@/lib/ai/extract/output-schema"
import { extractionInstructions, extractionRequest } from "@/lib/ai/extract/prompt"
import { buildProposal, type Proposal } from "@/lib/ai/extract/propose"
import { canaryLine } from "@/lib/ai/prompts/canary"
import type { Project } from "@/lib/project"
import type { StructuredResult, TextModel, TokenUsage } from "./model"

/** A question the last email asked, so a numbered answer ("3: 40") maps to its fields. */
export interface AskedQuestion {
  number: number
  text: string
  fields: readonly string[]
}

export interface ExtractionInput {
  catalogue: FieldCatalogue
  /** The English catalogue, so English option labels match in a German conversation. */
  fallback?: FieldCatalogue
  texts: Texts
  project: Project
  /** The new text of the email, sanitized. */
  email: string
  documents: readonly { name: string; text: string }[]
  asked: readonly AskedQuestion[]
  canary: string
}

export type ExtractionOutcome = { ok: true; proposal: Proposal; usage: TokenUsage } | { ok: false; reason: Exclude<StructuredResult<unknown>, { ok: true }>["reason"]; usage: TokenUsage }

/** Long Business Plan answers need room; the Quick Check needs little. */
const MAX_TOKENS = 6_000

/** The email-specific rules on top of the shared extraction prompt (PLAN-AGENT-07 step 8). */
function emailRules(asked: readonly AskedQuestion[]): string {
  const lines = [
    "",
    "Email rules:",
    "- The email answers questions the First Move assistant asked by email. A numbered answer refers to the question with that number below; map it to that question's fields.",
    "- A correction (\"change the area to 4 ha\", \"3: 40 buildings\") replaces the earlier value: return the new value.",
    "- Shares of buildings are percent per building type and construction period; return one value per cell that is named.",
    "- For Business Plan fields keep the person's own words: quote or lightly shorten them, never invent, judge or improve them.",
  ]
  if (asked.length) {
    lines.push("", "Questions the last email asked:")
    for (const question of asked) lines.push(`${question.number}. ${question.text} → ${question.fields.join(", ")}`)
  }
  return lines.join("\n")
}

/**
 * Reads values for the draft from an email and its documents with Claude Haiku (PLAN-AGENT-07
 * step 8): the shared extraction prompt and schema of `lib/ai/extract`, scoped to the fields the
 * conversation asks about, the email and each document as untrusted blocks, then the same
 * normalize → merge → dry-run as in the app. Nothing is applied here.
 */
export async function extractValues(model: TextModel, input: ExtractionInput): Promise<ExtractionOutcome> {
  const fieldIds = input.catalogue.fields.map((field) => field.id)
  const result = await model.structured({
    system: [extractionInstructions(input.catalogue), emailRules(input.asked), "", canaryLine(input.canary)].join("\n"),
    user: extractionRequest(input.documents, { email: input.email }),
    schema: extractionSchema(fieldIds),
    maxTokens: MAX_TOKENS,
  })
  if (!result.ok) return { ok: false, reason: result.reason, usage: result.usage }
  const runs = [{ output: result.value }]
  return { ok: true, proposal: buildProposal(runs, input.project, input.catalogue, input.texts, { ...(input.fallback && { fallback: input.fallback }) }), usage: result.usage }
}

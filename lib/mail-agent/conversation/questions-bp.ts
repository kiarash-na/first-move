import "server-only"
import type { Question, Section } from "@/emails/model"
import { fieldLabel, optionLabel, textOf } from "@/lib/ai/extract/field-label"
import { promptsFor } from "@/lib/business-plan/prompts"
import { joinList } from "@/lib/dashboard/result-text"
import { interpolate } from "@/lib/i18n/interpolate"
import { lookup } from "@/lib/i18n/lookup"
import { BUSINESS_PLAN_STEPS, fieldsOf, type BusinessPlanStep, type FieldDef } from "@/lib/project"
import type { MailTexts } from "./texts"

/** The fields one Business Plan step asks for, in registry order (the dashboard's order). */
export function stepFields(step: BusinessPlanStep): FieldDef[] {
  return fieldsOf({ module: "businessPlan", step })
}

function hints(field: FieldDef, t: MailTexts): string[] {
  const { questions } = t.mail.conversation
  const help = textOf(t.texts, field.text, "help")
  const out = help ? [help] : []
  if (field.kind === "choice") out.push(interpolate(questions.options, { options: joinList(field.options.map((option) => optionLabel(field, option, t.texts) ?? option), t.locale) }))
  if (field.kind === "items") {
    const properties = field.properties.map((property) => textOf(t.texts, property.text) ?? property.key)
    out.push(interpolate(questions.rows, { properties: properties.join(", ") }))
  }
  return out
}

/** One question per field of the step, numbered from 1; all optional: the Business Plan is the person's own words (D-27). */
export function bpQuestions(step: BusinessPlanStep, t: MailTexts): Question[] {
  return stepFields(step).map((field, index) => ({ number: index + 1, text: fieldLabel(field, t.texts), optional: t.mail.conversation.questions.optional, hints: hints(field, t) }))
}

/** The guiding questions of the step (BM-SCOPE-03), as the dashboard shows them. */
export function guidance(step: BusinessPlanStep, t: MailTexts): string[] {
  return promptsFor(step)
    .filter((prompt) => prompt.kind === "question")
    .map((prompt) => lookup(t.businessPlan, `prompts.${prompt.id}`))
    .filter((text): text is string => Boolean(text))
}

/**
 * One Business Plan step as a section (PLAN-AGENT-07 step 7): "step N of 4", the guiding
 * questions to think about, then the numbered fields. Orange: the Business Plan's accent.
 */
export function bpQuestionsSection(step: BusinessPlanStep, t: MailTexts, { askFile }: { askFile: boolean }): Section {
  const { conversation } = t.mail
  const { questions } = conversation
  const number = BUSINESS_PLAN_STEPS.indexOf(step) + 1
  const prompts = guidance(step, t)
  return {
    kicker: conversation.kicker.businessPlan,
    title: interpolate(questions.titleBusinessPlan, { number, total: BUSINESS_PLAN_STEPS.length, step: conversation.bp.steps[step] }),
    accent: "hot",
    blocks: [
      { type: "text", text: questions.leadBusinessPlan },
      ...(prompts.length ? [{ type: "bullets" as const, items: prompts }] : []),
      { type: "questions", items: bpQuestions(step, t) },
      ...(number === 1 ? [{ type: "text" as const, text: questions.attachments, tone: "muted" as const }] : []),
      ...(askFile ? [{ type: "text" as const, text: questions.file, tone: "strong" as const }] : []),
    ],
  }
}

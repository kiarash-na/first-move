import "server-only"
import type { Question, Section } from "@/emails/model"
import { interpolate } from "@/lib/i18n/interpolate"
import { joinList } from "@/lib/dashboard/result-text"
import { BUILDING_TYPES, CONSTRUCTION_PERIODS, SOURCES } from "@/lib/project"
import type { MailTexts } from "./texts"

/** The Quick Check questions by email (PLAN-AGENT-07 step 7), in order, with the fields each one fills. */
export const QC_QUESTIONS = [
  { id: "name", fields: ["meta.name"], optional: true },
  { id: "buildings", fields: ["buildings.total"], optional: false },
  { id: "area", fields: ["buildings.areaM2"], optional: false },
  { id: "mix", fields: ["buildings.shares"], optional: false },
  { id: "sources", fields: ["sources.potentials"], optional: false },
  { id: "pv", fields: ["sources.pv"], optional: true },
  { id: "demand", fields: ["quickCheck.manualDemand"], optional: true },
  { id: "network", fields: ["quickCheck.networkLengthM"], optional: true },
] as const

export type QcQuestionId = (typeof QC_QUESTIONS)[number]["id"]

export const QC_QUESTION_IDS: readonly QcQuestionId[] = QC_QUESTIONS.map((question) => question.id)

/** The question that asks for a field or group id (`buildings.shares.residential.until_1919` → `mix`). */
export function questionFor(fieldId: string): QcQuestionId | null {
  return QC_QUESTIONS.find((question) => question.fields.some((prefix) => fieldId === prefix || fieldId.startsWith(`${prefix}.`)))?.id ?? null
}

/** The building types with the kinds of buildings each category stands for. */
function typeNames(t: MailTexts): string {
  const types = t.quickCheck.buildingTypes as Record<string, { label: string; description: string }>
  return joinList(
    BUILDING_TYPES.map((type) => (type.startsWith("category_") ? `${types[type].label} (${types[type].description.replace(/\.$/, "")})` : types[type].label)),
    t.locale,
  )
}

function hints(id: QcQuestionId, t: MailTexts): string[] {
  const { qc, questions } = t.mail.conversation
  const example = interpolate(questions.example, { example: qc[id].example })
  switch (id) {
    case "mix":
      return [
        interpolate(qc.mix.types, { types: typeNames(t) }),
        interpolate(qc.mix.periods, { periods: joinList(CONSTRUCTION_PERIODS.map((period) => t.quickCheck.periods[period].label), t.locale) }),
        example,
      ]
    case "sources":
      return [interpolate(qc.sources.list, { sources: joinList(SOURCES.map((source) => t.quickCheck.sources[source].label), t.locale) }), example]
    default:
      return [example]
  }
}

/** The numbered list for these questions, numbered from 1 in the given order. */
export function qcQuestions(ids: readonly QcQuestionId[], t: MailTexts): Question[] {
  const { qc, questions } = t.mail.conversation
  return ids.map((id, index) => {
    const question = QC_QUESTIONS.find((entry) => entry.id === id)!
    return { number: index + 1, text: qc[id].question, ...(question.optional && { optional: questions.optional }), hints: hints(id, t) }
  })
}

/**
 * The Quick Check questions as a section: the full list the first time, then only what is still
 * missing or was unclear (`followUp`). Asks about the project file when the sender has not said.
 */
export function qcQuestionsSection(ids: readonly QcQuestionId[], t: MailTexts, { followUp, askFile }: { followUp: boolean; askFile: boolean }): Section {
  const { conversation } = t.mail
  const { questions } = conversation
  return {
    kicker: conversation.kicker.questions,
    title: followUp ? questions.titleFollowUp : questions.titleQuickCheck,
    accent: "cool",
    blocks: [
      { type: "text", text: questions.lead },
      { type: "questions", items: qcQuestions(ids, t) },
      ...(followUp ? [] : [{ type: "text" as const, text: questions.attachments, tone: "muted" as const }]),
      ...(askFile ? [{ type: "text" as const, text: questions.file, tone: "strong" as const }] : []),
    ],
  }
}

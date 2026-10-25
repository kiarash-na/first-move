import "server-only"
import type { Section } from "@/emails/model"
import { EMAIL_LIMITS } from "@/lib/ai/documents/limits"
import { formatNumber } from "@/lib/i18n/format"
import { lookup } from "@/lib/i18n/lookup"
import { interpolate } from "@/lib/i18n/interpolate"
import { OPERATOR } from "@/lib/legal/operator"
import type { FileReport } from "../attachments/read"
import type { Phase } from "./state"
import type { MailTexts } from "./texts"

/** The menu (PLAN-AGENT-07 step 6): Quick Check, Business Plan or both, and the project file. */
export function menuSection(t: MailTexts, { again, askFile }: { again: boolean; askFile: boolean }): Section {
  const { conversation } = t.mail
  const { menu } = conversation
  return {
    kicker: conversation.kicker.menu,
    title: menu.title,
    accent: "ink",
    blocks: [
      ...(again ? [{ type: "text" as const, text: menu.again, tone: "strong" as const }] : [{ type: "text" as const, text: menu.lead }]),
      {
        type: "options",
        items: (["quickCheck", "businessPlan", "both"] as const).map((key, index) => ({ number: index + 1, label: menu.options[key].label, description: menu.options[key].description })),
      },
      ...(askFile ? [{ type: "text" as const, text: menu.file }] : []),
      { type: "text", text: menu.howTo, tone: "strong" },
    ],
  }
}

/** A short answer from the docs, with the page it rests on; or the fixed line when there is none. */
export function answerSection(answer: { text: string | null; page: { title: string; url: string } | null }, t: MailTexts, docsUrl: string): Section {
  const { conversation } = t.mail
  const copy = conversation.answer
  const blocks: Section["blocks"] = answer.text
    ? [{ type: "text", text: answer.text }, ...(answer.page ? [{ type: "text" as const, text: interpolate(copy.source, { page: `${answer.page.title} (${answer.page.url})` }), tone: "muted" as const }] : [])]
    : [{ type: "text", text: interpolate(copy.fallback, { link: docsUrl }) }]
  return { kicker: conversation.kicker.answer, title: copy.title, accent: "ink", blocks }
}

/** What happened to each attached file. */
export function filesSection(reports: readonly FileReport[], t: MailTexts, accent: Section["accent"]): Section {
  const { conversation } = t.mail
  const { files } = conversation
  const line = (report: FileReport) => {
    if (report.status === "read") return interpolate(files.read, { name: report.name })
    if (report.status === "imported") return interpolate(files.imported, { name: report.name })
    const detail = report.detail ? (lookup(t.shell, `storage.import.error.${report.detail}`) ?? report.detail) : ""
    const reason = interpolate(files.reasons[report.reason], { max: formatNumber(EMAIL_LIMITS.files, t.locale), detail })
    return interpolate(files.skipped, { name: report.name, reason })
  }
  return { kicker: conversation.kicker.progress, title: files.title, accent, blocks: [{ type: "bullets", items: reports.map(line) }] }
}

/** The note that goes with the attached project file, or the offer to send one. */
export function fileNoteSection(t: MailTexts, { attached, fileName, dashboardUrl }: { attached: boolean; fileName: string; dashboardUrl: string }): Section {
  const { conversation } = t.mail
  const blocks: Section["blocks"] = attached
    ? [
        { type: "text", text: interpolate(conversation.file.attached, { name: fileName, link: dashboardUrl }) },
        { type: "text", text: conversation.file.provenance, tone: "muted" },
      ]
    : [{ type: "text", text: conversation.file.offer, tone: "muted" }]
  return { kicker: conversation.kicker.progress, accent: "ink", blocks }
}

/** One line on where the conversation stands, after an answer or a short reply. */
export function reminderSection(phase: Phase, t: MailTexts): Section {
  const { conversation } = t.mail
  return { kicker: conversation.kicker.progress, accent: "ink", blocks: [{ type: "text", text: conversation.reminder[phase] }] }
}

/** A person takes over; `again` when the person already has an earlier email of the same day. */
export function handoffSection(t: MailTexts, { again }: { again: boolean }): Section {
  const { conversation } = t.mail
  const { handoff } = conversation
  return { kicker: conversation.kicker.handoff, title: handoff.title, accent: "ink", blocks: [{ type: "text", text: interpolate(again ? handoff.again : handoff.body, { address: OPERATOR.emailHuman }) }] }
}

export function stoppedSection(t: MailTexts, { hadConversation }: { hadConversation: boolean }): Section {
  const { conversation } = t.mail
  const { stopped } = conversation
  return {
    kicker: conversation.kicker.stopped,
    title: stopped.title,
    accent: "ink",
    blocks: [{ type: "text", text: hadConversation ? interpolate(stopped.body, { address: OPERATOR.emailHuman }) : stopped.nothing }],
  }
}

export function restartedSection(t: MailTexts): Section {
  const { conversation } = t.mail
  return { kicker: conversation.kicker.menu, accent: "ink", blocks: [{ type: "text", text: conversation.restarted, tone: "strong" }] }
}

export function limitSection(t: MailTexts, dashboardUrl: string): Section {
  const { conversation } = t.mail
  return { kicker: conversation.kicker.limit, title: conversation.limit.title, accent: "ink", blocks: [{ type: "text", text: interpolate(conversation.limit.body, { link: dashboardUrl }) }] }
}

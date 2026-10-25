import "server-only"
import type { Block, Section, ValueRow } from "@/emails/model"
import type { Proposal } from "@/lib/ai/extract/propose"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { getGroup, groupRuleStatus, type Project } from "@/lib/project"
import type { Applied } from "./apply"
import { fieldName, formatFieldValue } from "./format-value"
import type { MailTexts } from "./texts"

const SHARES = "buildings.shares"

/** What could not be used, one line each: the value's problem, a conflict, the sum of the shares, the model's own doubts. */
function unclearLines(proposal: Proposal, project: Project, applied: Applied, notes: readonly string[], t: MailTexts): string[] {
  const { progress } = t.mail.conversation
  const lines = [
    ...proposal.unclear.map((value) => `${value.label}: ${progress.reasons[value.reason]}`),
    ...proposal.invalid.map((entry) => `${entry.label}: ${entry.message}`),
    ...proposal.conflicts.map((conflict) => `${conflict.label}: ${conflict.candidates.map((candidate) => String(candidate.value)).join(" / ")}`),
  ]
  const group = getGroup(SHARES)
  if (group && applied.values.some((value) => value.key.startsWith(`${SHARES}.`))) {
    const status = groupRuleStatus(project, group)
    if (!status.ok) lines.push(interpolate(progress.sum, { sum: formatNumber(status.value, t.locale, { maximumFractionDigits: 1 }) }))
  }
  return [...lines, ...notes]
}

/**
 * The progress reply (PLAN-AGENT-07 step 8): the values taken from the email, numbered and
 * formatted with their units, the file each was read from, and what was unclear and why. What is
 * still missing follows as the next questions.
 */
export function progressSection({ applied, proposal, notes }: { applied: Applied; proposal: Proposal; notes: readonly string[] }, t: MailTexts, accent: Section["accent"]): Section {
  const { conversation } = t.mail
  const { progress } = conversation
  const rows: ValueRow[] = applied.values.map((value) => ({
    label: fieldName(value.key, t),
    value: formatFieldValue(value.key, value.value, t),
    ...(value.files.length && { note: interpolate(progress.from, { file: value.files.join(", ") }) }),
  }))
  const unclear = unclearLines(proposal, applied.project, applied, notes, t)
  const blocks: Block[] = [
    rows.length ? { type: "rows", title: progress.understood, rows } : { type: "text", text: progress.nothing },
    ...(unclear.length ? [{ type: "text" as const, text: progress.unclear, tone: "strong" as const }, { type: "bullets" as const, items: unclear }] : []),
  ]
  return { kicker: conversation.kicker.progress, title: progress.title, accent, blocks }
}

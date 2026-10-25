import "server-only"
import type { Experimental_DecisionModel } from "ai"
import { EMAIL_LIMITS } from "@/lib/ai/documents/limits"
import { readDocument } from "@/lib/ai/documents/read-document"
import type { DocumentError } from "@/lib/ai/documents/types"
import type { Project } from "@/lib/project"
import type { ImportErrorCode } from "@/lib/storage/import"
import { sendAlert, type AlertDeps } from "../admin/alert"
import { decideAttachment, decisionCost } from "../guard/decide"
import { THRESHOLDS } from "../guard/thresholds"
import type { InboundEmail } from "../inbound/transport"
import { logEvent } from "../log"
import { addSpend } from "../store/budget"

/** Characters of one document the guard checks and the extractor reads; the rest is left out. */
export const DOCUMENT_CHARS = 48_000
/** Jev judges the text in pieces this long, far below its context. */
const GUARD_PIECE = 12_000

export type SkipReason = DocumentError | "too-many" | "unsafe" | "unchecked" | "unavailable" | "no-text" | "project"

export type FileReport =
  | { name: string; status: "read" }
  | { name: string; status: "imported" }
  | { name: string; status: "skipped"; reason: SkipReason; detail?: ImportErrorCode }

export interface ReadFiles {
  documents: { name: string; text: string }[]
  /** First Move project files, validated and migrated like an import (D-13). */
  projects: { name: string; project: Project }[]
  reports: FileReport[]
}

export interface AttachmentDeps extends AlertDeps {
  decisionModel: Experimental_DecisionModel
}

/** Jev's highest P(injection) over the text's pieces; null when it gave no answer for one. */
async function injectionOf(deps: AttachmentDeps, text: string, now: number): Promise<number | null> {
  let highest = 0
  for (let start = 0; start < text.length; start += GUARD_PIECE) {
    const decision = await decideAttachment(deps.decisionModel, text.slice(start, start + GUARD_PIECE))
    if (!decision) return null
    await addSpend(deps.store, decisionCost(decision.inputTokens), now)
    highest = Math.max(highest, decision.injection)
    if (highest >= THRESHOLDS.block) break
  }
  return highest
}

/**
 * Reads an email's attachments (PLAN-AGENT-07 step 8, phase 06 step 9): at most five files,
 * signature images ignored; each downloaded within the size cap, read by `lib/ai/documents`
 * (type from the bytes, zip-bomb and sheet guards), and its text judged by Jev for instructions.
 * A file that tries to instruct the assistant is skipped and the admin is told, without a strike:
 * people forward documents they did not write. A `.firstmove.json` file is imported, not read.
 */
export async function readAttachments(deps: AttachmentDeps, email: InboundEmail & { from: string }, now: number): Promise<ReadFiles> {
  const out: ReadFiles = { documents: [], projects: [], reports: [] }
  const files = email.attachments.filter((file) => !file.inline)
  for (const [index, file] of files.entries()) {
    const name = file.name ?? "file"
    if (index >= EMAIL_LIMITS.files) {
      out.reports.push({ name, status: "skipped", reason: "too-many" })
      continue
    }
    const bytes = await deps.transport.getAttachment(email.id, file.id, EMAIL_LIMITS.fileBytes)
    if (!bytes) {
      out.reports.push({ name, status: "skipped", reason: file.size > EMAIL_LIMITS.fileBytes ? "too-large" : "unavailable" })
      continue
    }
    const read = await readDocument({ name, bytes }, EMAIL_LIMITS)
    if (!read.ok) {
      out.reports.push({ name: read.name, status: "skipped", reason: read.error })
      continue
    }
    if (read.type === "project") {
      if (read.result.ok) {
        out.projects.push({ name: read.name, project: read.result.project })
        out.reports.push({ name: read.name, status: "imported" })
      } else out.reports.push({ name: read.name, status: "skipped", reason: "project", detail: read.result.code })
      continue
    }
    const text = [...read.document.text].slice(0, DOCUMENT_CHARS).join("")
    if (!text.trim()) {
      out.reports.push({ name: read.document.name, status: "skipped", reason: "no-text" })
      continue
    }
    const injection = await injectionOf(deps, text, now)
    if (injection === null) {
      out.reports.push({ name: read.document.name, status: "skipped", reason: "unchecked" })
      continue
    }
    if (injection >= THRESHOLDS.block) {
      out.reports.push({ name: read.document.name, status: "skipped", reason: "unsafe" })
      await sendAlert(deps, { kind: "attachment-injection", email, category: "injection", scores: { injection } }, now)
      logEvent("attachment", { status: "unsafe" })
      continue
    }
    out.documents.push({ name: read.document.name, text })
    out.reports.push({ name: read.document.name, status: "read" })
  }
  return out
}

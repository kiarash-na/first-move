import "server-only"
import type { Project } from "@/lib/project"
import { buildExport } from "@/lib/storage/export"
import type { ReplyAttachment } from "../outbound/send"

/**
 * The draft as a `.firstmove.json` export (PLAN-AGENT-07 step 11, D-13): the same envelope the
 * dashboard exports and imports, inputs only (results are recomputed after import), with the
 * email agent's provenance marks, so the dashboard shows which values an AI proposed.
 */
export function projectAttachment(project: Project, now: Date): ReplyAttachment {
  const file = buildExport(project, now)
  return { filename: file.fileName, content: Buffer.from(file.text, "utf8").toString("base64"), contentType: file.mimeType }
}

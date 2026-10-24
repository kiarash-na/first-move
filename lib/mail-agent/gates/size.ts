import "server-only"
import { EMAIL_LIMITS, checkBatch } from "@/lib/ai/documents/limits"
import { newEmailText } from "@/lib/ai/text/email-body"
import { drop, pass, type Gate } from "./types"

/** Characters of a raw body, and of its new text after quoted history is removed. */
export const BODY_LIMITS = { raw: 50_000, clean: 20_000 } as const

/**
 * Gate 6 (PLAN-AGENT-06 step 7.6): bodies and attachments within the caps. Too many files or too
 * many bytes drop the email (a cost attack); a file of an unsupported type is not a reason here,
 * phase 07 says which file it skipped.
 */
export const sizeGate: Gate = ({ email }) => {
  if (email.text.length > BODY_LIMITS.raw) return drop("too-large")
  if (newEmailText(email.text).text.length > BODY_LIMITS.clean) return drop("too-large")
  const files = email.attachments.map((file) => ({ name: file.name ?? "file", size: file.size }))
  const problems = checkBatch(files, EMAIL_LIMITS).filter((problem) => problem.code !== "empty-file")
  return problems.length > 0 ? drop("too-large") : pass
}

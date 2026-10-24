const MB = 1024 * 1024

/** Caps for documents read by an agent (PLAN-AGENT-03 step 2). */
export interface DocumentLimits {
  /** Files per message or request. */
  files: number
  fileBytes: number
  totalBytes: number
  /** Pages read from a PDF; later pages are skipped with a warning. */
  pdfPages: number
  /** Entries of a Word or Excel file (a ZIP), checked before any parser runs. */
  zipEntries: number
  /** Uncompressed size of all entries together, declared and actual (zip-bomb guard). */
  zipUncompressedBytes: number
  /** Last row × last column with a value, per sheet: what the spreadsheet parser allocates. */
  sheetCells: number
  /** Characters of text kept per document after extraction. */
  textChars: number
}

export const DOCUMENT_LIMITS: DocumentLimits = {
  files: 5,
  fileBytes: 10 * MB,
  totalBytes: 20 * MB,
  pdfPages: 60,
  zipEntries: 2_000,
  zipUncompressedBytes: 50 * MB,
  sheetCells: 2_000_000,
  textChars: 200_000,
}

/** The in-app assistant and the email agent share the caps for now; either may tighten its own. */
export const IN_APP_LIMITS: DocumentLimits = DOCUMENT_LIMITS
export const EMAIL_LIMITS: DocumentLimits = DOCUMENT_LIMITS

export type BatchProblem =
  | { code: "too-many-files"; max: number }
  | { code: "empty-file"; name: string }
  | { code: "file-too-large"; name: string; maxBytes: number }
  | { code: "total-too-large"; maxBytes: number }

/** Checks a set of files against the caps by name and size, before anything is read. */
export function checkBatch(files: readonly { name: string; size: number }[], limits: DocumentLimits = DOCUMENT_LIMITS): BatchProblem[] {
  const problems: BatchProblem[] = []
  if (files.length > limits.files) problems.push({ code: "too-many-files", max: limits.files })
  for (const { name, size } of files) {
    if (size === 0) problems.push({ code: "empty-file", name })
    else if (size > limits.fileBytes) problems.push({ code: "file-too-large", name, maxBytes: limits.fileBytes })
  }
  const total = files.reduce((sum, file) => sum + file.size, 0)
  if (total > limits.totalBytes) problems.push({ code: "total-too-large", maxBytes: limits.totalBytes })
  return problems
}

/** What a file was read as, decided from its bytes (never from its name or MIME type). */
export type DocumentKind = "pdf" | "docx" | "xlsx" | "csv" | "txt" | "md" | "json"

/** Something the reader of the text should know; the text is still usable. */
export type DocumentWarning =
  /** The PDF has more pages than the cap; only the first ones were read. */
  | "pages-truncated"
  /** The text was cut to the character cap. */
  | "text-truncated"
  /** No text found: an image-only or scanned PDF (no OCR), or an empty document. */
  | "no-text"
  /** Not UTF-8; read as Windows-1252 (common for CSV exports from Excel). */
  | "legacy-encoding"

/** Why a file was not read. */
export type DocumentError =
  | "empty"
  | "too-large"
  /** Not a type we read (images, presentations, archives, executables, unknown binary). */
  | "unsupported"
  /** A macro-enabled Office file (docm, xlsm or a renamed one). */
  | "macro"
  /** A binary Office file (doc, xls, ppt, xlsb). */
  | "binary-office"
  /** Password protected (PDF, Office or ZIP entries). */
  | "encrypted"
  | "corrupt"
  /** More ZIP entries than the cap. */
  | "too-many-entries"
  /** Uncompressed content above the cap, or entries that inflate beyond their stated size. */
  | "zip-bomb"
  /** A sheet that spans more cells than the cap. */
  | "sheet-too-large"

/** Text read from one document, sanitized, with secrets masked and cut to the cap. */
export interface DocumentText {
  /** Cleaned file name (no path, no control characters). */
  name: string
  kind: DocumentKind
  text: string
  /** Pages of a PDF (all, not only the ones read). */
  pages?: number
  /** Sheet names of a workbook. */
  sheets?: string[]
  truncated: boolean
  warnings: DocumentWarning[]
}

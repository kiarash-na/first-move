import { detectDelimiter } from "./csv"
import type { DocumentLimits } from "./limits"
import { decodeText, type TextEncodingName } from "./text"
import type { DocumentError } from "./types"
import { isZip, readZipDirectory, type ZipEntry, type ZipProblem } from "./zip-guard"

export type Sniffed =
  | { ok: true; kind: "pdf" }
  | { ok: true; kind: "docx" | "xlsx"; entries: ZipEntry[] }
  | { ok: true; kind: "txt" | "md" | "csv" | "json"; text: string; encoding: TextEncodingName }
  | { ok: false; error: DocumentError }

const PDF = new TextEncoder().encode("%PDF-")
/** Compound File Binary: doc, xls, ppt, msg, and password-protected Office files. */
const CFB = Uint8Array.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
/** The stream name of a password-protected OOXML file inside a CFB container, in UTF-16LE. */
const ENCRYPTED_PACKAGE = Uint8Array.from([..."EncryptedPackage"].flatMap((char) => [char.charCodeAt(0), 0]))
/** The PDF header may follow up to 1 KiB of other bytes. */
const PDF_HEADER_WINDOW = 1024

const ZIP_ERRORS: Record<ZipProblem, DocumentError> = {
  corrupt: "corrupt",
  "too-many-entries": "too-many-entries",
  "too-large": "zip-bomb",
  encrypted: "encrypted",
  "unsupported-compression": "corrupt",
}

function indexOf(bytes: Uint8Array, pattern: Uint8Array, end = bytes.byteLength): number {
  const last = Math.min(end, bytes.byteLength) - pattern.byteLength
  outer: for (let at = 0; at <= last; at++) {
    for (let index = 0; index < pattern.byteLength; index++) if (bytes[at + index] !== pattern[index]) continue outer
    return at
  }
  return -1
}

const fail = (error: DocumentError): Sniffed => ({ ok: false, error })

function sniffZip(bytes: Uint8Array, limits: DocumentLimits): Sniffed {
  const directory = readZipDirectory(bytes, limits)
  if (!directory.ok) return fail(ZIP_ERRORS[directory.problem])
  const names = directory.entries.map((entry) => entry.name)
  const lower = names.map((name) => name.toLowerCase())
  if (!names.includes("[Content_Types].xml")) return fail("unsupported")
  if (lower.some((name) => name.endsWith("vbaproject.bin") || name.startsWith("xl/macrosheets/"))) return fail("macro")
  if (lower.includes("xl/workbook.bin")) return fail("binary-office")
  if (names.some((name) => name.startsWith("word/"))) return { ok: true, kind: "docx", entries: directory.entries }
  if (names.some((name) => name.startsWith("xl/"))) return { ok: true, kind: "xlsx", entries: directory.entries }
  return fail("unsupported")
}

function textKind(text: string): "json" | "csv" | "md" | "txt" {
  const trimmed = text.trim()
  if (/^[[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed)
      return "json"
    } catch {
      // Not JSON after all: read as text.
    }
  }
  if (detectDelimiter(text)) return "csv"
  if (/^(?:#{1,6}\s|```)/m.test(text) || /\[[^\]\n]+\]\([^)\s]+\)/.test(text)) return "md"
  return "txt"
}

/**
 * Decides what a file is from its bytes, never from its name or MIME type (PLAN-AGENT-03 step 2):
 * `%PDF-` is a PDF; a ZIP with `[Content_Types].xml` is Word (`word/`) or Excel (`xl/`), unless
 * it carries macros or a binary workbook; a compound binary file is a legacy or encrypted Office
 * file; decodable text is JSON, CSV, Markdown or plain text by content. Everything else is
 * unsupported.
 */
export function sniffDocument(bytes: Uint8Array, limits: DocumentLimits): Sniffed {
  if (bytes.byteLength === 0) return fail("empty")
  if (indexOf(bytes, PDF, PDF_HEADER_WINDOW + PDF.byteLength) !== -1) return { ok: true, kind: "pdf" }
  if (isZip(bytes)) return sniffZip(bytes, limits)
  if (indexOf(bytes, CFB, CFB.byteLength) === 0) return fail(indexOf(bytes, ENCRYPTED_PACKAGE) === -1 ? "binary-office" : "encrypted")
  const decoded = decodeText(bytes)
  if (!decoded) return fail("unsupported")
  return { ok: true, kind: textKind(decoded.text), text: decoded.text, encoding: decoded.encoding }
}

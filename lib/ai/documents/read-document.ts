import { EXPORT_FORMAT } from "@/lib/storage/export"
import { parseImportText, type ImportResult } from "@/lib/storage/import"
import { redactSecrets } from "../text/redact"
import { sanitizeText } from "../text/sanitize"
import { truncateText } from "../text/truncate"
import { detectDelimiter, parseCsv } from "./csv"
import { readDocx } from "./docx"
import { cleanFileName } from "./file-name"
import { DOCUMENT_LIMITS, type DocumentLimits } from "./limits"
import { readPdf } from "./pdf"
import { sniffDocument } from "./sniff"
import { tableText } from "./table-text"
import type { DocumentError, DocumentKind, DocumentText, DocumentWarning } from "./types"
import { isWorksheet, readXlsx, sheetExtent } from "./xlsx"
import { verifyZip, type ZipEntry } from "./zip-guard"

export interface DocumentInput {
  name: string
  bytes: Uint8Array
}

export type ReadDocumentResult =
  | { ok: true; type: "text"; document: DocumentText }
  /** A First Move file: validated and migrated like an import (D-13), never "extracted". */
  | { ok: true; type: "project"; name: string; result: ImportResult }
  | { ok: false; name: string; error: DocumentError }

type Extracted =
  | { ok: true; text: string; warnings: DocumentWarning[]; pages?: number; sheets?: string[] }
  | { ok: false; error: DocumentError }

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value)

/** The shapes `parseImportText` takes: an export envelope, or a bare project with a schema version. */
function isProjectFile(text: string): boolean {
  try {
    const data: unknown = JSON.parse(text)
    return isObject(data) && (data.format === EXPORT_FORMAT || (isObject(data.meta) && "schemaVersion" in data.meta))
  } catch {
    return false
  }
}

async function zipChecked(bytes: Uint8Array, entries: readonly ZipEntry[], limits: DocumentLimits): Promise<DocumentError | null> {
  const check = await verifyZip(bytes, entries, isWorksheet)
  if (!check.ok) return check.problem === "too-large" ? "zip-bomb" : "corrupt"
  for (const xml of check.kept.values()) {
    const { rows, columns } = sheetExtent(new TextDecoder().decode(xml))
    if (rows * Math.max(columns, 1) > limits.sheetCells) return "sheet-too-large"
  }
  return null
}

async function readPdfText(bytes: Uint8Array, limits: DocumentLimits): Promise<Extracted> {
  const pdf = await readPdf(bytes, limits.pdfPages)
  if (!pdf.ok) return pdf
  const empty = pdf.pages.every((page) => page.trim() === "")
  return {
    ok: true,
    text: empty ? "" : pdf.pages.map((page, index) => `[page ${index + 1}]\n${page.trim()}`).join("\n\n"),
    pages: pdf.total,
    warnings: pdf.total > pdf.pages.length ? ["pages-truncated"] : [],
  }
}

async function extract(kind: DocumentKind, bytes: Uint8Array, entries: readonly ZipEntry[], text: string, limits: DocumentLimits): Promise<Extracted> {
  switch (kind) {
    case "pdf":
      return readPdfText(bytes, limits)
    case "docx": {
      const problem = await zipChecked(bytes, entries, limits)
      if (problem) return { ok: false, error: problem }
      const docx = await readDocx(bytes)
      return docx.ok ? { ok: true, text: docx.text, warnings: [] } : docx
    }
    case "xlsx": {
      const problem = await zipChecked(bytes, entries, limits)
      if (problem) return { ok: false, error: problem }
      const xlsx = await readXlsx(bytes)
      return xlsx.ok ? { ok: true, text: xlsx.text, sheets: xlsx.sheets, warnings: [] } : xlsx
    }
    case "csv":
      return { ok: true, text: tableText(parseCsv(text, detectDelimiter(text) ?? ",")), warnings: [] }
    default:
      return { ok: true, text, warnings: [] }
  }
}

/**
 * Reads one document into text for a model (PLAN-AGENT-03 step 2), in the browser or on the
 * server: size cap, type from the bytes, zip-bomb and sheet-size guards before any parser runs,
 * the parser for the type (each loaded only when needed), then sanitizing, secret masking and the
 * character cap. A First Move file goes through `parseImportText` instead.
 */
export async function readDocument({ name, bytes }: DocumentInput, limits: DocumentLimits = DOCUMENT_LIMITS): Promise<ReadDocumentResult> {
  const file = cleanFileName(name)
  const failed = (error: DocumentError): ReadDocumentResult => ({ ok: false, name: file, error })
  if (bytes.byteLength === 0) return failed("empty")
  if (bytes.byteLength > limits.fileBytes) return failed("too-large")

  const sniffed = sniffDocument(bytes, limits)
  if (!sniffed.ok) return failed(sniffed.error)
  const text = "text" in sniffed ? sniffed.text : ""
  if (sniffed.kind === "json" && isProjectFile(text)) return { ok: true, type: "project", name: file, result: parseImportText(text) }

  const extracted = await extract(sniffed.kind, bytes, "entries" in sniffed ? sniffed.entries : [], text, limits)
  if (!extracted.ok) return failed(extracted.error)

  // Sanitizing and masking a huge extract is slow; a first cut at twice the cap keeps it cheap.
  const precut = extracted.text.length > limits.textChars * 2
  const raw = precut ? extracted.text.slice(0, limits.textChars * 2) : extracted.text
  const clean = truncateText(redactSecrets(sanitizeText(raw).text), limits.textChars, { alreadyCut: precut })
  const warnings: DocumentWarning[] = [
    ...("encoding" in sniffed && sniffed.encoding === "windows-1252" ? (["legacy-encoding"] as const) : []),
    ...extracted.warnings,
    ...(clean.truncated ? (["text-truncated"] as const) : []),
    ...(clean.text === "" ? (["no-text"] as const) : []),
  ]
  return {
    ok: true,
    type: "text",
    document: {
      name: file,
      kind: sniffed.kind,
      text: clean.text,
      ...(extracted.pages !== undefined && { pages: extracted.pages }),
      ...(extracted.sheets && { sheets: extracted.sheets }),
      truncated: clean.truncated,
      warnings,
    },
  }
}

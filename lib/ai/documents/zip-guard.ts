import type { DocumentLimits } from "./limits"

/** One entry of a ZIP central directory. */
export interface ZipEntry {
  name: string
  method: number
  compressedSize: number
  uncompressedSize: number
  localHeaderOffset: number
}

export type ZipProblem = "corrupt" | "too-many-entries" | "too-large" | "encrypted" | "unsupported-compression"

export type ZipDirectory = { ok: true; entries: ZipEntry[] } | { ok: false; problem: ZipProblem }

const LOCAL = 0x04034b50
const CENTRAL = 0x02014b50
const END = 0x06054b50
const ZIP64_LOCATOR = 0x07064b50
const ZIP64_END = 0x06064b50
const MAX16 = 0xffff
const MAX32 = 0xffffffff
/** Encrypted (bit 0) or strongly encrypted (bit 6). */
const ENCRYPTED = 0x41

const viewOf = (bytes: Uint8Array) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
const u64 = (view: DataView, at: number) => Number(view.getBigUint64(at, true))
const fail = (problem: ZipProblem): ZipDirectory => ({ ok: false, problem })

export function isZip(bytes: Uint8Array): boolean {
  return bytes.byteLength >= 4 && viewOf(bytes).getUint32(0, true) === LOCAL
}

/** The end-of-central-directory record: within the last 64 KiB plus its own 22 bytes. */
function findEnd(view: DataView): number {
  for (let at = view.byteLength - 22; at >= Math.max(0, view.byteLength - 22 - MAX16); at--) {
    if (view.getUint32(at, true) === END) return at
  }
  return -1
}

function readZip64End(view: DataView, end: number) {
  const locator = end - 20
  if (locator < 0 || view.getUint32(locator, true) !== ZIP64_LOCATOR) return null
  const at = u64(view, locator + 8)
  if (at + 56 > locator || view.getUint32(at, true) !== ZIP64_END) return null
  return { count: u64(view, at + 32), size: u64(view, at + 40), offset: u64(view, at + 48), end: at }
}

/** Sizes and offset that do not fit 32 bits sit in the ZIP64 extra field (id 1), in this order. */
function readZip64Extra(view: DataView, start: number, length: number, entry: ZipEntry): boolean {
  for (let at = start; at + 4 <= start + length; ) {
    const id = view.getUint16(at, true)
    const size = view.getUint16(at + 2, true)
    if (id === 1) {
      let field = at + 4
      for (const key of ["uncompressedSize", "compressedSize", "localHeaderOffset"] as const) {
        if (entry[key] !== MAX32) continue
        if (field + 8 > at + 4 + size) return false
        entry[key] = u64(view, field)
        field += 8
      }
      return true
    }
    at += 4 + size
  }
  return false
}

/**
 * Reads a ZIP central directory without a dependency (PLAN-AGENT-03 step 2), so the entry count
 * and the declared uncompressed size are checked before any parser sees the file. Rejects
 * encrypted entries and compression other than stored or deflate (all Office files use these).
 */
export function readZipDirectory(bytes: Uint8Array, limits: Pick<DocumentLimits, "zipEntries" | "zipUncompressedBytes">): ZipDirectory {
  const view = viewOf(bytes)
  const end = findEnd(view)
  if (end < 0) return fail("corrupt")
  let count = view.getUint16(end + 10, true)
  let size = view.getUint32(end + 12, true)
  let offset = view.getUint32(end + 16, true)
  let limit = end
  if (count === MAX16 || size === MAX32 || offset === MAX32) {
    const zip64 = readZip64End(view, end)
    if (!zip64) return fail("corrupt")
    ;({ count, size, offset } = zip64)
    limit = zip64.end
  }
  if (count > limits.zipEntries) return fail("too-many-entries")
  if (offset + size > limit) return fail("corrupt")

  const entries: ZipEntry[] = []
  let total = 0
  let at = offset
  for (let index = 0; index < count; index++) {
    if (at + 46 > limit || view.getUint32(at, true) !== CENTRAL) return fail("corrupt")
    const flags = view.getUint16(at + 8, true)
    const nameLength = view.getUint16(at + 28, true)
    const extraLength = view.getUint16(at + 30, true)
    const next = at + 46 + nameLength + extraLength + view.getUint16(at + 32, true)
    if (next > limit) return fail("corrupt")
    const entry: ZipEntry = {
      name: new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength)),
      method: view.getUint16(at + 10, true),
      compressedSize: view.getUint32(at + 20, true),
      uncompressedSize: view.getUint32(at + 24, true),
      localHeaderOffset: view.getUint32(at + 42, true),
    }
    const wide = entry.compressedSize === MAX32 || entry.uncompressedSize === MAX32 || entry.localHeaderOffset === MAX32
    if (wide && !readZip64Extra(view, at + 46 + nameLength, extraLength, entry)) return fail("corrupt")
    if (flags & ENCRYPTED) return fail("encrypted")
    if (entry.method !== 0 && entry.method !== 8) return fail("unsupported-compression")
    if (entry.method === 0 && entry.compressedSize !== entry.uncompressedSize) return fail("corrupt")
    if (entry.localHeaderOffset + 30 > offset) return fail("corrupt")
    total += entry.uncompressedSize
    if (total > limits.zipUncompressedBytes) return fail("too-large")
    entries.push(entry)
    at = next
  }
  return { ok: true, entries }
}

export type Inflated = { ok: true; data: Uint8Array } | { ok: false; problem: "too-large" | "corrupt" }

async function inflateRaw(data: Uint8Array, maxBytes: number): Promise<Inflated> {
  const stream = new DecompressionStream("deflate-raw")
  const writer = stream.writable.getWriter()
  writer.write(data as Uint8Array<ArrayBuffer>).catch(() => {})
  writer.close().catch(() => {})
  const reader = stream.readable.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel().catch(() => {})
        return { ok: false, problem: "too-large" }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, problem: "corrupt" }
  }
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.byteLength
  }
  return { ok: true, data: out }
}

/** The data of one entry, inflated with the platform's `DecompressionStream`, stopped above `maxBytes`. */
export async function inflateEntry(bytes: Uint8Array, entry: ZipEntry, maxBytes: number): Promise<Inflated> {
  const view = viewOf(bytes)
  const at = entry.localHeaderOffset
  if (at + 30 > bytes.byteLength || view.getUint32(at, true) !== LOCAL) return { ok: false, problem: "corrupt" }
  const start = at + 30 + view.getUint16(at + 26, true) + view.getUint16(at + 28, true)
  const end = start + entry.compressedSize
  if (end > bytes.byteLength) return { ok: false, problem: "corrupt" }
  const data = bytes.subarray(start, end)
  if (entry.method === 0) return data.byteLength <= maxBytes ? { ok: true, data } : { ok: false, problem: "too-large" }
  return inflateRaw(data, maxBytes)
}

export type ZipCheck = { ok: true; kept: Map<string, Uint8Array> } | { ok: false; problem: "too-large" | "corrupt" }

/**
 * Inflates every entry once and checks that none grows beyond the size it states (a lying header
 * is how a zip bomb passes a directory check); the declared total is already capped. Entries that
 * `keep` selects are returned, so a later check can read them without inflating them again.
 */
export async function verifyZip(bytes: Uint8Array, entries: readonly ZipEntry[], keep: (name: string) => boolean = () => false): Promise<ZipCheck> {
  const kept = new Map<string, Uint8Array>()
  for (const entry of entries) {
    if (entry.uncompressedSize === 0 && entry.compressedSize === 0) continue
    const result = await inflateEntry(bytes, entry, entry.uncompressedSize)
    if (!result.ok) return result
    if (result.data.byteLength !== entry.uncompressedSize) return { ok: false, problem: "corrupt" }
    if (keep(entry.name)) kept.set(entry.name, result.data)
  }
  return { ok: true, kept }
}

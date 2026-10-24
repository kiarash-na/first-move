// @vitest-environment node
import { describe, expect, it } from "vitest"
import { makeZip } from "./test-utils/zip"
import { inflateEntry, isZip, readZipDirectory, verifyZip } from "./zip-guard"

const LIMITS = { zipEntries: 10, zipUncompressedBytes: 1024 * 1024 }

/** Rewrites a ZIP's end record to point at ZIP64 records, as tools do for large archives. */
function toZip64(zip: Uint8Array): Uint8Array {
  const end = zip.byteLength - 22
  const view = new DataView(zip.buffer, zip.byteOffset)
  const count = view.getUint16(end + 10, true)
  const size = view.getUint32(end + 12, true)
  const offset = view.getUint32(end + 16, true)
  const out = new Uint8Array(zip.byteLength + 56 + 20)
  out.set(zip.subarray(0, end))
  const records = new DataView(out.buffer)
  records.setUint32(end, 0x06064b50, true)
  records.setBigUint64(end + 4, BigInt(44), true)
  records.setBigUint64(end + 24, BigInt(count), true)
  records.setBigUint64(end + 32, BigInt(count), true)
  records.setBigUint64(end + 40, BigInt(size), true)
  records.setBigUint64(end + 48, BigInt(offset), true)
  records.setUint32(end + 56, 0x07064b50, true)
  records.setBigUint64(end + 64, BigInt(end), true)
  records.setUint32(end + 72, 1, true)
  const tail = end + 76
  records.setUint32(tail, 0x06054b50, true)
  records.setUint16(tail + 8, 0xffff, true)
  records.setUint16(tail + 10, 0xffff, true)
  records.setUint32(tail + 12, 0xffffffff, true)
  records.setUint32(tail + 16, 0xffffffff, true)
  return out
}

describe("readZipDirectory", () => {
  it("lists the entries with sizes and methods", async () => {
    const zip = await makeZip([
      { name: "a.xml", data: "<a/>".repeat(100) },
      { name: "b.bin", data: "stored", deflate: false },
    ])
    expect(isZip(zip)).toBe(true)
    const directory = readZipDirectory(zip, LIMITS)
    expect(directory.ok && directory.entries.map(({ name, method, uncompressedSize }) => ({ name, method, uncompressedSize }))).toEqual([
      { name: "a.xml", method: 8, uncompressedSize: 400 },
      { name: "b.bin", method: 0, uncompressedSize: 6 },
    ])
  })

  it("reads ZIP64 end records", async () => {
    const directory = readZipDirectory(toZip64(await makeZip([{ name: "a.xml", data: "<a/>" }])), LIMITS)
    expect(directory.ok && directory.entries.map((entry) => entry.name)).toEqual(["a.xml"])
  })

  it("rejects more entries than the cap before reading them", async () => {
    const zip = await makeZip(Array.from({ length: 11 }, (_, index) => ({ name: `${index}.xml`, data: "", deflate: false })))
    expect(readZipDirectory(zip, LIMITS)).toEqual({ ok: false, problem: "too-many-entries" })
  })

  it("rejects a declared uncompressed size above the cap (an honest zip bomb)", async () => {
    const zip = await makeZip([{ name: "zeros.xml", data: new Uint8Array(2 * 1024 * 1024) }])
    expect(zip.byteLength).toBeLessThan(10_000)
    expect(readZipDirectory(zip, LIMITS)).toEqual({ ok: false, problem: "too-large" })
  })

  it("rejects encrypted entries and other compression methods", async () => {
    expect(readZipDirectory(await makeZip([{ name: "a", data: "x", encrypted: true }]), LIMITS)).toEqual({ ok: false, problem: "encrypted" })
    expect(readZipDirectory(await makeZip([{ name: "a", data: "x", method: 12 }]), LIMITS)).toEqual({ ok: false, problem: "unsupported-compression" })
  })

  it("rejects truncated or garbage archives", async () => {
    const zip = await makeZip([{ name: "a.xml", data: "<a/>" }])
    expect(readZipDirectory(zip.subarray(0, zip.byteLength - 30), LIMITS)).toEqual({ ok: false, problem: "corrupt" })
    expect(readZipDirectory(new TextEncoder().encode("PK\u{3}\u{4} not really a zip"), LIMITS)).toEqual({ ok: false, problem: "corrupt" })
  })
})

describe("verifyZip and inflateEntry", () => {
  it("inflates honest entries and returns the ones asked for", async () => {
    const zip = await makeZip([
      { name: "xl/worksheets/sheet1.xml", data: "<sheet/>" },
      { name: "other.xml", data: "<o/>", deflate: false },
    ])
    const directory = readZipDirectory(zip, LIMITS)
    if (!directory.ok) throw new Error("fixture")
    const check = await verifyZip(zip, directory.entries, (name) => name.startsWith("xl/"))
    expect(check.ok && [...check.kept].map(([name, data]) => [name, new TextDecoder().decode(data)])).toEqual([
      ["xl/worksheets/sheet1.xml", "<sheet/>"],
    ])
    const stored = await inflateEntry(zip, directory.entries[1], 100)
    expect(stored.ok && new TextDecoder().decode(stored.data)).toBe("<o/>")
  })

  it("stops an entry that inflates beyond the size it states (a lying zip bomb)", async () => {
    const zip = await makeZip([{ name: "word/document.xml", data: new Uint8Array(512 * 1024), declaredSize: 100 }])
    const directory = readZipDirectory(zip, LIMITS)
    expect(directory.ok).toBe(true)
    if (!directory.ok) return
    expect(await verifyZip(zip, directory.entries)).toEqual({ ok: false, problem: "too-large" })
  })

  it("rejects an entry smaller than stated and broken deflate data", async () => {
    const short = await makeZip([{ name: "a.xml", data: "abc", declaredSize: 10 }])
    const shortDirectory = readZipDirectory(short, LIMITS)
    if (!shortDirectory.ok) throw new Error("fixture")
    expect(await verifyZip(short, shortDirectory.entries)).toEqual({ ok: false, problem: "corrupt" })

    const broken = await makeZip([{ name: "a.xml", data: "x".repeat(1000) }])
    const directory = readZipDirectory(broken, LIMITS)
    if (!directory.ok) throw new Error("fixture")
    const start = 30 + "a.xml".length
    broken.fill(0xff, start, start + 8)
    expect(await verifyZip(broken, directory.entries)).toEqual({ ok: false, problem: "corrupt" })
  })
})

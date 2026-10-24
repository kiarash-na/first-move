// @vitest-environment node
import { describe, expect, it } from "vitest"
import { DOCUMENT_LIMITS } from "./limits"
import { sniffDocument } from "./sniff"
import { makeDocx, makeXlsx } from "./test-utils/office"
import { makePdf } from "./test-utils/pdf"
import { makeZip } from "./test-utils/zip"

const sniff = (bytes: Uint8Array) => sniffDocument(bytes, DOCUMENT_LIMITS)
const kind = (bytes: Uint8Array) => {
  const result = sniff(bytes)
  return result.ok ? result.kind : result.error
}
const text = (value: string) => new TextEncoder().encode(value)
const CONTENT_TYPES = { name: "[Content_Types].xml", data: "<Types/>" }

describe("sniffDocument", () => {
  it("finds PDFs by their header, also after leading bytes", () => {
    const pdf = makePdf(["Hello"])
    expect(kind(pdf)).toBe("pdf")
    expect(kind(new Uint8Array([...text("junk ".repeat(100)), ...pdf]))).toBe("pdf")
  })

  it("finds Word and Excel files by their parts", async () => {
    expect(kind(await makeDocx(["Hello"]))).toBe("docx")
    expect(kind(await makeXlsx([{ name: "S", rows: [["a"]] }]))).toBe("xlsx")
  })

  it("rejects macro-enabled files, also renamed ones", async () => {
    expect(kind(await makeDocx(["x"], [{ name: "word/vbaProject.bin", data: "macro" }]))).toBe("macro")
    expect(kind(await makeXlsx([{ name: "S", rows: [] }], [{ name: "xl/vbaProject.bin", data: "macro" }]))).toBe("macro")
    expect(kind(await makeXlsx([{ name: "S", rows: [] }], [{ name: "xl/macrosheets/sheet1.xml", data: "<x/>" }]))).toBe("macro")
  })

  it("rejects binary workbooks, presentations and plain archives", async () => {
    expect(kind(await makeZip([CONTENT_TYPES, { name: "xl/workbook.bin", data: "b" }]))).toBe("binary-office")
    expect(kind(await makeZip([CONTENT_TYPES, { name: "ppt/presentation.xml", data: "<p/>" }]))).toBe("unsupported")
    expect(kind(await makeZip([{ name: "word/document.xml", data: "<d/>" }]))).toBe("unsupported")
  })

  it("rejects legacy binary Office files and tells encrypted ones apart", () => {
    const cfb = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]
    expect(kind(new Uint8Array([...cfb, ...new Uint8Array(504)]))).toBe("binary-office")
    const name = [..."EncryptedPackage"].flatMap((char) => [char.charCodeAt(0), 0])
    expect(kind(new Uint8Array([...cfb, ...new Uint8Array(100), ...name]))).toBe("encrypted")
  })

  it("passes ZIP problems on", async () => {
    expect(kind(await makeZip([CONTENT_TYPES, { name: "word/document.xml", data: "x", encrypted: true }]))).toBe("encrypted")
    expect(kind(await makeZip([CONTENT_TYPES, { name: "word/document.xml", data: new Uint8Array(51 * 1024 * 1024) }]))).toBe("zip-bomb")
  })

  it("rejects images and other binary data", () => {
    expect(kind(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]))).toBe("unsupported")
    expect(kind(new Uint8Array(0))).toBe("empty")
  })

  it("tells JSON, CSV, Markdown and plain text apart by content", () => {
    expect(kind(text('{"a": 1}'))).toBe("json")
    expect(kind(text("type;count\nresidential;120\noffice;3"))).toBe("csv")
    expect(kind(text("# Site\n\nThe site has 120 buildings."))).toBe("md")
    expect(kind(text("The site has 120 buildings."))).toBe("txt")
    expect(kind(text("{ not json"))).toBe("txt")
  })

  it("returns the decoded text and its encoding", () => {
    expect(sniff(text("a;b\n1;2"))).toEqual({ ok: true, kind: "csv", text: "a;b\n1;2", encoding: "utf-8" })
  })
})

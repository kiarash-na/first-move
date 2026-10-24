// @vitest-environment node
import { describe, expect, it } from "vitest"
import { decodeText } from "./text"

const utf16le = (text: string) => {
  const out = new Uint8Array(2 + text.length * 2)
  out.set([0xff, 0xfe])
  for (const [index, char] of [...text].entries()) new DataView(out.buffer).setUint16(2 + index * 2, char.charCodeAt(0), true)
  return out
}

describe("decodeText", () => {
  it("reads UTF-8 and drops a byte-order mark", () => {
    expect(decodeText(new TextEncoder().encode("Fläche;12 ha"))).toEqual({ text: "Fläche;12 ha", encoding: "utf-8" })
    expect(decodeText(Uint8Array.from([0xef, 0xbb, 0xbf, 0x61]))).toEqual({ text: "a", encoding: "utf-8" })
  })

  it("reads UTF-16 with a byte-order mark", () => {
    expect(decodeText(utf16le("Wärme;1"))).toEqual({ text: "Wärme;1", encoding: "utf-16le" })
    expect(decodeText(Uint8Array.from([0xfe, 0xff, 0x00, 0x61, 0x00, 0xe4]))).toEqual({ text: "aä", encoding: "utf-16be" })
  })

  it("falls back to Windows-1252 for legacy CSV exports", () => {
    // "Fläche;Größe" in Windows-1252: ä = E4, ö = F6, ß = DF.
    const bytes = Uint8Array.from([0x46, 0x6c, 0xe4, 0x63, 0x68, 0x65, 0x3b, 0x47, 0x72, 0xf6, 0xdf, 0x65, 0x20, 0x80])
    expect(decodeText(bytes)).toEqual({ text: "Fläche;Größe €", encoding: "windows-1252" })
  })

  it("rejects binary data", () => {
    expect(decodeText(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]))).toBeNull()
    expect(decodeText(Uint8Array.from({ length: 200 }, (_, index) => (index * 37) % 32 || 1))).toBeNull()
  })
})

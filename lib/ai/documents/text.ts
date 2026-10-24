export type TextEncodingName = "utf-8" | "utf-16le" | "utf-16be" | "windows-1252"

export interface DecodedText {
  text: string
  encoding: TextEncodingName
}

/** Share of control characters (other than tab and line breaks) above which bytes are not text. */
const MAX_CONTROL_SHARE = 0.01

/**
 * Windows-1252 bytes 0x80–0x9F (€, „, “, –, …); 0 marks the five undefined bytes. Browsers decode
 * them so, but Node's "windows-1252" decoder is Latin-1 and returns C1 controls, so both paths
 * decode Latin-1 and map this range here.
 */
const WINDOWS_1252 = [
  0x20ac, 0, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0, 0x017d, 0,
  0, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0, 0x017e, 0x0178,
]

function decodeWindows1252(bytes: Uint8Array): string {
  return new TextDecoder("latin1").decode(bytes).replace(/[\u{80}-\u{9F}]/gu, (char) => {
    const code = WINDOWS_1252[char.charCodeAt(0) - 0x80]
    return code ? String.fromCharCode(code) : char
  })
}

function decode(encoding: TextEncodingName, bytes: Uint8Array): string | null {
  try {
    return new TextDecoder(encoding, { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

function plausible(text: string): boolean {
  const controls = text.match(/(?![\t\n\r])\p{Cc}/gu)?.length ?? 0
  return controls <= text.length * MAX_CONTROL_SHARE
}

/**
 * Decodes the bytes of a text file (PLAN-AGENT-03 step 2): UTF-16 when a byte-order mark says so,
 * else strict UTF-8 (a BOM is dropped), else Windows-1252, which German Excel CSV exports often
 * use. Bytes with NUL characters or many control characters are not text: null.
 */
export function decodeText(bytes: Uint8Array): DecodedText | null {
  const utf16 = bytes[0] === 0xff && bytes[1] === 0xfe ? "utf-16le" : bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : null
  if (utf16) {
    const text = decode(utf16, bytes)
    return text !== null && !text.includes("\u{0}") && plausible(text) ? { text, encoding: utf16 } : null
  }
  if (bytes.includes(0)) return null
  const utf8 = decode("utf-8", bytes)
  if (utf8 !== null) return plausible(utf8) ? { text: utf8, encoding: "utf-8" } : null
  const legacy = decodeWindows1252(bytes)
  return plausible(legacy) ? { text: legacy, encoding: "windows-1252" } : null
}

export interface PdfFixtureOptions {
  /** Add a Standard security handler that no empty password opens (an encrypted PDF). */
  encrypted?: boolean
  /** Pages without any text operator (like a scanned PDF). */
  imageOnly?: boolean
}

const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")

/** Latin-1 bytes: the PDF syntax is ASCII, text uses WinAnsiEncoding (ä is 0xE4). */
const latin1 = (text: string) => Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xff)

const hex = (seed: number, bytes: number) =>
  Array.from({ length: bytes }, (_, index) => ((seed * 31 + index * 17) & 0xff).toString(16).padStart(2, "0")).join("")

/** Builds a PDF with one page per entry; each line of an entry becomes one text line. */
export function makePdf(pages: readonly string[], { encrypted = false, imageOnly = false }: PdfFixtureOptions = {}): Uint8Array {
  const objects: string[] = []
  const add = (body: string) => objects.push(body)
  const pageIds = pages.map((_, index) => 4 + index * 2)

  add("<< /Type /Catalog /Pages 2 0 R >>")
  add(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`)
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
  for (const [index, text] of pages.entries()) {
    const lines = text.split("\n").map((line) => `(${escape(line)}) Tj T*`).join(" ")
    const stream = imageOnly ? "0 0 1 rg 72 72 200 200 re f" : `BT /F1 12 Tf 14 TL 72 720 Td ${lines} ET`
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${pageIds[index] + 1} 0 R >>`)
    add(`<< /Length ${latin1(stream).byteLength} >>\nstream\n${stream}\nendstream`)
  }
  if (encrypted) add(`<< /Filter /Standard /V 1 /R 2 /O <${hex(1, 32)}> /U <${hex(2, 32)}> /P -4 >>`)

  let out = "%PDF-1.4\n"
  const offsets: number[] = []
  for (const [index, body] of objects.entries()) {
    offsets.push(latin1(out).byteLength)
    out += `${index + 1} 0 obj\n${body}\nendobj\n`
  }
  const xref = latin1(out).byteLength
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}`
  const security = encrypted ? ` /Encrypt ${objects.length} 0 R /ID [<${hex(3, 16)}> <${hex(3, 16)}>]` : ""
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R${security} >>\nstartxref\n${xref}\n%%EOF\n`
  return latin1(out)
}

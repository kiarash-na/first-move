export type DocxText = { ok: true; text: string } | { ok: false; error: "corrupt" }

/**
 * The raw text of a Word document with mammoth (PLAN-AGENT-03 step 2), loaded only when a DOCX is
 * read. Its browser build takes `arrayBuffer`, the Node build `buffer`, so both are passed. Mammoth
 * never reads files outside the document (`externalFileAccess` is off by default) and runs no code.
 */
export async function readDocx(bytes: Uint8Array): Promise<DocxText> {
  const { extractRawText } = await import("mammoth")
  const copy = bytes.slice()
  try {
    const input = { arrayBuffer: copy.buffer, buffer: copy } as unknown as Parameters<typeof extractRawText>[0]
    const { value } = await extractRawText(input)
    return { ok: true, text: value }
  } catch {
    return { ok: false, error: "corrupt" }
  }
}

export type PdfText = { ok: true; pages: string[]; total: number } | { ok: false; error: "encrypted" | "corrupt" }

const errorName = (error: unknown) => (typeof error === "object" && error !== null && "name" in error ? String(error.name) : "")

/**
 * The text of the first `maxPages` pages of a PDF, page by page (PLAN-AGENT-03 step 2), with
 * unpdf's serverless PDF.js build, loaded only when a PDF is read. No fonts are loaded and nothing
 * is rendered; a password-protected PDF gives `encrypted` (no OCR, no password prompts).
 */
export async function readPdf(bytes: Uint8Array, maxPages: number): Promise<PdfText> {
  const { getDocumentProxy } = await import("unpdf")
  let pdf: Awaited<ReturnType<typeof getDocumentProxy>>
  try {
    // A copy: PDF.js may transfer (detach) the buffer it gets.
    pdf = await getDocumentProxy(bytes.slice(), { disableFontFace: true, useSystemFonts: false, verbosity: 0 })
  } catch (error) {
    return { ok: false, error: errorName(error) === "PasswordException" ? "encrypted" : "corrupt" }
  }
  try {
    const pages: string[] = []
    for (let number = 1; number <= Math.min(pdf.numPages, maxPages); number++) {
      const page = await pdf.getPage(number)
      const content = await page.getTextContent()
      pages.push(content.items.map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : "") : "")).join(""))
      page.cleanup()
    }
    return { ok: true, pages, total: pdf.numPages }
  } catch {
    return { ok: false, error: "corrupt" }
  } finally {
    await pdf.loadingTask.destroy()
  }
}

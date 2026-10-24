import type { ExportFile } from "./export"

/** How long the object URL stays valid after the click (Safari starts the download late). */
const REVOKE_AFTER_MS = 10_000

/**
 * Saves a file through the browser's download (no network: a local object URL). Call from an
 * event handler.
 */
export function downloadFile(file: ExportFile, doc: Document = document): void {
  const url = URL.createObjectURL(new Blob([file.text], { type: file.mimeType }))
  const link = doc.createElement("a")
  link.href = url
  link.download = file.fileName
  link.rel = "noopener"
  link.hidden = true
  doc.body.append(link)
  try {
    link.click()
  } finally {
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS)
  }
}

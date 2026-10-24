import "server-only"

/**
 * Reads a request body as text, but never more than `maxBytes` (PLAN-AGENT-06 step 5): a declared
 * `content-length` above the cap is refused before reading, and a body without one (or with a
 * wrong one) is cut off as soon as it passes the cap. Returns null when the body is too large.
 */
export async function readBody(request: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? "0")
  if (!Number.isFinite(declared) || declared > maxBytes) return null
  if (!request.body) return ""

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  return new TextDecoder().decode(Buffer.concat(chunks))
}

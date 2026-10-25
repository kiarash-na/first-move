#!/usr/bin/env node
/**
 * `pnpm check:references`: opens every external reference of `lib/docs/references.ts` (and of the
 * reference cases) again and prints its HTTP status after redirects. A publisher that blocks
 * robots (403) is listed, not failed: its DOI still resolves. Exits with 1 when a link is gone
 * (404, 410) or unreachable. Network only; never part of `pnpm test`.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const FILES = ["lib/docs/references.ts", "lib/examples/reference-cases/sources.ts"]

const urls = new Set()
for (const file of FILES) {
  let text
  try {
    text = readFileSync(path.join(ROOT, file), "utf8")
  } catch {
    continue
  }
  for (const match of text.matchAll(/doi\("([^"]+)"\)/g)) urls.add(`https://doi.org/${match[1]}`)
  for (const match of text.matchAll(/"(https:\/\/[^"]+)"/g)) urls.add(match[1])
}

let broken = 0
for (const url of [...urls].sort()) {
  let status
  try {
    const response = await fetch(url, { method: "GET", redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (First Move reference check)" }, signal: AbortSignal.timeout(30_000) })
    status = response.status
  } catch (error) {
    status = `error: ${error.cause?.code ?? error.message}`
  }
  const bad = typeof status !== "number" || status === 404 || status === 410
  if (bad) broken++
  console.log(`${bad ? "BROKEN" : typeof status === "number" && status >= 400 ? "blocked" : "ok"}\t${status}\t${url}`)
}
console.log(`\n${urls.size} links, ${broken} broken`)
process.exit(broken > 0 ? 1 : 0)

---
id: NOTE-2026-10-24-agents-03-ai-core
date: 2026-10-24
author: Claude (phase A03)
relates_to: [PLAN-AGENT-03, PLAN-AGENT-00, D-05, D-13, D-21, D-32, D-47, D-51, D-57, D-60, OQ-01, R-03]
---

# Agents 03 · Shared AI core (`lib/ai/`)

Everything both agents share, isomorphic (browser and Node), with no keys, no network calls and no React. Nothing in the app imports it yet; phases A05 (assistant) and A06/A07 (email agent) do. No visible change.

## What was built

| Part | Where |
|---|---|
| Untrusted text: invisible and control characters out, NFKC, counts for the guard | `lib/ai/text/sanitize.ts` |
| Secret masking (Anthropic, OpenRouter, OpenAI-style, Resend, AI Gateway, webhook keys, JWTs, bearer/basic, random hex and base64 runs) | `lib/ai/text/redact.ts` |
| Link policy: only allow-listed origins and `/en/…`, `/de/…` paths stay links; Markdown links keep their text, images their alt text, other URLs are defanged | `lib/ai/text/links.ts` |
| New text of an email: EN/DE attribution lines (also wrapped), Outlook headers, separators, `>` quotes, signatures | `lib/ai/text/email-body.ts` |
| Truncation at a boundary with a `[truncated]` marker | `lib/ai/text/truncate.ts` |
| Type from the bytes, never the name: PDF, Word, Excel, CSV, Markdown, text, JSON; macro, binary, encrypted and unknown files rejected | `lib/ai/documents/sniff.ts`, `text.ts` (UTF-8, UTF-16, Windows-1252) |
| Caps for both agents | `lib/ai/documents/limits.ts` |
| ZIP guard without a dependency: central directory (also ZIP64), entry count, declared size, encrypted entries, compression method; then every entry inflated once (platform `DecompressionStream`) and stopped above its stated size | `lib/ai/documents/zip-guard.ts` |
| Parsers, each loaded on first use: PDF (`unpdf`), Word (`mammoth`), Excel (`read-excel-file`), CSV (own RFC 4180 parser), tables as tab-separated text | `pdf.ts`, `docx.ts`, `xlsx.ts`, `csv.ts`, `table-text.ts` |
| One entry point: size → type → guards → parser → sanitize → mask → cap; a First Move file goes through `parseImportText` (D-13) | `lib/ai/documents/read-document.ts`, `file-name.ts` |
| Knowledge: BM25 search with EN/DE tokenising and light stemming, generated index per language, EN fallback per source | `lib/ai/knowledge/` (`tokenize.ts`, `search.ts`, `load.ts`, `generated/{en,de}.json`) |
| Knowledge generator `pnpm gen:knowledge` (with `--check`) | `scripts/gen-knowledge.mjs`, `scripts/gen-knowledge.test.ts` |
| Field catalogue from the registry, labels and help in the UI language | `lib/ai/extract/field-catalogue.ts`, `field-label.ts` |
| Output schema (Zod, strict objects, field ids as an enum) | `lib/ai/extract/output-schema.ts` |
| Model value → patch value: both decimal separators, unit conversion, choices by key or label, yes/no, ja/nein | `lib/ai/extract/to-patch.ts`, `units.ts` |
| Merge (conflicts listed), patch assembly (lists appended), dry-run through `applyPatch`, the whole pipeline | `merge.ts`, `build-patch.ts`, `validate.ts`, `propose.ts` |
| Extraction prompt and request | `lib/ai/extract/prompt.ts` |
| Prompt blocks: untrusted wrappers with tag neutralising, the scope sentence, the language rule, a per-deployment canary and a leak check | `lib/ai/prompts/untrusted.ts`, `scope.ts`, `canary.ts` |
| Provenance option and one patch per source document | `lib/ai/provenance/mark.ts` |
| Licence table entries for the three parsers | `lib/legal/third-party.ts` |

## Spreadsheet parser: `read-excel-file` 9.3.12

Chosen over SheetJS 0.20.3 (CDN tarball): MIT and on the npm registry, so it is pinned and audited like every other package (SheetJS publishes fixed versions only from its own CDN; the npm `xlsx@0.18.5` is stale with known CVEs). It reads `.xlsx` only, so the parser surface is small: we reject xls, xlsb and ods anyway. Its `/universal` entry works in the browser and in Node without workers. It reads cell values only: cached formula results, no formula evaluation, no macros.

**Guard added for it.** The parser fills every gap up to the last row and column it sees, so a 1 KB workbook with one cell in `A1048576` and one in `XFD1` would make it allocate about 17 billion cells. `sheetExtent()` reads each worksheet's XML (already inflated by the ZIP guard) and the file is rejected when last row × last column exceeds 2,000,000 (`sheetCells`). Row numbers count too, because empty `<row r="…"/>` elements also create gap rows.

## Decisions and deviations

- **Lying ZIP headers.** The plan's directory check catches archives that state their size honestly. A zip bomb can also understate its sizes, and JSZip (inside mammoth) only compares sizes after inflating everything. So `verifyZip()` inflates each entry with the platform's `DecompressionStream` and stops at its stated size. Office files are deflate, so this costs one extra pass, at most 50 MB. Tests cover both kinds of bomb (60 MB of zeros in a 60 KB file) and a lying header.
- **Encrypted Office files** are compound binary containers with an `EncryptedPackage` stream; they are reported as `encrypted`, not as a legacy binary file.
- **Windows-1252.** German Excel CSV exports are often Windows-1252. Browsers decode it correctly, but Node's `TextDecoder("windows-1252")` is Latin-1 (0x80 becomes a control character instead of €), so both decode Latin-1 and map 0x80–0x9F from a table.
- **NFKC keeps ¹ ² ³**, otherwise `m²` would become `m2`. Superscript digits cannot disguise letters.
- **Huge extracts** are cut to twice the cap before sanitizing and masking (the expensive passes), then cut at a boundary to the cap. `truncateText(…, { alreadyCut })` still adds the marker.
- **Item lists** take one catalogue entry per row property, id `<list>[].<property>` (for example `businessPlan.risks[].title`), and the output schema has an optional `item` number (1, 2, …) that groups the properties of one new row. New rows get fresh ids and are appended. Text lists append new entries and skip ones already there.
- **Default scope** leaves out the `assumptions` step (the parameter playground). A caller asks for it explicitly.
- **Conflicts.** Different values for one field across files or messages are listed as candidates with their sources; nothing is picked. Equal values join and keep every source. Rows from different outputs stay separate.
- **Ambiguous numbers.** `1.234` and `1,234` read differently in EN and DE, so they go to `unclear` with the reason `ambiguous-number`. The prompt asks models to return JSON numbers, which avoids this.
- **Units** convert only when a unit was stated and differs, within one dimension: m² ↔ ha ↔ km², kWh ↔ MWh ↔ GWh per year (energy without "/a" counts as annual for annual fields), m ↔ km, €/kWh ↔ ct/kWh ↔ €/MWh, years. A unit of another dimension or an unknown one is never guessed. A field without a unit (counts, COPs) ignores the stated unit.
- **Knowledge sources.** Besides the planned `calc` texts and field help, the allow-list takes the public result explanations: the result levels, the class interpretations per indicator and the "Screening, not a full feasibility study" text. These are public UI copy, so D-57 holds. The DE index is empty for now because the DE dictionaries hold almost none of these texts. German falls back to English per source (D-32).
- **Anchors for A04.** Docs chunks link to `/{lang}/docs/{slug}#{anchor}`, where the anchor is `slugify(heading)`: NFKD, accents dropped, lower case, letters, digits and hyphens. A04 must render heading ids the same way; a test pins the function.
- **Canary.** It is the SHA-256 of a seed the caller passes (the email agent uses one of its secrets), via Web Crypto, so it works in both runtimes. `findLeak()` checks for the canary and for whole sentences of private instructions only. The scope sentence and the docs are public and may be quoted.
- **Email text in a request is untrusted.** `extractionRequest()` keeps the in-app user's own message outside the blocks, but an email's text always goes in as `<untrusted_email>`.
- **Structured outputs.** The Zod schema keeps its bounds (`max`, `int`). Anthropic's strict JSON Schema does not support every keyword, so A05 and A07 convert it with the SDK helpers, which drop unsupported keywords and validate on the client.

## Versions

`unpdf` 1.9.1 (bundles PDF.js 6.4.299; the optional `@napi-rs/canvas` peer is not installed), `mammoth` 1.13.0 (external file access off by default), `read-excel-file` 9.3.12. All exact; `pnpm audit` clean. A separate commit before this phase pinned the patched `zod` 4.6.7 and `undici` 7.30.1 under `workflow` 5.2.3 with pnpm overrides (GHSA-mrhx-c7xc-m3w5, GHSA-4qv8-2p9j-2685, GHSA-f72v-6w45-q472, GHSA-xjj6-f33q-929c); drop them when `workflow` ships the fixes.

## Timing (Node 24, WSL2)

| File | Size | Time |
|---|---|---|
| PDF, 60 pages of dense text (114,000 lines) | 9.25 MB | 1.6 s |
| XLSX, one sheet of 120,000 rows × 8 columns | 5.18 MB | 1.9 s |

Before the first cut of huge extracts the same files took 2.8 s and 5.6 s. Both hit the 200,000-character cap. Measured through `readDocument`, guards included.

## Follow-ups

- **A06:** mammoth warns that crafted documents can cause high CPU use. On the server, read documents inside a workflow step so the function timeout bounds it, and do not retry a step that timed out on the same document.
- **A04:** heading ids must match `slugify()`; after adding pages, run `pnpm gen:knowledge` (the test fails when the index is stale).
- **A05:** the parsers load on first use, so check in the browser bundle that none of them is in the first-load JS (performance budget test).
- **Tooling.** While writing this phase, `\uXXXX` escapes in written files came out as literal characters, invisible ones included. Every new file was scanned and uses braced `\u{…}` escapes (with the regex `u` flag). Check later phases' diffs the same way.

## Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (514 files, 2,318 tests; 227 new in `lib/ai` and the generator), `pnpm build`: green.
- `boundary.test.ts` passes: `lib/ai` imports only core (`lib/project`, `lib/i18n`, `lib/storage`) and its own packages.
- Tests cover the plan's step 7 cases: corrupt and truncated files, an encrypted PDF, generated zip bombs (honest and lying), a docm renamed to docx, mixed EN/DE numbers, unit conversions, unknown and ambiguous options, injection text in a document (stays inert text), and Unicode tag smuggling (removed).

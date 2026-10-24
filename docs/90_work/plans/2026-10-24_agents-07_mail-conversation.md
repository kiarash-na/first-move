---
id: PLAN-AGENT-07
date: 2026-10-24
status: todo
challenge: [quick-check-tool, business-models]
covers: [D-05, D-13, D-15, D-17, D-21, D-27, D-30, D-32, D-33, D-37, D-52, D-57, D-58, QCT-CALC-00]
blocked_by: [PLAN-AGENT-04, PLAN-AGENT-06]
---

# Agents 07 · Email conversation, extraction and on-brand results

## Goal

After consent and a passing guard, the agent talks a person through First Move by email:
1. short answers to questions, only from the public docs;
2. "which module?" (Quick Check, Business Plan, both) and "do you want a project file for the dashboard?";
3. a numbered list of questions with example answers, or attached files processed in the background;
4. a progress reply listing what it understood, what is unclear and what is still missing;
5. on-brand results computed by the app's own engine, with the `.firstmove.json` file if they said yes.

English now, locale-ready for German.

## Requirements covered

QCT-CALC-00 and the EQ files (results only from `run(project)`), D-05 and D-13 (registry, `applyPatch`, export file), D-21 (number formats), D-27/D-30/D-37 (Business Plan is qualitative; readiness checks unofficial), D-33 (calculation notes), D-15/D-17 (brand), D-52, D-57, D-58, D-32.

## Steps

1. **Read:** the claude-api skill (`typescript/claude-api/README.md`, `tool-use.md` for structured outputs) and the current `@anthropic-ai/sdk` README; React Email and `@react-email/render` docs; `lib/quick-check/{run,drivers}.ts`, `lib/dashboard/result-text.ts`, `lib/business-plan/{prompts,presets,readiness}.ts`, `lib/storage/export.ts`, `docs/02_design/first-move_ui-design-tokens.md`, `app/globals.css`.
2. **Dependencies** (exact pins, licences listed): `@anthropic-ai/sdk`, `@react-email/components`, `@react-email/render`; dev `react-email` only if the preview is worth it.
3. **Haiku client** (`text/anthropic.ts`, `server-only`): official SDK, `ANTHROPIC_API_KEY`, model from `EMAIL_AGENT_TEXT_MODEL` (`claude-haiku-5-5`); structured outputs through `client.messages.parse()` with `output_config.format` from the Zod schema (exact helper as documented in the SDK); `output_config.effort: "low"`; no `temperature`/`top_p`/`top_k` (400 since 2026-10-21); check `stop_reason` (`refusal` → template fallback; `max_tokens` → one retry with a larger limit); timeouts; usage → `budget.ts` ($0.10/$0.50 per million tokens up to 100K prompt tokens).
4. **Answers** (`text/answer.ts`): top chunks from `lib/ai/knowledge` → a fixed system prompt (scope; answer only from these excerpts; otherwise say the docs do not cover it; ≤ 120 words; name the page) → post-filter (`lib/ai/text/links` allow-list, length, canary check, no addresses other than ours) → on any failure a fixed "I can't answer that by email; see the docs" text.
5. **State** (`conversation/state.ts`, Zod, stored encrypted in `conv:{sid}`, 30 days sliding): `{ v, locale: "en", phase: "menu" | "collect" | "results", module, wantsFile, project (a draft from createProject), asked: fieldIds, rounds, threadId, references, updatedAt }`. One active conversation per sender; "new" starts over (consent stays).
6. **Machine** (`conversation/machine.ts`, pure): `(state, decision, parsed) → { replies, next }`.
   - Questions are answered in any phase, followed by a one-line reminder of where we were.
   - `menu`: the first processed email gets the menu: 1 Quick Check, 2 Business Plan, 3 Both, plus "would you like a project file to import in the dashboard? (yes/no)". A deterministic parser accepts "1", "2, yes", "both, no" and the like, and Jev's `intent` covers free text.
   - `collect`: send the numbered questions; apply valid values; reply with understood / unclear / missing; when the Quick Check's required inputs are complete, compute and send results (→ `results`).
   - `results`: further answers recompute and resend; "file" attaches the file; "stop" deletes the conversation.
   - Corrections like "3: 40 buildings" or "change area to 4 ha" are handled by the extractor, scoped to the asked fields.
7. **Question lists** (`questions-qc.ts`, `questions-bp.ts`) generated from `lib/ai/extract/field-catalogue` and the dictionaries, numbered, each with an example answer from `dictionaries/en/mail.json`:
   - Quick Check, first round (about 7 questions): project name (optional), number of buildings, area in m² (ha accepted), building mix by type and period (must add up to 100 %, with the type and period labels listed), heat sources and their potential, PV yes/no, optional known heating and cooling demand (kWh/a) and network length (m).
   - Business Plan: one round per step (opportunity, business logic, reality check, implementation), using the guiding prompts and the example scenarios (BM-SCN-01..04) as examples; values are the person's own words (D-27).
   - Follow-ups ask only for missing or invalid fields.
8. **Extraction by email** (`text/extract.ts`): cleaned body + attachments (through `lib/ai/documents`, each screened by Jev for injection, phase 06 step 9) → `lib/ai/extract` with the Haiku adapter → `to-patch` → `applyPatch` on the draft with provenance `{ by: "email", model, file? }` → the progress reply (understood values numbered and formatted with units via `lib/i18n/format`; problems with the reason and an example; still missing). A `.firstmove.json` attachment is imported through `parseImportText` instead of extraction.
9. **Results** (`conversation/results.ts`): Quick Check via `run(project)` (never the model); verdict text, drivers and flags from the existing helpers; calculation notes from the `calc` dictionary with EQ IDs. Business Plan: the filled sections, critical assumptions, risks with mitigation, the readiness checklist from `lib/business-plan/readiness.ts` (labelled unofficial, D-37), and Quick Check numbers read-only when both modules are on.
10. **Templates** (`emails/`, React Email, each with a plain-text version):
    - `theme.ts`: hex colours derived from the `app/globals.css` tokens (a test pins them), square corners, 1px lines; a light report palette (D-16) for broad client support; fonts Archivo → Arial/Helvetica fallback, IBM Plex Mono → monospace; no web fonts, no images, no remote URLs (text-only brand header, CSS-drawn verdict bar).
    - `layout.tsx`: brand header, body, footer with the AI disclosure (written by an AI system, may be wrong, not binding; privacy and legal requests to human@) and links to the Terms and the Privacy Policy.
    - Templates: `confirm`, `warning`, `ban`, `block`, `unavailable`, `menu`, `answer`, `questions`, `progress`, `qc-results` (verdict banner in cyan, KPI cards, drivers, assumptions and calculation notes, the inputs used, the screening disclaimer), `bp-summary` (orange accents for the Business Plan and risks, canvas sections, risks, readiness), `admin-alert`.
    - Rendered with `@react-email/render` to HTML and text; React escapes all user and model text; tests check structure, escaping (an injected `<script>` stays text), absence of remote URLs except allow-listed links, and a size limit.
11. **Project file**: `buildExport(project, now)` → `.firstmove.json` attached when `wantsFile` is true (asked in the menu); AI-collected values carry provenance, so the dashboard shows the AI chip after import.
12. **Locale grounds**: every template and question takes `locale`; copy from `getDictionary(locale, "mail")` (DE falls back to EN, D-32); prompts take the locale; number formatting uses the locale.
13. **Scenario tests** with fakes (fake Resend with fixture emails incl. `authentication`, memory store, mock Jev, fake Anthropic client): a full Quick Check by email; a full Business Plan; both; questions in between; attachments (PDF, DOCX, XLSX, CSV, `.firstmove.json`); corrections; stop and new; expiry after 30 days; plus the phase-06 abuse paths end to end (off-topic twice → ban; injection → block and silence; DMARC fail; Reply-To mismatch → `emails.send` to From; flood; human@ ignored; duplicate webhook; budget reached).

## Open questions this depends on

None.

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Rendered emails checked as HTML in Playwright screenshots at 375 and 600 px (attached to the note). One live round trip through the owner's CLI with a real Quick Check result and file (repeated in phase 09).

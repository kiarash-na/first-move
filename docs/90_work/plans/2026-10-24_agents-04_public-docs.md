---
id: PLAN-AGENT-04
date: 2026-10-24
status: in-progress
challenge: [quick-check-tool, business-models]
covers: [D-19, D-22, D-32, D-57]
blocked_by: [PLAN-AGENT-03]
---

# Agents 04 · Public docs and knowledge index

## Goal

Write the first public docs (English) under `/[lang]/docs`, built from the requirement files, decisions and app copy but written for the public. They are what both agents answer questions from (D-57); nothing from the internal `docs/` folder reaches an agent.

## Requirements covered

D-22 (MDX pipeline, content now), D-19 and D-32 (EN now, DE falls back), D-57. Content must match the methodology exactly: equations and tables are summarised and cited by ID (`EQ-3.4a`, `TBL-6`), never re-derived.

## Steps

1. **Read:** `app/[lang]/(docs)/docs/[[...slug]]/` (how pages are found, `generateStaticParams`, `notFound()`), `mdx-components.tsx`, `content/docs/`, the requirement folders (`10_quick-check-tool/`, `20_business-models/`, `01_shared/5gdhc-context.md`), `dictionaries/en/{calc,quick-check,business-plan,ai,privacy}.json`, PLAN-AGENT-00 (assistant and email behaviour).
2. **Pages** in `content/docs/en/` (one file each, plain prose, short sections with `##` headings, no internal paths, no thresholds or limits beyond what users need):
   1. `index.mdx`: what First Move is, the two modules, data stays in the browser, where to start.
   2. `what-is-5gdhc.mdx`: fifth-generation district heating and cooling in plain words: low-temperature network, heat pumps in buildings, sharing heat and cold, typical sources, where it fits and where it does not.
   3. `quick-check.mdx`: every input (meaning, unit, where to find it); how the result is computed (demand, network length, supply, coverage, economics, indicators, verdict), citing EQ and TBL IDs; what the verdict and the drivers mean; limits ("screening, not engineering advice").
   4. `business-plan.mdx`: the four steps, the example scenarios (BM-SCN-01..04), the unofficial pitch-readiness checklist (D-30, D-37), Quick Check numbers shown read-only.
   5. `assistant.mdx`: the in-app assistant: bring your own key (Anthropic, OpenRouter, Auto Router), model chips, keeping the key for this session or behind a 6-digit PIN, **set a spending limit at your provider**, what the assistant can see, attaching documents, reviewing proposed values, the AI marks, chat history and how to clear it, removing the key.
   6. `email-agent.mdx`: writing to `agent@mail.firstmove.energy`: what it can do, the one-time confirmation (Terms and project emails, no marketing), that your mail provider must authenticate your mail (DMARC; most do), Quick Check and Business Plan by email (numbered questions, example answers, attachments and their limits), the results email and the project file you can import, the rules (stay on topic: one warning, then a 30-day pause; abuse or attempts to manipulate the assistant: blocked), retention in short, `human@` for privacy and legal requests.
   7. `data-and-privacy.mdx`: where project data lives, export and import, snapshots and backups, deleting data, how the two AI layers handle data, links to the legal pages.
3. **Docs navigation**: if the docs layout has no page list yet, add a small one (co-located `_components/`, copy in a dictionary, D-34); every page reachable; previous/next links optional.
4. **German**: no translation now (D-32); follow the pipeline's existing DE fallback, or show the EN page with a short "German version coming" note from the dictionary.
5. **Knowledge index**: `pnpm gen:knowledge` now includes the pages; commit the generated files; the up-to-date test covers them.
6. **Tests:** every slug renders (EN, and the DE fallback); internal links and anchors resolve; a content guard (no `docs/9`, no `.env` names, no secret-looking strings, no internal file paths); axe on two pages in both themes; knowledge search finds the right page for ten fixed questions (for example "What does the verdict mean?", "Which files can I email?", "How do I remove my key?").

## Open questions this depends on

None. If a methodology point is unclear while writing, cite the existing OQ answer; if none exists, open or extend an `OQ-xx` file and write around it.

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`. The owner reviews the pages later; the note lists every claim that rests on a decision rather than a requirement file.

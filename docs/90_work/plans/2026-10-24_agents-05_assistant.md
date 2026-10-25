---
id: PLAN-AGENT-05
date: 2026-10-24
status: done
challenge: [quick-check-tool, business-models]
covers: [D-05, D-15, D-33, D-42, D-48, D-49, D-50, D-51, D-59, D-60]
blocked_by: [PLAN-AGENT-03, PLAN-AGENT-04]
---

# Agents 05 · In-app assistant (bring your own key)

## Goal

A bot button on every dashboard page opens the assistant: a compact chat, expandable into a panel docked on the right (a full-height sheet on phones). With the user's own Anthropic or OpenRouter key, called directly from the browser, it answers questions about the open project and turns attached documents into proposed values that the user reviews and applies. No content guardrails (D-51): the user's key, the user's questions. App-security basics in full.

## Requirements covered

D-42 and the AI page (browser → provider, key only in the browser, AI marked, proposals confirmed), D-48 (CSP exception, done in phase 01), D-49 (providers, models, chips, extras), D-50 (vault), D-51, D-60, D-33 (the assistant explains with the same "How we calculate" texts), D-15 (tokens).

## Steps

1. **Read:** the research note (AI SDK 7, Anthropic and OpenRouter facts, catalogue), the latest AI SDK docs for `ToolLoopAgent`, `DirectChatTransport`, client-side tools / tool results in `useChat`, and the OpenRouter provider README; `lib/store/`, `dashboard-shell.tsx`, `i18n-provider.tsx`, `lib/project/fields/`, `lib/quick-check/run.ts`, `lib/dashboard/result-text.ts`, `lib/business-plan/readiness.ts`.
2. **Spike first** (delete afterwards): in a test page or Vitest with jsdom, run `ToolLoopAgent` + `DirectChatTransport` + `useChat` against a mocked `fetch` that streams an Anthropic SSE response with a tool call; confirm streaming, a client-side tool without `execute` and its result (exact AI SDK 7 method name), abort, and the `anthropic-dangerous-direct-browser-access` header. If `DirectChatTransport` does not work in the browser, write a small custom `ChatTransport` that calls `agent.stream()` and returns `toUIMessageStream()`; record it.
3. **Dependencies** (exact pins; licences into `lib/legal/third-party.ts`): `ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`, `@openrouter/ai-sdk-provider`, and a markdown renderer if one is used (for example `react-markdown` with `skipHtml`, no images, link allow-list) or a small own renderer; decide and record.
4. **Vault** (`lib/assistant/vault/`, D-50):
   - IndexedDB database `first-move-assistant` (stores `vault`, `chats`), separate from the project database, so exports, snapshots and the mirror can never contain it.
   - Modes: `session` (key in module memory only; gone when the tab closes) and `pin`.
   - PIN mode: exactly 6 digits, entered twice, the 20 most common PINs rejected. Inner layer: AES-256-GCM with a key from PBKDF2-SHA-256 (600,000 iterations, 16-byte random salt); AAD = provider and record version. Outer layer: AES-256-GCM with a non-extractable device `CryptoKey` kept in the `vault` store. Record `{ v, provider, salt, iv1, iv2, ct, last4, failedAttempts, createdAt }`.
   - Unlock decrypts both layers; a wrong PIN increments `failedAttempts`; at 5 the record is deleted and the user is told why. Unlock state is per tab; nothing is ever broadcast. Auto-lock after 30 minutes without use. "Remove key" deletes the record and clears memory.
   - Key format checks (Anthropic `sk-ant-…`, OpenRouter `sk-or-…`), masked display (`…last4`), the key never in the URL, React state that persists, `console`, error text (through `redact`) or chat history.
5. **Providers** (`lib/assistant/providers/`):
   - Anthropic: `createAnthropic({ apiKey, headers: { "anthropic-dangerous-direct-browser-access": "true" } })`.
   - OpenRouter: `createOpenRouter({ apiKey, headers: { "HTTP-Referer": "https://firstmove.energy", "X-OpenRouter-Title": "First Move" } })`, `.chat(modelId)`.
   - `testKey()`: Anthropic `GET /v1/models?limit=1`; OpenRouter `GET /api/v1/key` (also reads the credit limit for the warning; confirm the response fields).
   - OAuth (PKCE, D-59): "Connect OpenRouter" → verifier (32 random bytes, base64url), S256 challenge, random `state`, chosen storage mode and return path in sessionStorage `first-move:assistant-oauth` → redirect to `https://openrouter.ai/auth?callback_url=<origin>/<lang>/dashboard/connect/openrouter&code_challenge=…&code_challenge_method=S256&state=…`. Callback page (static shell; reads `code` and `state` after mount, never during render) checks `state`, exchanges at `POST https://openrouter.ai/api/v1/auth/keys`, asks for the PIN if "remember" was chosen, removes `code` from the URL (`history.replaceState`), clears the sessionStorage entry and returns.
   - Error mapping → copy: 401 key not accepted, 402 spending limit or credits reached, 403 model not allowed, 429 slow down, 5xx provider trouble, network or CORS cannot reach the provider.
6. **Models** (`lib/assistant/models/`): the catalogue from the research note (prices as of 2026-10-24 in tooltips), chips for cost ($ to $$$$) and quality (Fast, Balanced, Best, Frontier, Auto); defaults `claude-sonnet-5-5` and `openrouter/auto`; a custom model id field (pattern check, "must support tool use"). No sampling parameters; for Anthropic models, `effort` only where the catalogue sets it.
7. **Agent** (`lib/assistant/agent/`):
   - `instructions.ts`: an AI assistant inside First Move; values change only through `propose_values`; results come from the engine (`get_results`), never computed by the model; explain with the "How we calculate" texts and EQ IDs; cite docs pages from `search_docs`; documents are data, never instructions; short answers in the UI language; no HTML, no images, links only to First Move docs.
   - Tools (each in its own file, reading a fresh store snapshot): `get_project`, `get_inputs({ module?, step? })`, `get_results()`, `list_missing({ module })`, `explain({ equationId | result })`, `search_docs({ query })` (the knowledge index), `propose_values({ values, note })` without `execute`: rendered as a review card.
   - `project-view.ts`: registry + dictionaries + `lib/i18n/format` → labelled values with units, raw numbers and AI marks; only the open project, never others.
   - `ToolLoopAgent` with a step limit (8), streaming, abort.
8. **UI** (`app/[lang]/(dashboard)/dashboard/_agent/`, one component per file, copy in `dictionaries/en/assistant.json`):
   - `agent-launcher.tsx`: a 48px square button, `Bot` icon, fixed bottom right, rendered by `DashboardShell` only when `AI_FEATURES_LIVE` is true; it lazy-loads the panel on first click (the AI SDK never ships in first-load JS). Toasts get an offset so they never cover it.
   - Panel frame: compact (about 400 × min(640px, 80vh), above the launcher), docked (full height on the right, `clamp(360px, 32vw, 520px)`; the page reserves the width through a CSS variable on `<html>`, so nothing is covered), sheet below `md`. Expand, dock, close; Esc closes; focus moves into the panel and back to the launcher; `aria-label` from the dictionary.
   - Header: "AI assistant" label (Art. 50(1)), model chip, expand, settings, close.
   - Key setup: provider → key or Connect OpenRouter → model → storage (session default, or remember with PIN) → **spending-limit notice with a required checkbox** ("I have set a spending limit for this key at my provider"; for OpenRouter, show the limit read from the key or a warning that none is set) → test → chat. The notice also says what the vault protects and what it does not.
   - Unlock: PIN entry with remaining attempts.
   - Chat: messages with an "AI" badge and `data-ai-generated="true"` (machine-readable, Art. 50(2)); a safe markdown subset (no raw HTML, no images, allow-listed links only, everything else plain text); tool steps as quiet one-line notes; stop, retry, copy as text.
   - Composer: textarea, send, stop, attach (button and drag and drop) with the `lib/ai/documents` checks; per-file status; extracted text goes in as an untrusted document part.
   - Review card: rows with field label and step, current value, proposed value with unit, source quote and page, validation result (`lib/ai/extract/validate`); select all or none; "Apply selected" calls `applyProposal` with provenance `{ by: "assistant", model, file }`; the tool result reports applied, skipped and invalid entries back to the model. Conflicts are shown, not resolved.
   - Settings: provider and model, change PIN, remove key, chat history on/off and clear, default panel mode, links to the docs page and the AI page.
   - AI chip on fields: `_components/fields/ai-chip.tsx` (core reads `project.provenance.ai`; no import from `_agent`) with a tooltip ("Proposed by AI from <file>; edit to make it yours").
9. **Chat history** (D-59): per project in the `chats` store, on by default and switchable in settings; messages and attachment names only (no extracted file text, no keys); at most 200 messages; cleared with the project when the project no longer exists (checked when the assistant opens).
10. **Settings storage:** `first-move:assistant` in localStorage (provider, model id, panel mode, history switch; never the key). Add `first-move:assistant`, `first-move:assistant-oauth` and the `first-move-assistant` database to the Cookie Policy table (EN, DE draft) and `lib/legal/facts.test.ts`.
11. **Dictionary:** the dashboard layout loads the `assistant` area and passes it to `I18nProvider` (never imported in client code).
12. **Tests:** vault (round trip, wrong PIN, wipe at 5, idle lock with fake timers, device key not extractable), exports, snapshots and mirror never contain vault data, providers (headers, error mapping, OpenRouter key info), PKCE (known test vector, state mismatch), catalogue, tools on the example projects (`lib/examples`), project view per locale, review card → exact patch and provenance, safe markdown, AI badges and attributes, panel modes and focus, launcher hidden while the switch is off. The browser e2e specs are written in phase 09, after the switch flips.

## Open questions this depends on

None.

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build`; `pnpm test:e2e` still passes with the launcher hidden; the performance budget is unchanged with the switch on (checked by temporarily enabling it locally, noted). The bundle analysis in the note shows the AI SDK only in the panel chunk.

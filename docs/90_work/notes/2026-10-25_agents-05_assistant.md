---
id: NOTE-2026-10-25-agents-05-assistant
date: 2026-10-25
author: Claude (phase A05, workflow worktree)
relates_to: [PLAN-AGENT-05, PLAN-AGENT-00, D-15, D-33, D-42, D-48, D-49, D-50, D-51, D-60, D-71, D-72, O7]
---

# Agents 05 · In-app assistant (bring your own key)

The in-app AI assistant is built and stays dark: `DashboardShell` renders its launcher only while `AI_FEATURES_LIVE` (`lib/legal/ai.ts`) is `true`, and that switch is still `false`. Phase A08 flips it together with the legal texts (see [What A08 must say](#what-a08-must-say)).

The owner's direction for this phase (O7) was: "I want it on the bottom right side ... use the bot icon and there was also a pin vault for the API keys ... Keep it minimal. Don't over-engineer that part. We want a quick solution." Then: "make openrouter BYOK function as well. make user notice on putting spend limits and expiry date on the key when creating." So the assistant is a deliberately small cut of [PLAN-AGENT-05](../plans/2026-10-24_agents-05_assistant.md); the [deviations](#deviations-from-plan-agent-05) are listed below.

## What was built

| Part | Where |
|---|---|
| PIN vault (D-50): 6-digit PIN typed twice, 20 common PINs refused, PBKDF2-SHA-256 600,000 iterations + AES-256-GCM inner layer, AES-256-GCM outer layer with a non-extractable device `CryptoKey`, AAD per provider, 5 wrong PINs delete the record, 30-minute idle lock, own IndexedDB database `first-move-assistant` | `lib/assistant/vault/{pin,crypto,db,vault,idle-lock}.ts` (+ tests, `isolation.test.ts`: exports, snapshots, the mirror and project records never contain vault data) |
| Key memory per provider (session default), unlock straight into memory (the key never passes through a component), "remember" from memory | `lib/assistant/keys/{memory,registry,unlock}.ts` |
| Providers: the Vercel AI Gateway (same key module as the AI Plan Score: `lib/assistant/gateway/key.ts`, `gatewayClient`, `models.ts`) and OpenRouter (paste a key, `@ai-sdk/openai-compatible`, `GET /api/v1/key` for the credit limit and expiry) | `lib/assistant/providers/{types,models,model,check-key,errors}.ts`, `lib/assistant/openrouter/{key,client,models}.ts` |
| Privacy per request: Gateway as for the AI Plan Score (`textProviderOptions`: zero data retention where the catalogue lists it, never training); OpenRouter `provider.data_collection: "deny"` | `lib/assistant/providers/model.ts` |
| Error mapping to copy codes (401 key, 402 credits, 403 model not allowed, 404 model, 429 rate, 5xx provider, network, aborted); OpenRouter's in-stream `{ code, message }` errors too; raw provider text never shown | `lib/assistant/providers/errors.ts` |
| Agent: instructions, a compact view of the open project (labelled values with units, empty required fields, Quick Check level and reasons, AI Plan Score), four tools, one turn with `streamText` (8 steps, 1 retry, abort) | `lib/assistant/agent/{instructions,project-view,run-turn,context}.ts`, `lib/assistant/agent/tools/{get-project,search-docs,explain,propose-values}.ts` |
| Tools: `get_project` (the open project as an untrusted block), `search_docs` (the public docs knowledge index), `explain` (the "How we calculate" text and equation ids of a step or result, D-33), `propose_values` (checked against the field registry and dry-run through `applyPatch`, shown as a review card; it changes nothing) | same |
| Safe rendering (D-51): a small Markdown subset (paragraphs, lists, bold, code, links to First Move pages) parsed into data and rendered as React text; no HTML, no images, no outside links | `lib/assistant/text/markdown.ts`, `_agent/chat/message-text.tsx` |
| Review card values in the UI language through `lib/i18n/format` | `lib/assistant/review/display-value.ts` |
| Launcher: 48px square, lucide `Bot`, fixed bottom right, `z-40`; lazy-loads the panel and the AI SDK on its first click (`next/dynamic`, `ssr: false`) | `app/[lang]/(dashboard)/dashboard/_agent/agent-launcher.tsx` |
| Toasts sit 76px up while the launcher is shown; the cookie notice never covers it (the launcher moves up when they would overlap, measured in effects) | `_components/dashboard-shell.tsx`, `_agent/use-notice-clearance.ts` |
| Panel: non-modal side sheet on the right from `md` (`clamp(360px, 32vw, 480px)`), full screen on phones; Esc and close return focus to the launcher; stays mounted while closed so the conversation survives | `_agent/panel/{assistant-panel,connection-view}.tsx` |
| Key setup: provider, key, keep for this tab (default) or remember with a PIN, the required **spending-limit and expiry notice** with a checkbox, check with the provider before use, credit limit / expiry / balance afterwards with warnings (OpenRouter key without limit or expiry) | `_agent/key/{key-setup,key-notice,pin-fields,key-status,model-select,unlock-form}.tsx` |
| Chat: messages, tool steps as quiet notes, "AI-generated" badge and `data-ai-generated="true"` on every answer (AI Act Art. 50), stop, retry, new conversation; memory only | `_agent/chat/{chat,chat-message,composer,use-assistant-chat}.ts(x)` |
| Review card: field, value now, proposed value; invalid, unclear and conflicting entries listed but not selectable; "Apply selected" calls `store.applyProposal(patch, aiProvenance("assistant", model))` with exactly the checked entries; the next message tells the model what the user did | `_agent/chat/review-card.tsx`, `use-assistant-chat.ts` |
| AI Plan Score connect panel: the same notice (Gateway wording) gates "Use key"; a Gateway key remembered in the vault can be unlocked there; memory stays the default and nothing is remembered from that page | `ai-score/_components/setup/key-form.tsx` (+ test), new keys `setup.notice.*`, `setup.unlock.*` in `dictionaries/{en,de}/ai-score.json` |
| Copy EN and DE | `dictionaries/{en,de}/assistant.json` |
| CSP: `AI_PROVIDER_ORIGINS` = `https://openrouter.ai`, `https://ai-gateway.vercel.sh` (Anthropic dropped) | `next.config.ts`, `next.config.test.ts` |
| Dictionary area `assistant` loaded by the dashboard layout only while live | `app/[lang]/(dashboard)/dashboard/layout.tsx` (+ `layout.live.test.tsx`) |
| Boundary: the shell may import only `_agent/agent-launcher` (the one touch point) | `boundary.test.ts` (`ALLOWED`), `eslint.config.mjs` |
| Dependency `@ai-sdk/openai-compatible` 3.0.77 (Apache-2.0), licence table | `package.json`, `pnpm-lock.yaml`, `lib/legal/third-party.ts` |
| E2E spec for the live state (A09 runs it) | `e2e/assistant.spec.ts` |

## How a message flows

1. The user opens the panel (first click loads the chunk), connects a key: the key is checked (`GET https://ai-gateway.vercel.sh/v1/credits` or `GET https://openrouter.ai/api/v1/key`), kept in module memory, and, only if asked, sealed in the vault under a PIN.
2. A message runs one turn in the browser: `streamText` with the user's key, straight to the provider. The tools read a fresh store snapshot each time; the model never computes results itself.
3. `propose_values` builds a proposal and shows a review card; nothing changes until the user applies. Applied values carry `provenance.ai` marks (`by: "assistant"`, the model id).
4. Nothing of the conversation is stored. Closing the panel keeps it; a reload ends it.

## Deviations from PLAN-AGENT-05

All follow the owner's "keep it minimal, a quick solution" (O7) unless noted.

| Plan | Built | Why |
|---|---|---|
| Anthropic direct + OpenRouter (D-49) | Vercel AI Gateway + OpenRouter | Owner (A05 brief): drop direct Anthropic; the Gateway key is the same one the AI Plan Score uses, so one key serves both. |
| OpenRouter OAuth (PKCE) | Paste a key only | "PKCE only if quick": it needs a callback page and sessionStorage state; left out. The notice and the key-info warnings cover the spending limit. |
| `ToolLoopAgent`, `DirectChatTransport`, `useChat`, client-side `propose_values` without `execute` | `streamText` in a small hook; `propose_values` executes only to record the proposal and returns "shown for review" | Fewer moving parts; the tool still changes nothing, and the card applies through the store. |
| `get_inputs`, `get_results`, `list_missing` | One `get_project` view (inputs, empty required fields, Quick Check level and reasons, AI Plan Score) | One compact tool; the same data. |
| Compact and docked panel modes, page width reserved | One side sheet over the page (full screen on phones) | Minimal. |
| Attachments in the composer | None | Minimal; documents go through the email agent (A07) or the AI Plan Score. |
| Chat history per project (`chats` store, D-49 extra) | Memory only | Minimal; nothing to clear or describe in the Cookie Policy. |
| Settings in `first-move:assistant` (localStorage), change PIN | Provider and model live in component state; to change the PIN, remove the key and remember it again | Nothing new in browser storage besides the vault database. |
| AI chip on fields (`_components/fields/ai-chip.tsx`) | Not built | Core code; the marks are in `project.provenance.ai` (and in exports). Open question 2. |
| "Spending limit" notice | "Spending limit **and expiry date**" notice, per provider docs, required checkbox, in both the assistant and the AI Plan Score | Owner, A05 brief. |

## Provider facts behind the notice (checked 2026-10-25)

- **Vercel AI Gateway** ([API key budgets](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets#api-key-budgets)): a budget (dollar limit with a daily, weekly, monthly or no refresh) is set in the Create key dialog; requests are rejected once it is exceeded; it is a soft cap. An expiry is only offered when the key is created with the Vercel CLI or API (`vercel ai-gateway api-keys create ... --expiration 30d`); a dashboard key does not expire, so the copy says to delete it when no longer needed.
- **OpenRouter** ([authentication](https://openrouter.ai/docs/api-reference/authentication)): a credit limit with an optional daily, weekly or monthly reset, and an expiration date, both set when the key is created; the expiration cannot be changed later. `GET /api/v1/key` returns `limit`, `limit_remaining`, `limit_reset` and `expires_at`, which the key status shows.

## How it was verified

- Unit and component tests (Vitest, jsdom, fake IndexedDB): vault round trip, wrong PIN, wipe at 5, idle lock with fake timers, device key not extractable, vault never in exports, snapshots or the mirror; providers with a scripted SSE `fetch` (headers, `data_collection: "deny"`, key info, error mapping including in-stream errors); tools on the example projects; project view per locale; safe Markdown (no `script`, `img`, outside or `javascript:` links); launcher hidden with the switch off (`dashboard-shell.test.tsx`, `layout.test.tsx`) and shown with it on (`dashboard-shell.live.test.tsx`, `layout.live.test.tsx`, by mocking `@/lib/legal/ai`); panel open, Esc, focus return; the notice and its checkbox gate (assistant and AI Plan Score); a full chat turn against a scripted OpenRouter stream that proposes a value, shows the card, applies exactly `{ "buildings.total": n }` with `{ by: "assistant", model: "openrouter/auto" }` and changes nothing before; the cookie notice and the launcher never overlap.
- UI tests that remember or unlock keys mock `PBKDF2_ITERATIONS` to 1,000 to stay fast; `crypto.test.ts` pins the real 600,000.
- Full `pnpm test` on the final commit: 772 files and 3,567 tests pass (exit 0). Earlier full runs of the same code each had one unrelated flake, worth a look by their owners: `lib/mail-agent/consent/pending.test.ts` asserts that random ciphertext does not contain the two characters `e1`, which it sometimes does (failed alone too); a sonner timer from `notice-toasts.test.tsx` fired after teardown once ("window is not defined"); `ai-score-view.test.tsx` timed out once under load (5 s limit; about 2.5 s alone).
- E2E with the switch **off** (the committed state, production build): the whole suite passes (143 passed, the 5 live assistant tests skipped); `e2e/assistant.spec.ts` checks that the launcher is absent and no request goes to a provider host.
- E2E with the switch **on**, flipped locally only and reverted (never committed): `e2e/assistant.spec.ts` passes in full: the launcher is 48 × 48 in the bottom-right corner, opens a side sheet at most 480px wide (full screen at 390 × 844), Esc and close return focus; "Check and use key" stays disabled until the notice is ticked; a mocked OpenRouter turn (via `page.route`, with CORS headers) sends `model: "openrouter/auto"` and `provider.data_collection: "deny"`, shows the review card, leaves the field unchanged, and after "Apply selected" the Quick Check field shows the new value; axe finds nothing with the panel open (dark and light), after one fix: the panel's title row was a `<header>`, a second banner landmark. `a11y`, `ai-score`, `performance` and `responsive` specs pass with the switch on. The only expected failures with the switch on are the two `legal.spec.ts` tests that read the AI page status ("score"); A08 changes that copy and test. Two tests failed once each under load with the switch on and passed on every rerun (`review-fixes.spec.ts` "a rejected number keeps the value…", 2 of 36 runs; `a11y.spec.ts` light 1440px, 1 of 3 runs); A09 should watch them.
- Bundle (production build, switch on): the dashboard pages load only the shell chunk with the launcher; the panel (with the OpenRouter client, about 75 KB) and the AI SDK (the chunk the AI Plan Score page already uses) load on the first click.
- **Not verified live:** no request went to a real provider with a real key. The owner should do one live run with each provider once A08 flips the switch (open question 1).

## Decisions

- One Gateway key module for the assistant and the AI Plan Score: a key connected in either place is in use in both for the tab.
- The vault only ever stores keys the user chose to remember in the assistant; the AI Plan Score page can unlock a remembered Gateway key but never stores one.
- Unlocked keys are dropped from memory after 30 minutes without pointer or keyboard use (the vault keeps them).
- The shell imports only the launcher; the panel, the AI SDK and `lib/assistant` load in their own chunk on first click.
- Looking for a remembered key never creates the vault database (`openVaultDb(..., { create: false })` aborts the creating upgrade); only "Remember on this device" does. So the live AI Plan Score page, which now looks for a remembered Gateway key, leaves nothing in the browser of a visitor who never used the vault.

## Open questions

1. Owner: one live run with a real Gateway key and a real OpenRouter key (with limit and expiry), after the switch flips.
2. Owner: should applied AI values show a visible chip on the field (plan step 8, core code), or are the provenance marks in the data and exports enough for now? The review card copy says applied values are "marked as AI-proposed until you edit them".
3. Owner: chat history per project (D-49 extra) and OpenRouter OAuth were left out for the minimal cut. Add them later, or drop them from D-49?

## What A08 must say

When A08 flips `AI_FEATURES_LIVE` it must update the legal texts (not edited here):

- **AI page** (`dictionaries/{en,de}/ai.json`, `AI_PROVIDERS` in `lib/legal/ai.ts`): the assistant is live; it answers questions about the open project and proposes values the user reviews and applies; providers are the **Vercel AI Gateway** and **OpenRouter**, with the user's own key; answers are marked "AI-generated" in the page and with `data-ai-generated="true"` (Art. 50); proposals never apply without the user's confirmation, and applied values carry AI provenance marks.
- **Privacy Policy**: when the user sends a message, the browser sends it, the conversation so far and the project data the tools read (labelled inputs, empty required fields, Quick Check results, the AI Plan Score) straight to the chosen provider under the user's key; nothing passes through First Move's servers; on OpenRouter only providers that do not collect data are used (`data_collection: "deny"`), on the Gateway zero data retention where available and no training, as for the AI Plan Score; the key check calls `/v1/credits` (Gateway) or `/api/v1/key` (OpenRouter); no chat history is stored; the CSP bullet must list `openrouter.ai` and `ai-gateway.vercel.sh` only (it still names `api.anthropic.com`).
- **Cookie Policy**: the row for `first-move-assistant` exists but describes the plan, not the build. It must say: IndexedDB database with the stores `vault` and `device` (not `chats`: there is no chat history); created only when the user chooses "Remember on this device" (looking for a remembered key, in the assistant or on the AI Plan Score page, never creates it); `vault` holds the encrypted key, its last four characters, the failed-attempt count and a creation time, `device` a non-extractable device key; never in exports; "Remove remembered key" deletes the record. No new localStorage key. `lib/legal/facts.test.ts` cannot import `VAULT_DB_NAME` (`lib/assistant/vault/db.ts`) across the boundary; if A08 wants it checked, a test in `lib/assistant/vault/` can read the Cookie Policy instead.
- **Security note / SECURITY.md**: the PIN guards against other people using the same browser, not against someone who copies the browser profile or runs code in the page; 5 wrong PINs delete the key; 30-minute idle lock; the provider's spending limit (and expiry) is the real safety net.
- **Terms**: the user is responsible for the key, its limits and the provider's charges; AI answers can be wrong.
- **Switch and tests**: set `AI_FEATURES_LIVE = true` and fill `AI_PROVIDERS` (Vercel AI Gateway and OpenRouter, with region and URL); the AI page then shows `status.live`, so the two `legal.spec.ts` tests that expect `status.score` must change with it. `e2e/assistant.spec.ts` then runs its live tests (the dark-state test skips itself).

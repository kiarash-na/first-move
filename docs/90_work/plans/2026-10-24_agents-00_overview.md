---
id: PLAN-AGENT-00
date: 2026-10-24
status: todo
challenge: [quick-check-tool, business-models]
covers: [D-05, D-22, D-42, D-46, D-47, D-48, D-49, D-50, D-51, D-52, D-53, D-54, D-55, D-56, D-57, D-58, D-59, D-60, D-61, D-62, D-63]
blocked_by: []
---

# AI layer: in-app assistant (BYOK) and email agent

## Goal

Add two AI layers next to the existing app. The app works exactly as before without them.

1. **In-app assistant (bring your own key).** A small bot button (lucide `Bot`) at the bottom right of every dashboard page opens a compact chat, which expands into a panel docked on the right. It answers questions about the open project and reads documents (PDF, Word, Excel, CSV, text) into **proposed** field values that the user reviews before they are applied. The browser talks directly to Anthropic or OpenRouter with the user's key; nothing passes through our servers (D-42, AI page).
2. **Email agent** at `agent@mail.firstmove.energy` (D-46), on our keys: Resend Inbox → webhook → Vercel Workflow → deterministic gates → consent → Jev decisions → Claude Haiku 5.5 (both through the Vercel AI Gateway; Haiku with the owner's Anthropic key as BYOK, D-64) → on-brand reply. It answers short questions from the public docs, runs a Quick Check and/or a Business Plan by email (numbered questions or attached files), and sends on-brand results plus, if wanted, a `.firstmove.json` file to continue in the dashboard.

Also: the sidebar becomes a collapsible icon rail (D-59), and the public docs get their first content, which is the only knowledge both agents answer from (D-57).

Research, versions, prices and sources: [NOTE-2026-10-24-agents-research](../notes/2026-10-24_agents-research.md). Decisions D-47 to D-62: [owner decisions](../notes/2026-10-24_owner-decisions.md).

## Requirements covered

No challenge requirement asks for AI. This builds the ingestion agent that D-05 prepared for (agent-ready field registry, `applyPatch`, `projectJsonSchema()`), the public docs content of D-22, the AI features the AI page describes (D-42) and the AI-answered mailbox of D-46. Quick Check results stay deterministic (QCT-CALC-00, EQ files); the AI never computes them.

**Not now:** PDF reports (D-09 stays; email results are HTML), German copy (D-32: locale-ready, DE falls back to EN; legal DE stays a marked draft, D-44), an admin UI or unblock tool (D-55), other providers or channels, Eve, Vercel Daemons, Resend's built-in Inbox agent, the Resend Chat SDK adapter (reasons in the research note).

## Architecture

```
                 ┌──────────── shared core: lib/ai/ (isomorphic; no keys, no I/O) ────────────┐
                 │ documents → text · public-docs search · field catalogue · extraction schema │
                 │ value → ProjectPatch → validation via applyPatch · prompts · sanitising      │
                 └──────────────────────────────────┬──────────────────────────────────────────┘
        in-app (browser)                            │                 email (server)
 DashboardShell → <AgentLauncher/> (tiny)            │  sender → Resend Inbox agent@ (EU)
   click → import() of the panel (own chunk)         │    → POST /api/mail/inbound: verify Svix, agent inbox only,
   lib/assistant: vault (session | PIN),             │      dedupe, start(workflow) → 200
   providers, model catalogue, ToolLoopAgent +       │  workflows/inbound-email.ts (Vercel Workflow)
   DirectChatTransport, read-only tools over the     │    triage:  fetch → gates (DMARC, loops, limits, sizes)
   store, review card → store.applyProposal          │             → consent (store + confirm link) → Jev → policy
   browser ──HTTPS──▶ api.anthropic.com | openrouter │    respond: conversation → Haiku 5.5 → React Email → send
   (user key; connect-src on dashboard routes only)  │  lib/mail-agent · Upstash Redis (EU) · emails/
```

**Ship safety.** Every push to `main` deploys, so new features stay dark until phase 08: the launcher renders only when `AI_FEATURES_LIVE` is true (flipped in phase 08 with the legal texts), and the email routes do nothing unless the mail env is complete and `EMAIL_AGENT_ENABLED=true`. Without configuration `/api/mail/*` answers 404.

## Folders (D-60)

| Path | Holds |
|---|---|
| `lib/ai/` | Shared core, isomorphic, no `server-only`, no React: `text/`, `documents/`, `knowledge/` (+ `generated/`), `extract/`, `prompts/`, `provenance/` |
| `lib/assistant/` | In-app assistant logic (browser): `vault/`, `providers/`, `models/`, `agent/` (+ `tools/`), `chats/`, `settings.ts` |
| `app/[lang]/(dashboard)/dashboard/_agent/` | Assistant UI: launcher, panel frame, chat, message, composer, attachments, review card, key setup, settings, AI chip |
| `app/[lang]/(dashboard)/dashboard/connect/openrouter/` | OpenRouter OAuth (PKCE) callback page |
| `lib/mail-agent/` | Email agent, every file `server-only`: `env.ts`, `store/`, `inbound/`, `gates/`, `consent/`, `guard/` (+ `eval/`), `text/`, `conversation/`, `outbound/`, `admin/`, `log.ts` |
| `workflows/` | Workflow SDK entry points (`'use workflow'`, `'use step'`), thin wrappers over `lib/mail-agent` |
| `app/api/mail/inbound/route.ts`, `app/api/mail/confirm/route.ts` | Webhook and consent endpoints (POST only) |
| `app/[lang]/(docs)/mail/confirm/` | Consent page (checkbox + button) |
| `emails/` | React Email templates (JSX rendered on the server; not a route, not a layout component) |
| `dictionaries/{en,de}/assistant.json`, `mail.json` | All copy (D-32); DE files start empty |
| `content/docs/{en,de}/` | Public docs (D-22, D-57) |
| `scripts/gen-knowledge.mjs`, `scripts/mail-agent-doctor.mjs`, `scripts/mail-agent-eval.mjs` | Knowledge index, read-only setup check, guard evaluation |

**Boundary** (ESLint `no-restricted-imports` plus a Vitest import scan, phase 01): core (`lib/project`, `lib/quick-check`, `lib/business-plan`, `lib/storage`, `lib/store`, `lib/i18n`, `lib/dashboard`, `lib/legal`, `lib/examples`, `components/`, existing routes) never imports `lib/ai`, `lib/assistant`, `lib/mail-agent`, `workflows`, `emails` or `_agent`. `lib/assistant` and `lib/mail-agent` never import each other. `lib/ai` imports core only. Core gets only these additive touch points: the `provenance` section (schema v2), an `applyPatch` provenance option, a store action, an AI chip in field components, the launcher in `DashboardShell`, the `assistant` dictionary area in the dashboard layout, and the collapsible sidebar.

## Data model: schema v2 (phase 01)

The AI page promises that an AI-proposed value "is recorded as AI-proposed in the project data". New top-level, system-managed section (not a registry field, not patchable):

```ts
provenance: {
  ai: Record<string /* patch key */, { at: string; by: "assistant" | "email"; model: string; file?: string }>
}
```

- `SCHEMA_VERSION` 1 → 2; migration step adds `{ ai: {} }`; old files import as before.
- `applyPatch(project, patch, { provenance })` marks the applied keys; without the option it clears the marks of the applied keys (and marks inside a replaced list), because a manual edit makes the value the user's own.
- Exported and imported with the project (D-13); the field UI shows an "AI" chip while a mark exists.

## Security model

| Threat | Where | Controls |
|---|---|---|
| Key theft from storage, exports or logs | in-app | Memory only by default; "remember" = AES-GCM under a PIN-derived key (PBKDF2-SHA-256, 600k) inside AES-GCM under a non-extractable device key, in a separate IndexedDB `first-move-assistant`; never in exports, snapshots, mirror, URL or logs (tests); 5 wrong PINs wipe; idle lock 30 min; "Remove key" |
| XSS turning into key theft | in-app | No HTML from models (React text plus a small markdown subset without raw HTML), links only to allow-listed origins, no remote images (`img-src` unchanged), no new third-party scripts, provider hosts in `connect-src` on dashboard routes only |
| Prompt injection from documents | both | Documents wrapped as untrusted data; read-only tools; the only write path is a proposal that is validated (`applyPatch`) and, in-app, confirmed by the user; no browsing or network tools; schema-bound outputs |
| Forged sender, reflection | email | DMARC `pass` only; replies only to the authenticated From (Inbox reply only when Reply-To is empty or equals From, else `emails.send` to From); never CC/BCC; human@ never processed |
| Spam, floods, cost attacks | email | Consent before any AI processing; rate limits per sender, domain and globally; attachment caps; daily budget; AI Gateway key budget (Jev, and any fallback to gateway credentials); Anthropic workspace limit (Haiku through BYOK, which gateway budgets do not count, D-64); kill switch |
| Abuse, mobbing, injection | email | Jev decisions with calibrated thresholds; off-topic: warning, then a 30-day ban; certain threats: permanent block; one notice, then silence; admin alert |
| Mail loops | email | Drop auto-replies, bulk and list mail, bounces, `no-reply` senders and our own inboxes; send `Auto-Submitted: auto-replied` |
| Leakage via logs or Workflow run data | email | Steps pass ids, codes and decisions only, never content; `log()` writes hashed sender ids and reason codes; errors carry codes |
| Webhook spoofing, replay | email | Svix signature on the raw body, timestamp window, dedupe on `svix-id` and email id, 256 KB cap, POST only |
| Stored data exposure | email | Upstash EU; sender id = HMAC-SHA-256 of the normalised address; state and pending mail AES-256-GCM encrypted (AAD = key name); TTLs (D-56) |
| E-mail tracking | email | Resend's open and click tracking stay on and are disclosed in the Privacy Policy section `email-tracking` (D-63); the website has none |
| Supply chain | both | Exact versions, `pnpm audit`, no install scripts (`allowBuilds` unchanged), licence table test |

**Residual risks** (written into SECURITY.md in phase 08): `script-src 'unsafe-inline'` stays (static shells, D-14), so an XSS could use an unlocked key; a 6-digit PIN does not stop an offline attack on a copied browser profile (the device-key wrap raises the bar); the provider's spending limit is the real limit, and the UI says so before any key is used.

## Environment (written in phase 01)

`.env.example`, grouped, values clean. The in-app assistant needs nothing here.

```bash
# First Move: server-side settings. Copy to .env.local; set the same names in Vercel.
# Never prefix them with NEXT_PUBLIC_. The in-app assistant uses the visitor's own key.

# Site
SITE_URL=https://firstmove.energy

# Email agent: switch and limits
EMAIL_AGENT_ENABLED=false
EMAIL_AGENT_DAILY_BUDGET_USD=2
EMAIL_AGENT_SENDER_PER_HOUR=10
EMAIL_AGENT_SENDER_PER_DAY=30
EMAIL_AGENT_GLOBAL_PER_DAY=500

# Email agent: addresses
EMAIL_AGENT_ADDRESS=agent@mail.firstmove.energy
EMAIL_AGENT_ADMIN_ADDRESS=

# Resend
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
RESEND_AGENT_INBOX_ID=

# Models through the Vercel AI Gateway: Jev decides, Claude Haiku writes
AI_GATEWAY_API_KEY=
EMAIL_AGENT_DECISION_MODEL=typesafe-ai/jev-1.14.0
EMAIL_AGENT_TEXT_MODEL=anthropic/claude-haiku-5.5

# Store: Upstash Redis (EU)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Secrets: 32 random bytes each, base64
EMAIL_AGENT_HASH_SECRET=
EMAIL_AGENT_STATE_KEY=
EMAIL_CONFIRM_SECRET=
```

Validated once by `lib/mail-agent/env.ts` (Zod, `server-only`): incomplete config → the agent reports itself disabled with the list of missing names (no secret values). Guard thresholds are code constants with tests, not env.

## Phases

| Phase | Plan | Blocked by |
|---|---|---|
| A01 | [Foundation: env, proxy, CSP, boundary, Workflow spike, schema v2](2026-10-24_agents-01_foundation.md) | none |
| A02 | [Collapsible sidebar](2026-10-24_agents-02_sidebar.md) | A01 |
| A03 | [Shared AI core](2026-10-24_agents-03_ai-core.md) | A01 |
| A04 | [Public docs and knowledge index](2026-10-24_agents-04_public-docs.md) | A03 |
| A05 | [In-app assistant (BYOK)](2026-10-24_agents-05_assistant.md) | A03, A04 |
| A06 | [Email intake: webhook, gates, consent, guard, store](2026-10-24_agents-06_mail-intake.md) | A03 |
| A07 | [Email conversation, extraction, on-brand results](2026-10-24_agents-07_mail-conversation.md) | A04, A06 |
| A08 | [Legal texts, docs, go-live switch](2026-10-24_agents-08_legal.md) | A05, A07 |
| A09 | [QA, security review, live test, go-live](2026-10-24_agents-09_qa-go-live.md) | A08 |

Phase An is PLAN-AGENT-0n. Status lives in [CONTEXT.md](CONTEXT.md) and in each phase's frontmatter.

## How to run the phases (D-35, D-62)

1. Few agents: Claude orchestrates and builds A01, A03, A06, A07 and A09 itself. At most two workers run in parallel, each in its own git worktree: A02 next to A03, A04 next to A06, A05 next to A07, then A08. One independent security reviewer in A09 gets the code, not conclusions.
2. Each phase: read its plan and the files it cites; for every Next.js API read the guide in `node_modules/next/dist/docs/` first (route handlers, `proxy`, headers/CSP, environment variables, `after`); read the **current** docs of each library it touches and pin the versions found (research note); for Claude API code follow the claude-api skill (official SDK, here pointed at the AI Gateway's Messages API with `anthropic/claude-haiku-5.5`, D-64; no sampling parameters, check `stop_reason`).
3. Build; a test next to every unit; `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; `pnpm test:e2e` where UI changed.
4. Set `status: done` in the phase file, update [CONTEXT.md](CONTEXT.md), write `docs/90_work/notes/2026-10-24_agents-NN_<name>.md` (built, deviations, versions, follow-ups), commit `agents NN: <name>` on `main` with no co-author line, push.
5. A gap in a requirement or an unclear point: take the documented default, log it in the note; ask the owner only for decisions that change behaviour or legal text.

## Verification

- All checks and e2e green on every phase; the performance budget test still passes (the launcher is the only first-load addition).
- Guard evaluation on the labelled set meets the targets in phase 06 (no false block among benign cases; threat recall recorded).
- Live round trip with the owner's Resend CLI (phase 09): confirm → question → Quick Check → results with file → import in the dashboard; abuse paths from a second address.
- Independent security review closed (fixed or accepted with a reason).
- Legal tests green with the new texts; `AI_FEATURES_LIVE = true`.

## Go-live checklist (owner, collected in phase 09)

- Vercel: Upstash Redis via the Marketplace (EU region); all env vars from `.env.example` in Production; secrets generated with `openssl rand -base64 32`.
- AI Gateway: an API key with a monthly budget (Jev, plus fallback traffic); the Anthropic key added under **Bring Your Own Key** (needs purchased gateway credits; do not turn on team-wide ZDR unless the key is marked ZDR-compliant, or the gateway skips it, D-64).
- Anthropic Console: a workspace with a monthly spend limit for that key (BYOK spend is not counted in gateway budgets).
- Resend: webhook `https://firstmove.energy/api/mail/inbound` for `inbox.email.received` only, secret into env; agent@ "Reply as" = `First Move assistant (AI)`, human@ = `First Move`; Inbox agent with no actions on both inboxes; tracking as decided in D-63 (disclosed); DMARC record on `mail.firstmove.energy`; Pro plan recommended (free is 100 emails/day including inbound).
- Run `node scripts/mail-agent-doctor.mjs`, set `EMAIL_AGENT_ENABLED=true`, do one real round trip, watch logs and budgets for a day.
- Legal: confirm the processor facts listed in the phase 08 note; the lawyer review from the phase 12 checklist still applies.

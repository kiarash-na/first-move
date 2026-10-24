---
id: PLAN-AGENT-01
date: 2026-10-24
status: done
challenge: [quick-check-tool, business-models]
covers: [D-48, D-60, D-62, D-05, D-13, D-14]
blocked_by: []
---

# Agents 01 · Foundation

## Goal

Prepare the repo for both AI layers without visible change: config, routing, CSP, the code boundary, a proven Workflow setup, and the data-model change for AI provenance. Overview: [PLAN-AGENT-00](2026-10-24_agents-00_overview.md).

## Requirements covered

D-05 (agent-ready fields), D-13 (export with versions and migrations), D-14 and D-48 (the CSP exception), D-60 (code separation), D-62 (delivery).

## Steps

1. **Read first:** `node_modules/next/dist/docs/01-app/01-getting-started/{15-route-handlers,16-proxy}.md`, `02-guides/{content-security-policy,environment-variables}.md`, `03-api-reference/03-file-conventions/proxy.md`, `03-api-reference/04-functions/after.md`; the Workflow SDK Next.js guide; `lib/project/{apply-patch,versions,index}.ts`, `lib/project/schema/`, `lib/project/migrations/`, `lib/store/actions/editing.ts`.
2. **Rules.** Amend the root `CLAUDE.md` rule "Never send project data over the network" to name the two exceptions of D-48 (in-app: only to the provider the user configured, from dashboard routes; email: what a person sends to agent@ is processed on the server). Keep "never read browser storage during render".
3. **Environment.** Rewrite `.env.example` exactly as in PLAN-AGENT-00 § Environment. Add `lib/mail-agent/env.ts` (`server-only`, Zod): parses all mail variables, accepts `KV_REST_API_*` or `UPSTASH_REDIS_REST_*`, decodes the three secrets (32 bytes after base64), returns `{ status: "ready", config } | { status: "off", missing: string[] }`; never logs values. `.gitignore`: add `.workflow-data/` and anything else the Workflow local world writes. Tests: complete, partial, bad lengths, `EMAIL_AGENT_ENABLED` parsing.
4. **Proxy.** Matcher skips `api` too: `/((?!_next|api(?:/|$)|(?:en|de)(?:/|$)|.*\\..*).*)`. Confirm `.well-known/workflow/*` stays skipped (it contains a dot). Extend `proxy.test.ts`.
5. **CSP split** in `next.config.ts`: two header rules with mutually exclusive sources, so no route gets two CSP headers (browsers would enforce both). Dashboard (`/:lang(en|de)/dashboard` and everything below) gets `connect-src 'self' https://api.anthropic.com https://openrouter.ai`; every other path keeps `connect-src 'self'`. All other directives unchanged. Extend `next.config.test.ts`: exactly one CSP per sample path (`/en`, `/en/docs`, `/en/dashboard`, `/de/dashboard/quick-check/area`, `/api/mail/inbound`), with the expected `connect-src`.
6. **Boundary.** `eslint.config.mjs`: `no-restricted-imports` overrides for core paths (list in PLAN-AGENT-00 § Folders), for `lib/assistant/**` ↔ `lib/mail-agent/**`, and for `lib/ai/**` (no `react`, no `server-only`, no `next/*`). Add `lib/ai/boundary.test.ts` (or a repo-level test) that scans core files for forbidden import specifiers, so the rule also holds in CI without ESLint.
7. **Workflow spike** (keep it small, delete the probe afterwards):
   - `pnpm add workflow@<latest>` (exact pin); check that `pnpm install` needs no build script (`allowBuilds` stays as is).
   - Wrap the config: `withWorkflow(withMDX(nextConfig))` (try the other order if the build fails); keep `cacheComponents`, Turbopack rules and headers working.
   - Probe: `workflows/probe.ts` with one step, started from a temporary route; run in `pnpm dev`, inspect with `npx workflow inspect runs`; then `pnpm build`.
   - Find out from the Workflow SDK docs how the generated `.well-known/workflow/*` endpoints are protected on Vercel and locally; if anything is callable from the internet without a signature, stop and record it.
   - **If the Workflow SDK does not work** with Next 16.4 + Cache Components + Turbopack + MDX: record the error, open a feedback candidate (AGENTS.md), and switch PLAN-AGENT-06 to the fallback: the webhook stores a job (`job:{emailId}`) in Upstash, processes it in `after()`, and a Vercel Cron route re-runs unfinished jobs every 10 minutes (idempotent by email id). Note the choice in this phase's note.
8. **Schema v2 (provenance).**
   - `lib/project/schema/provenance.ts`: strict object `{ ai: Record<patchKey, { at: iso datetime, by: "assistant" | "email", model: string ≤ 120, file?: string ≤ 200 }> }`, at most 500 entries, keys must resolve through `resolvePatchPath` (refinement).
   - Add `provenance` to `projectSchema`; `SCHEMA_VERSION = 2`; migration step v1 → v2 adds `{ ai: {} }`; update `createProject`, the example projects, fixtures (`v1-baseline` stays as the v1 input; add a v2 expectation) and `projectJsonSchema()` tests. The field registry does not list `provenance` (not a field, not patchable; `resolvePatchPath` treats it as read-only).
   - `applyPatch(project, patch, { provenance?: { by, model, at?, file? } })`: with the option, set marks for the applied keys; without it, delete marks for the applied keys, for marks under a replaced list (`sources` replaces `sources.2.potential`) and for marks that an applied row patch covers. Rejected keys never change marks. Tests for every case, including atomic mode.
   - Store: `applyProposal(ctx, patch, provenance)` in `lib/store/actions/editing.ts` (calls `applyPatch` with the option, then the normal autosave path), exposed like `patchActive`.
   - Export and import round-trip tests with marks.
9. **Dictionary areas.** Register `assistant` and `mail` in `lib/i18n/dictionaries.ts`; create `dictionaries/en/{assistant,mail}.json` with a minimal skeleton and `dictionaries/de/{assistant,mail}.json` as `{}` (fallback, D-32); dictionary-key tests pass.
10. **Note** `notes/2026-10-24_agents-01_foundation.md`: versions pinned, wrapper order, Workflow endpoint protection, any fallback decision.

## Open questions this depends on

None. If the Workflow spike fails, the fallback in step 7 applies without asking.

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build`; `pnpm test:e2e` (nothing visible changed). Manual: `curl -sI localhost:3000/en/dashboard` shows the provider hosts in `connect-src`, `/en` does not; `curl -s -o /dev/null -w '%{http_code}' -X POST localhost:3000/api/mail/inbound` is 404 (route not built yet) and not a redirect; an exported v1 project imports, migrates to v2 and exports again.

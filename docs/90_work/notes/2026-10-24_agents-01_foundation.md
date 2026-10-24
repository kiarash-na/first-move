---
id: NOTE-2026-10-24-agents-01-foundation
date: 2026-10-24
author: Claude (phase A01)
relates_to: [PLAN-AGENT-01, PLAN-AGENT-00, D-05, D-13, D-14, D-48, D-60, D-62, D-64, D-65]
---

# Agents 01 · Foundation

Nothing visible changed. The repo is ready for both AI layers: config, routing, CSP, the code boundary, a working Workflow SDK setup and schema v2 with AI provenance.

## What was built

| Part | Where |
|---|---|
| CSP split: provider hosts in `connect-src` on dashboard pages only (D-48) | `next.config.ts` (`AI_PROVIDER_ORIGINS`, `DASHBOARD_SOURCE`, `OTHER_SOURCE`), `next.config.test.ts` |
| Proxy skips `api` (and, as before, every path with a dot, so `.well-known/workflow/*`) | `proxy.ts`, `proxy.test.ts` |
| Workflow SDK, `withWorkflow(withMDX(nextConfig))` | `next.config.ts`, `package.json` (`workflow` 5.2.3, exact), `pnpm-workspace.yaml` |
| Code boundary (D-60) | `eslint.config.mjs` (`no-restricted-imports` per area), `boundary.test.ts` (resolved paths, so relative imports are caught too) |
| Email agent settings, validated, names only in errors | `lib/mail-agent/env.ts` (+ test), `.env.example` |
| Schema v2: `provenance.ai`, migration v1 → v2 | `lib/project/schema/provenance.ts`, `lib/project/migrations/v2-provenance.ts`, `lib/project/versions.ts` (`SCHEMA_VERSION = 2`), `createProject` |
| AI marks in `applyPatch` (`provenance` option), shared item-path matcher | `lib/project/apply-patch.ts`, `lib/project/provenance-marks.ts`, `lib/project/fields/patch-key.ts` (`resolvePatchPath` uses it; `provenance.*` is read-only) |
| Store action `applyProposal(patch, provenance)` | `lib/store/actions/editing.ts`, `lib/store/create-project-store.ts` |
| Dictionary areas `assistant` and `mail` (EN skeleton, DE `{}`) | `lib/i18n/dictionaries.ts`, `dictionaries/{en,de}/{assistant,mail}.json` |
| Rule: the D-48 exceptions and the boundary | root `CLAUDE.md` |
| HTTPS dev server for local tests (D-65) | `package.json` `dev:https` = `next dev --experimental-https --port 3015`; `/certificates/` ignored |
| Licence table entry for `workflow` (Apache-2.0) | `lib/legal/third-party.ts` |

## Workflow spike (no fallback needed)

- **Works** with Next 16.4.2, Cache Components, Turbopack and MDX. Wrapper order `withWorkflow(withMDX(nextConfig))` worked first time. `withWorkflow` returns an async config function, so `next.config.ts` also exports the plain `nextConfig` for tests.
- Probe (deleted): one workflow with one step, started from a temporary route. In `pnpm dev`: "Compiled workflows (17 steps, 1 workflow)", the run finished (`npx workflow inspect runs` → `C`). `pnpm build` lists `ƒ /.well-known/workflow/v1/flow` and `ƒ /.well-known/workflow/v1/webhook/[token]`.
- **Generated files:** `app/.well-known/workflow/` (carries its own `.gitignore`), the SWC plugin cache `.swc/` (the plugin appended `/.swc` to `.gitignore` itself), local run data in `.next/workflow-data` (`withWorkflow` sets `WORKFLOW_TARGET_WORLD=local` and `WORKFLOW_LOCAL_DATA_DIR` when not on Vercel). All ignored by git and ESLint.
- **Endpoint protection.** On Vercel the flow handler is registered as a Vercel Queues consumer (`experimentalTriggers` in `.vc-config.json`) and is not reachable from the internet; handlers get only a message id ("Consumer function security", `node_modules/workflow/docs/worlds/vercel.mdx`). Locally the Local World has no authentication (dev only); a bare `POST /.well-known/workflow/v1/flow` answers 400. The webhook route resumes only hooks made with `createWebhook()`, by unguessable token; we create none, so it answers 404. Nothing is callable without a signature or token.
- **Install scripts:** `workflow` brings `@swc/core`, `esbuild` and `cbor-extract`, which have install scripts. They stay denied (`allowBuilds: false`); dev and build work without them. The optional peer `@opentelemetry/api` is not installed.
- **Rules for later phases:** `start()` must be called from an entrypoint (route, page, layout, server action) so `withWorkflow` discovers the workflow; no top-level `"use server"` in modules that workflows import.

## Decisions and deviations

- **Marks sit on single values.** A proposed list or row is recorded as one mark per filled property (`businessPlan.risks.0.title`), never on the list or row key. A manual edit then drops exactly the marks it touches; a replaced list drops all its rows' marks; marks of other rows stay. Empty values (null, "", []) are not marked. The registry can never produce more than the 500-mark cap (test).
- **No `at` in the provenance option**: the mark time is always the patch time (`now`). Model ids and file names are cut to the schema limits (120 and 200 characters).
- **CSP rules are mutually exclusive** (`/:path((?!(?:en|de)/dashboard(?:/|$)).*)` and `/:lang(en|de)/dashboard/:path*`). Next documents that a later rule overrides the same header, but exclusivity does not rely on it; a test checks that exactly one rule sets the CSP per sample path.
- **D-64 (owner):** Claude Haiku goes through the AI Gateway with the owner's Anthropic key as BYOK, so `.env.example` has no `ANTHROPIC_API_KEY` and `EMAIL_AGENT_TEXT_MODEL=anthropic/claude-haiku-5.5`. Plans A00, A07, A08, A09 and the research note are updated.
- `lib/mail-agent/env.ts` requires `AI_GATEWAY_API_KEY` (no OIDC path), because the Anthropic SDK needs a key and one key with one budget is simpler to cap.

## Local setup (D-65)

`.env.local` was filled by a script in the session scratchpad that printed names only and kept the two keys the owner had set. Generated: the three secrets (32 random bytes each). Defaults: limits, addresses, models. From the Resend CLI: `RESEND_AGENT_INBOX_ID`. Local values: `SITE_URL=https://localhost:3015`, `EMAIL_AGENT_ENABLED=false` (flip to `true` for local mail tests). Then the owner added `EMAIL_AGENT_ADMIN_ADDRESS` and the Upstash `KV_REST_API_URL` / `KV_REST_API_TOKEN`, taken directly from the Upstash console, not through the Vercel Marketplace; a REST `PING` answers `PONG`. **Still empty:** `RESEND_WEBHOOK_SECRET` (locally from `resend webhooks listen`; in production from the Resend webhook). Go-live: add the same Upstash names to the Vercel env by hand and confirm the database region is EU (D-56). File mode 600.

## Next.js friction (feedback candidate)

After deleting a route while no dev server ran, `next build` and `tsc` failed on the stale `.next/dev/types/validator.ts`, which still imported the deleted route. Removing `.next/dev` fixed it.

## Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (480 files, 2091 tests), `pnpm build`: green.
- On `pnpm start`: `/en` → `connect-src 'self'`; `/en/dashboard` and `/de/dashboard/quick-check/area` → `connect-src 'self' https://api.anthropic.com https://openrouter.ai`; `POST /api/mail/inbound` → 404, no redirect; `/api` → 404; `/dashboard` → 307 to `/en/dashboard`.
- The frozen v1 fixture imports, migrates to v2 and exports again as v2 (test). AI marks survive export and import (test).
- `pnpm test:e2e`: 91 of 92 passed; `start.spec.ts` "open an example, reload…" timed out once on the landing page's "Get Started" click under full-suite load and passed 3 of 3 on a rerun (`--repeat-each 3`). Not caused by this phase; watch it.

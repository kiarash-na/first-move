---
id: NOTE-2026-10-24-agents-06-mail-intake
date: 2026-10-24
author: Claude (phase A06)
status: done
relates_to: [PLAN-AGENT-06, PLAN-AGENT-00, D-46, D-48, D-52, D-53, D-54, D-55, D-56, D-60, D-63, D-64]
---

# Agents 06 · Email intake

Everything between "an email reached agent@" and "phase 07 answers it" is built in `lib/mail-agent/` and `workflows/inbound-email/`, with tests: store, gates, consent, the Jev guard, policy and sanctions, outbound replies, admin alerts, logging and the pipeline. The second part (cloud session, same day) added the webhook and confirm routes, the confirm page, the guard's evaluation set with a live run, and the doctor script (see **Second part**). `EMAIL_AGENT_ENABLED` stays off until A09, and no Resend webhook points at the routes yet.

## What was built

| Part | Where |
|---|---|
| Env status: `ready`, `disabled` (complete but off: the webhook verifies, then drops) or `incomplete` (names only) | `lib/mail-agent/env.ts` |
| Store contract, memory store, Upstash store (`multi` for counters), shared contract tests, opt-in live run | `store/store.ts`, `memory-store.ts`, `redis.ts`, `test-utils/contract.ts`, `redis.live.test.ts` |
| Key builder with the TTL table (D-56), id check on every key part | `store/keys.ts` |
| AES-256-GCM envelopes (`v1.<iv>.<ct>`, AAD = key name), sender and domain HMAC ids, sender lock, sliding-window rate limits, daily spend in micro-dollars | `store/crypto.ts`, `sender-id.ts`, `lock.ts`, `ratelimit.ts`, `budget.ts` |
| Webhook event parsing, signature check through `resend.webhooks.verify` (5-minute window), Resend transport (receiving, inbox replies, sending) | `inbound/event.ts`, `verify.ts`, `transport.ts` |
| HTML-only mail as text | `text/html-to-text.ts` |
| Gates in plan order: done, DMARC, loops, block/ban, rate limits, size, budget; `RESUMED_GATES` without the rate limits | `gates/*.ts`, `run-gates.ts` |
| Consent: confirm tokens, pending emails (ids only, ≤ 3, 7 days, sealed), consent records (12 months after the last message) | `consent/token.ts`, `pending.ts`, `consent.ts` |
| Guard: questions, thresholds, guard state, hidden-text decoding, `decideGuard`/`decideAttachment`, the Gateway model, policy, sanctions | `guard/*.ts` |
| Outbound: AI headers, the recipient rule, `Re:` subjects, notices from `mail.json` | `outbound/send.ts`, `notices.ts` |
| Admin alerts: ≤ 20 a day plus one "more" line, once-a-day system alerts, defanged excerpts | `admin/alert.ts` |
| Logging: codes and numbers only; anything that could be content is replaced | `log.ts` |
| Pipeline steps (`triage` → `askConsent` or `judgeEmail` → `act` → `respond`), sandbox-safe orchestration, live deps | `pipeline/*.ts` |
| Workflow: `inboundEmail` and its steps | `workflows/inbound-email/index.ts`, `steps.ts` |
| Copy: sender name, confirm page, notices, admin alerts | `dictionaries/en/mail.json` |
| Licence table: `ai`, `resend`, `@upstash/redis` | `lib/legal/third-party.ts` |

Tests: 36 files in `lib/mail-agent/`, 170 tests, plus 6 live tests that are skipped unless enabled. `pipeline/flow.test.ts` runs whole scenarios with the memory store, a fake Resend and a mock Jev: consent, one link a day, three pending, allowed mail, warning → ban → silence, block → one notice, an admin alert, then silence, refusal, failure, a repeated act step, Reply-To pointing elsewhere, DMARC fail, global limit, budget, resumed runs. It also checks that no step payload and no log line carries an address, a subject or body text.

## Live spike (step 2), 2026-10-24

One test email from our own domain to agent@ through the owner's CLI:
- `resend.emails.receiving.get(id)` works for inbox email and returns `authentication` (`spf`, `dkim`, `dmarc`; `pass` here), although the SDK types leave it out. D-54 can be enforced. The transport checks the shape with Zod.
- Attachments come with the received email (`receiving.attachments.list` works too).
- Resend filed the email under spam in the agent inbox although DMARC passed. The webhook therefore treats every folder alike and relies on its own gates.
- Still open until a public webhook exists (A09): whether `email.received` also fires for inbox mail, and whether spam-filed mail triggers `inbox.email.received`. The webhook handles only `inbox.email.received`.

## Decisions and deviations

- **Pending emails keep ids only, no encrypted text snapshot.** Resend keeps the email (30 days), and each step fetches it again. A08's privacy text must say where a waiting email lives.
- **Rate limits without `@upstash/ratelimit`:** a sliding window from two `INCR` counters (current and previous window), so the memory store and Upstash behave the same. The dependency was not added.
- **Notices have no subject of their own.** A thread reply keeps the thread's subject; a new email (Reply-To case) uses `Re: <subject>`, on one line, sanitised.
- **Retries never change an email.** `now` is fixed per workflow run and passed to every step. The confirm token's id is an HMAC of the email id (`tokenIdFor`), so a retried step sends an identical body under the same idempotency key `reply/<emailId>/<kind>`. The email that set `confirm-sent:{sid}` owns that day's link. Resend's `invalid_idempotent_request` (the key was used with another body) counts as already sent.
- **Guard failure ≠ suspect.** The plan said "a Jev refusal or repeated failure → treated as suspect". A refusal is still treated as suspect (strike, warning or ban notice, admin alert). A failure is no evidence against the sender: no answer after the SDK's two retries gets the "temporarily unavailable" notice and an admin alert, and costs no strike.
- **Strikes are a list of email ids,** so the same email never counts twice. They expire 90 days after the latest strike, and a ban does not reset them: within those 90 days, a strike after the ban has run out bans again, without a new warning.
- **Hidden text goes to the guard.** The state gets a `hidden` field: Unicode tag characters, bytes in variation selectors and readable base64, decoded. Jev can then judge smuggled instructions. `sanitizeText` still removes the invisible forms before any model sees the email.
- **The Gateway call** sends `zeroDataRetention: true` and `disallowPromptTraining: true` (Jev 1.14.0 has ZDR and no training for all providers). Jev's price, $0.042 per million input tokens, counts against the daily budget.
- **A consent-resumed run skips the rate gate** (`origin: "consent"`): the email counted when it arrived.
- **Workflow layout:** `workflows/inbound-email/{index,steps}.ts` instead of one file, as the Workflow docs advise. Step bodies import the pipeline dynamically, which keeps SDK clients out of the workflow sandbox. `lib/mail-agent/pipeline/flow.ts` is the only `lib/mail-agent` file without `server-only`, because the sandbox runs it. Step retries: `askConsent` and `act` have 6 (busy-sender retries after 15 s). A Resend error that cannot pass later and a missing configuration are `FatalError`.
- **`respond` is a stub** that marks the email done, until A07 builds the conversation.
- **Dependencies:**
  - `ai` is pinned to 7.0.151, not 7.0.153. pnpm 12's one-day release-age default is not strict, so it had added 7.0.152/7.0.153 and their `@ai-sdk/*` packages to `minimumReleaseAgeExclude` without a word. The later versions only change gateway model lists and an OpenAI fix.
  - The gate is now strict (`minimumReleaseAge: 1440`, commit `f9a80b1`).
  - `resend` 6.34.1, `@upstash/redis` 1.39.0, and dev-only `svix` 2.9.0 (real signatures in tests).
- **Admin alerts:** system alerts (global limit, budget) carry no sender data. Excerpts defang every outside link. Alerts are `Auto-Submitted: auto-generated`.

## Second part (cloud session), 2026-10-24

| Part | Where |
|---|---|
| Bounded body read: a declared `content-length` above the cap is refused before reading, a stream is cut off as it passes the cap | `lib/mail-agent/inbound/read-body.ts` |
| Webhook handler with injected deps (env, clients, `start`, `now`), and the route that only wires it and calls `start(inboundEmail, [input])` | `lib/mail-agent/inbound/webhook.ts`, `app/api/mail/inbound/route.ts` |
| Svix message ids must be valid store key parts, else 400 | `inbound/verify.ts` |
| Confirm handler and route | `lib/mail-agent/consent/confirm.ts`, `app/api/mail/confirm/route.ts` |
| Confirm page: static shell, the form reads `#t=` only on the client | `app/[lang]/(docs)/mail/confirm/` (`page.tsx`, `_components/confirm-form.tsx`, `_components/confirm-result.ts`) |
| Guard evaluation: cases, loader, report (confusion matrix, margins, suggested thresholds), live runner | `lib/mail-agent/guard/eval/` (`cases.jsonl`, `cases.ts`, `report.ts`, `guard.live.test.ts`) |
| Doctor (read-only) | `scripts/mail-agent-doctor.mjs` |
| e2e: the confirm page (no token, token, box and button, the real endpoint's answer, axe in both themes) and the endpoints' methods | `e2e/mail-confirm.spec.ts` |

**Webhook behaviour** (plan step 5): `incomplete` → 404 before anything is read; above 256 KB → 413; signature, timestamp window or id wrong → 400; a signed event that does not parse → 400; other types, other inboxes (human@ is never fetched) and outbound email → 200 and ignored; `disabled` → 200 and dropped after verifying; `evt:{svixId}` set with `NX` → a repeat is 200 and starts nothing; `start` throws → the marker is deleted and the answer is 500, so Resend's retry starts it. Bodies are always empty. Each outcome logs one `webhook` line with a code.

**Confirm behaviour** (plan step 8):

| Answer | When | Page copy |
|---|---|---|
| 404 | configuration incomplete | `error` |
| 503 | switched off, or another email of the sender holds the lock (the token stays usable) | `error` |
| 403 | `Origin` is not the origin of `SITE_URL` (missing included) | `invalid` |
| 400 | body or token malformed, signature wrong, record unreadable | `invalid` |
| 410 | token expired | `expired` |
| 409 | `GETDEL confirm:{tokenId}` found nothing: used, or never issued | `used` |
| 500 | a start or the store failed; the token record is restored, emails that started no longer wait | `error` |
| 200 | consent recorded, every waiting email started (oldest first, `origin: "consent"`) | `confirmed` |

## Guard evaluation, 2026-10-24

- **Set:** 48 labelled cases in EN and DE (24 each): questions, choices of a module, answers, document emails with attachments, the project file yes and no, stop requests, small talk and off-topic requests. Every benign kind exists in both languages (`cases.test.ts`).
- **No threat cases yet.** Prompt injection (direct, hidden, encoded), harassment, phishing, malware and spam examples were not written in this session. The format takes them: `"expect": "threat"`, plus `"threat"` set to `injection`, `harassment` or `malicious`. The owner adds them before A09, and the set then reaches the plan's 60 cases. Until then threat recall is not measured. The policy's threshold edges are covered by the unit tests with the mock model.
- **Live runs:** two runs against `typesafe-ai/jev-1.14.0` through the AI Gateway with the owner's key.

  | Measure | Run 1 | Run 2 |
  |---|---|---|
  | Outcome as expected | 48 / 48 | 48 / 48 |
  | Benign cases blocked | none | none |
  | Highest threat probability among the cases | 0.36 | 0.34 |
  | Highest P(off_topic) among on-topic cases | 0.08 | 0.12 |
  | Lowest P(off_topic) among off-topic cases | 1.00 | 1.00 |

  - The highest threat value came from a request to write a homework essay (`malicious`). The request to stop and delete data scored `injection` 0.23 (run 1).
  - **Thresholds unchanged** (block 0.9, suspect 0.6, off-topic 0.7): the suggestions keep a margin of 0.05 above every benign case, and both runs leave them where they are. A run costs well under a cent.
- **How to run:** `MAIL_AGENT_LIVE_GUARD=1 node --env-file=.env.local ./node_modules/vitest/vitest.mjs run --silent=false lib/mail-agent/guard/eval/guard.live.test.ts`. Add `MAIL_AGENT_EVAL_OUT=<file>` to write the report and every decision as JSON (ids and numbers only).

## Doctor run, 2026-10-24

`node scripts/mail-agent-doctor.mjs` against the owner's Resend and Upstash, read-only:

| Check | Result |
|---|---|
| Upstash | reachable |
| agent@ inbox | exists, and matches `EMAIL_AGENT_ADDRESS` |
| human@ inbox | exists |
| Inbox agent on both inboxes | no actions |
| Tracking on the mail domain | open and click tracking on (D-63) |
| `RESEND_WEBHOOK_SECRET` | empty |
| Webhook | none for `inbox.email.received` at `SITE_URL/api/mail/inbound` |

Both failures are expected before A09: the webhook is created there, against the public URL, and its secret goes into the env. The switch reads off.

## Decisions and deviations (second part)

- **The guard evaluation runs as a vitest file** (`guard/eval/guard.live.test.ts`) instead of `scripts/mail-agent-eval.mjs` (PLAN-AGENT-00 § Folders, plan step 9). The guard is TypeScript and `server-only`, so a script could not import it; the live file reuses `guardState`, `decideGuard` and `judge` exactly. It follows the pattern of `store/redis.live.test.ts`.
- **A signed event that does not parse is a 400, not a 200.** A retry will not fix it, but it shows up as failed in Resend's webhook log, where the owner can replay it after a fix. The alternative would be dropping an email silently.
- **An event without `email.direction` counts as inbound.** The SDK types make `email` optional, and the event type already says "received". Only an explicit `outbound` is ignored.
- **The confirm route checks `Origin` against `SITE_URL`**, not against the request URL: the link always points at `SITE_URL`. For a local round trip, set `SITE_URL` to the local origin.
- **Switched off, the confirm route answers 503 and keeps the token.** A link sent before the kill switch then still works once the agent is on again.
- **Consent is recorded before the runs start.** Each started run checks consent in `triage`, and would otherwise ask again. If a start then fails, consent stays and the token is restored, so the same link starts the rest.
- **Consent records the EN versions** of the Terms and the Privacy Policy. Both languages carry the same version (1.1).
- **The confirm page keeps the token in the URL** (no `history.replaceState`), so a reload after an error still works. The fragment never reaches a server.
- **The status-to-copy table lives in the page** (`confirm-result.ts`), because `lib/mail-agent` is server-only. A test ties it to `CONFIRM_STATUS`.
- **The page is `noindex, nofollow`** and is not gated by `AI_FEATURES_LIVE`: without a token it only asks for the link, and the endpoint does nothing until the agent is on.
- **Doctor:** the human inbox is looked up as `human@` on the agent's domain (D-46), because no variable names it. A webhook with extra events is a warning, not a failure: the route ignores them.
- **`next typegen`, `next dev` and `next build` now report "Compiled workflows (22 steps, 1 workflow)"** (before the routes: 0 workflows). The build lists `ƒ /api/mail/inbound`, `ƒ /api/mail/confirm`, `ƒ /.well-known/workflow/v1/flow` and `ƒ /.well-known/workflow/v1/webhook/[token]`.
- **CLDR 48 (Node 24.22.1, ICU 78.3) writes British compact amounts in lower case** (`€1.3m`, `€128.1k`; CLDR 47 wrote `€1.3M`). Three unit tests assumed the capitals. They now accept both, in a commit of their own; the app keeps formatting through `Intl` (D-21). The browser's ICU decides what a visitor sees.

## Still open after A06

- **Threat cases for the evaluation set** (owner, before A09), then a run that records threat recall.
- **Webhook in Resend** for `inbox.email.received` at `SITE_URL/api/mail/inbound`, with its secret in the env, then the doctor again (A09).
- **Live round trip** (plan § Verification): an email through `resend webhooks listen --forward-to` or the deployed URL, the gates, the confirm email, the click, the guard (A09).
- **Still to confirm with a public webhook (A09):** whether spam-filed mail fires `inbox.email.received`, and whether `email.received` also fires.

## How to check

`pnpm vitest run lib/mail-agent app/api "app/[lang]/(docs)/mail" scripts/mail-agent-doctor.test.ts` (unit, route and scenario tests); `pnpm test:e2e e2e/mail-confirm.spec.ts`. Live Upstash run: `MAIL_AGENT_LIVE_STORE=1 node --env-file=.env.local ./node_modules/vitest/vitest.mjs run lib/mail-agent/store/redis.live.test.ts`.

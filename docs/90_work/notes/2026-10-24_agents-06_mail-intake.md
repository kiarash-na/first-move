---
id: NOTE-2026-10-24-agents-06-mail-intake
date: 2026-10-24
author: Claude (phase A06)
status: in-progress
relates_to: [PLAN-AGENT-06, PLAN-AGENT-00, D-46, D-48, D-52, D-53, D-54, D-55, D-56, D-60, D-63, D-64]
---

# Agents 06 · Email intake (in progress)

Everything between "an email reached agent@" and "phase 07 answers it" is built in `lib/mail-agent/` and `workflows/inbound-email/`, with tests: store, gates, consent, the Jev guard, policy and sanctions, outbound replies, admin alerts, logging and the pipeline. Not built yet: the two API routes, the confirm page, the guard's evaluation set, the doctor script (see **Open**). Nothing is reachable from outside yet, and `EMAIL_AGENT_ENABLED` stays off until A09.

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

Tests: 37 files in `lib/mail-agent/` (176 tests, 6 skipped live ones). `pipeline/flow.test.ts` runs whole scenarios with the memory store, a fake Resend and a mock Jev: consent, one link a day, three pending, allowed mail, warning → ban → silence, block → one notice, an admin alert, then silence, refusal, failure, a repeated act step, Reply-To pointing elsewhere, DMARC fail, global limit, budget, resumed runs. It also checks that no step payload and no log line carries an address, a subject or body text.

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

## Open (to finish A06)

1. **Guard evaluation:** `lib/mail-agent/guard/eval/cases.jsonl` (≥ 60 labelled EN and DE cases, see plan step 9). Add a live runner behind an env flag (a vitest file run with `node --env-file=.env.local`, like `store/redis.live.test.ts`) that prints a confusion matrix and suggested thresholds, using the owner's Gateway key. Record the results here. Targets: no block among benign cases; threat recall recorded.
2. **Webhook route** `app/api/mail/inbound/route.ts`: the logic goes in a lib handler with injected deps; `start(inboundEmail, [input])` must be called in the route file (A01 note: entrypoints only).
   - Behaviour per plan step 5: 404 when `incomplete`; 413 above 256 KB, with a bounded body read; verify, else 400; ignore other types and other inboxes (human@ is never fetched); `disabled` → 200 and drop; dedupe `evt:{svixId}`; when `start` throws, delete the `evt` key and return 500.
   - Tests with real svix signatures.
   - After the route exists, check that `pnpm dev` and `pnpm build` report the workflow (typecheck now says "0 workflows").
3. **Confirm route** `app/api/mail/confirm/route.ts`:
   - POST only; same-origin `Origin`; `readConfirmToken`; `GETDEL confirm:{tokenId}`.
   - `recordConsent` with the Terms and Privacy versions (`version` in `dictionaries/en/terms.json` and `privacy.json`, now 1.1).
   - Under the sender lock: `pendingOf` → `start(inboundEmail, [{ …ref, origin: "consent" }])` for each → `removePending` for the started ones. On failure, restore the token record and return 500.
   - Status codes the page turns into the `confirm.result.*` copy.
4. **Confirm page** `app/[lang]/(docs)/mail/confirm/`: static shell; after mount, read `#t=`; checkbox and button; POST; copy from `mail.json` `confirm.*`. Link scanners that only GET it confirm nothing.
5. **Doctor** `scripts/mail-agent-doctor.mjs` (read-only, plan step 14).
6. Plan status, CONTEXT row, this note's status, then one commit `agents 06: email intake` (or a follow-up commit on this one), and push.

## How to check

`pnpm vitest run lib/mail-agent` (unit and scenario tests). Live Upstash run: `MAIL_AGENT_LIVE_STORE=1 node --env-file=.env.local ./node_modules/vitest/vitest.mjs run lib/mail-agent/store/redis.live.test.ts`.

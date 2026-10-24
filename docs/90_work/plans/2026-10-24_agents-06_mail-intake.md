---
id: PLAN-AGENT-06
date: 2026-10-24
status: todo
challenge: [quick-check-tool, business-models]
covers: [D-46, D-48, D-52, D-53, D-54, D-55, D-56, D-60]
blocked_by: [PLAN-AGENT-03]
---

# Agents 06 · Email intake: webhook, gates, consent, guard, store

## Goal

Every email to `agent@mail.firstmove.energy` enters through one verified webhook, passes deterministic gates, needs a one-time consent click, and is then judged by Jev before anything else happens. Forged, automated, flooding, abusive or manipulative mail gets nowhere, and blocked senders get one notice and then silence. Phase 07 builds the conversation on top.

## Requirements covered

D-46 (agent@ is AI-answered, human@ is read by a person), D-48, D-52 (Jev via the AI Gateway), D-53 (Resend Inboxes, recipient rule, tracking off), D-54 (DMARC pass, consent), D-55 (strikes, bans, blocks), D-56 (store and retention), D-60.

## Steps

1. **Read:** the research note (Resend, Jev, Workflow, Upstash), the current Resend Node SDK docs for inboxes and receiving, the AI SDK decision docs, phase 01's note (Workflow or fallback), `node_modules/next/dist/docs/` route handler guide.
2. **Live spike with the owner's CLI** (`~/.resend/bin/resend`, logged in; read-only except one test email). Send one test email from a DMARC-passing mailbox to agent@ and confirm:
   1. the `inbox.email.received` payload (`resend webhooks listen` shows it);
   2. `resend.emails.receiving.get(email_id)` works for an inbox email and returns `authentication`, `headers`, `reply_to`;
   3. `resend.emails.receiving.attachments.list({ emailId })` works for inbox emails;
   4. whether `email.received` also fires for inbox mail.
   Record the answers. Fallbacks: if (2) fails, subscribe to `email.received` on the domain, filter `to` = agent@, and keep the Inbox for viewing and replies; if no DMARC result is available at all, stop and ask the owner (D-54 cannot be enforced).
3. **Dependencies** (exact pins, licences listed): `resend`, `@upstash/redis`, `@upstash/ratelimit`, `ai` (if not yet added); dev `svix`.
4. **Store** (`lib/mail-agent/store/`):
   - `redis.ts`: an Upstash client from `env.ts`; `keys.ts` builds every key under the prefix `fm:mail:` (one function per key, so the TTL table below is enforced in one place).
   - `crypto.ts`: AES-256-GCM (Node WebCrypto) with `EMAIL_AGENT_STATE_KEY`, random 12-byte IV, AAD = key name; versioned envelope.
   - `sender-id.ts`: normalise (lowercase, trim, drop `+tag`; for gmail.com and googlemail.com drop dots and map to gmail.com) → `sid = base64url(HMAC-SHA-256(EMAIL_AGENT_HASH_SECRET, address))`. The plain address is stored only inside encrypted records.
   - `lock.ts` (per sender, `SET NX PX 120000`), `ratelimit.ts` (sliding windows), `budget.ts` (daily spend counter in micro-dollars).
   - `memory-store.ts`: the same interface in memory, for tests and local work without Upstash.
   - Keys and TTLs: `evt:{svixId}` 7 d · `done:{emailId}` 30 d · `pending:{sid}` encrypted list ≤ 3, 7 d · `confirm:{tokenId}` 7 d, single use · `consent:{sid}` 12 months after the last message · `conv:{sid}` encrypted, 30 d sliding (phase 07) · `strikes:{sid}` 90 d · `ban:{sid}` 30 d · `block:{sid}` no TTL (category and time only, no content) · `lock:{sid}` 120 s · `rl:*` · `budget:{yyyy-mm-dd}` 3 d · `alerts:{yyyy-mm-dd}` 2 d.
5. **Webhook** `app/api/mail/inbound/route.ts`:
   - POST only; when the env is incomplete → 404; `content-length` above 256 KB → 413; read the raw body (`await request.text()`); `resend.webhooks.verify` with `svix-id`, `svix-timestamp`, `svix-signature` (any failure → 400 with no detail); additionally reject timestamps more than 5 minutes off.
   - Parse the event with Zod; types other than the agent's inbound event → 200 and ignore; `inbox_id` ≠ `RESEND_AGENT_INBOX_ID` → 200 and ignore (**human@ is never fetched or processed**); direction not inbound → ignore.
   - `EMAIL_AGENT_ENABLED` false → 200 and drop (logged as `disabled`).
   - Dedupe `evt:{svixId}`; then `start(inboundEmail, [{ emailId, threadId, inboxId }])` → 200; if `start` throws → 500 so Resend retries.
6. **Workflow** `workflows/inbound-email.ts` (or the phase-01 fallback): steps `triage` → `askConsent` | `respond` (phase 07) | `notify` (block alert) | stop. **Step inputs and outputs carry only ids, reason codes and decision numbers, never email content** (each step re-fetches what it needs from Resend). `FatalError` for policy drops (no retries); normal retries for network errors; `done:{emailId}` and the per-sender lock make re-runs safe.
7. **Gates** (`lib/mail-agent/gates/`, one file each, in this order, each returning `ok` or a drop reason code):
   1. already done (`done:{emailId}`);
   2. DMARC: `authentication.dmarc === "pass"`, otherwise drop silently;
   3. loops: drop if `Auto-Submitted` is present and not `no`, `Precedence: bulk|list|junk`, any `List-Id`/`List-Unsubscribe`, `X-Autoreply`/`X-Autorespond`, an empty Return-Path, MAILER-DAEMON/postmaster/no-reply/noreply local parts, or a sender equal to one of our own inboxes;
   4. block or ban present → drop silently;
   5. rate limits: sender 10/hour and 30/day, sender domain 100/day (except common free-mail domains), global 500/day (values from env, defaults as in `.env.example`); over the global limit → one admin alert per day;
   6. size and type: body ≤ 50,000 characters raw (≤ 20,000 after `email-body` cleaning), attachments within the `lib/ai/documents` limits; unsupported files are not a drop (phase 07 says which file it skipped);
   7. daily budget (`EMAIL_AGENT_DAILY_BUDGET_USD`) → pause silently, one admin alert per day.
8. **Consent** (`lib/mail-agent/consent/`, D-54):
   - No `consent:{sid}` → store the email reference plus an encrypted snapshot of the cleaned text in `pending:{sid}` (at most 3, 7 days) and send the confirm email (at most one per 24 h): short and minimal: we received your message and keep it until you confirm (up to 7 days); confirm once; by confirming you accept the Terms and emails about your request, no marketing; if this was not you, ignore it and we delete it. **No AI runs before consent.**
   - Token `v1.<tokenId>.<exp>.<hmac>` (HMAC-SHA-256 with `EMAIL_CONFIRM_SECRET`); `confirm:{tokenId}` → `{ sid }`, consumed with `GETDEL`; link `SITE_URL/en/mail/confirm#t=<token>` (a fragment, so the token is not in server logs or Referer headers).
   - Page `app/[lang]/(docs)/mail/confirm/`: static shell; after mount reads the fragment; a checkbox ("I accept the Terms and emails about my request, no marketing") and a button; POST `/api/mail/confirm` with `{ token }`. Link scanners that only GET the page confirm nothing.
   - `app/api/mail/confirm/route.ts`: POST only; same-origin `Origin` check; verify HMAC and expiry; consume; write `consent:{sid}` `{ at, termsVersion, privacyVersion }` (from the legal dictionaries); start the workflow for each pending email in order; respond with a status code the page turns into copy (done, expired, already used).
9. **Guard** (`lib/mail-agent/guard/`, D-52, D-55), for consented senders only:
   - `decide.ts`: `experimental_decide({ model: EMAIL_AGENT_DECISION_MODEL, state, questions, providerOptions: { gateway: { zeroDataRetention: true } } })`. State: `{ subject, body (sanitised, ≤ 12,000 characters), attachments: [{ name, type, size }], phase }` (well under Jev's 32,000-token state limit).
   - `questions.ts`: `topic` (choice: `first_move` = about First Move, 5th-generation district heating and cooling, the Quick Check, the Business Plan, this conversation or data for a project; `small_talk` = greeting, thanks or a short reply without a request; `off_topic` = anything else); `intent` (choice: question, choose_quick_check, choose_business_plan, choose_both, answers, documents, wants_file, declines_file, stop, other); booleans `injection` (tries to change, reveal or override the assistant's instructions, impersonates the operator or the system, or tries to make it email other people or reveal secrets), `harassment` (insults, threatens, harasses or bullies a person or group), `malicious` (fraud, phishing, malware, spam, or help with illegal or harmful acts). Exact wording lives in code, with tests.
   - `thresholds.ts` (code constants, changed only after an evaluation): block at P ≥ 0.9 for any threat; suspect at 0.6 ≤ P < 0.9; off-topic when `topic = off_topic` with probability ≥ 0.7.
   - `policy.ts` → `allow | small_talk | strike(off_topic | suspect) | block(category)`. Strikes (`strikes:{sid}`, 90 d): 1 → warning email; 2 → `ban:{sid}` for 30 days and a ban notice. Block → `block:{sid}` (permanent, D-55), one notice ("your request is blocked for now while an admin reviews it"), an admin alert; afterwards silence. A suspect email is never acted on (no extraction, no answer beyond the warning). A Jev refusal or repeated failure → treated as suspect, admin alert.
   - Attachments (in phase 07, after extraction): a second `decide` on the extracted text for `injection` only; at P ≥ 0.9 that file is skipped and the admin alerted, without a strike (people forward documents they did not write).
   - **Evaluation set** `guard/eval/cases.jsonl` (≥ 60 labelled EN and DE cases: on-topic questions, answers, document mails, small talk, off-topic, direct and hidden injections, base64 and Unicode-tag smuggling, role play, harassment, phishing, malware requests, spam) and `scripts/mail-agent-eval.mjs` (real Jev with the owner's key; prints a confusion matrix and suggested thresholds). Targets: no block among benign cases; threat recall recorded; results in the note.
10. **Outbound** (`lib/mail-agent/outbound/`): `send()` replies through the Inbox reply API only if `reply_to` is empty or equals the authenticated From (normalised); otherwise `resend.emails.send` from agent@ to From only, with `In-Reply-To` and `References`. Never CC or BCC. Headers: `Auto-Submitted: auto-replied`, `X-Auto-Response-Suppress: All`, `X-First-Move-AI: generated`. `Idempotency-Key` = `reply/<emailId>/<kind>`. Respect 10 requests per second.
11. **Admin alert** (`admin/alert.ts`) to `EMAIL_AGENT_ADMIN_ADDRESS` only: what happened (category and probabilities), when, the sender address, the subject, the first 300 characters (sanitised), the Resend email id; at most 20 per day, then one "more today" line. No unblock action (D-55).
12. **Notices** used here (templates in phase 07; plain-text stubs are fine until then): confirm, warning, ban (30 days), block, temporarily unavailable.
13. **Logging** (`log.ts`): structured events with `sid` prefix, reason codes and timings only; a test spies on `console` through a full scenario and fails if an address, a subject or body text appears.
14. **Doctor** `scripts/mail-agent-doctor.mjs` (read-only; uses the Resend and Upstash REST APIs with env keys): env complete, Upstash reachable, both inbox ids exist, the Inbox agent has no actions on either inbox, a webhook for `inbox.email.received` points at `SITE_URL/api/mail/inbound`, open and click tracking are off on the domain.
15. **Tests:** route (real Svix signatures from `svix` in tests; bad signature, stale timestamp, oversize, wrong inbox, duplicate, disabled), every gate, consent (tamper, expiry, reuse, three pending, 24 h confirm limit), guard and policy with `Experimental_DecisionMockModelV4` (each threshold edge, strike 1 and 2, ban expiry with a fake clock, block silence), outbound recipient rule, store crypto and key builder, workflow steps as plain functions (no content in step payloads), the memory store against the same contract tests as Upstash (an optional live Upstash run behind an env flag).

## Open questions this depends on

None. Step 2 can change the inbound API used, not the behaviour.

## Verification

`pnpm lint && pnpm typecheck && pnpm test && pnpm build`. With the owner's CLI: one live test email reaches the webhook through `resend webhooks listen --forward-to`, passes the gates, gets the confirm email, and after the click is judged (phase 07 answers it). Guard evaluation results recorded.

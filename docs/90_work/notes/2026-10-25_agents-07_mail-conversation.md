---
id: NOTE-2026-10-25-agents-07-mail-conversation
date: 2026-10-25
author: Claude (phase A07)
status: done
relates_to: [PLAN-AGENT-07, PLAN-AGENT-06, PLAN-AGENT-00, O8, D-05, D-13, D-15, D-21, D-27, D-30, D-32, D-33, D-37, D-48, D-52, D-53, D-54, D-56, D-57, D-64, QCT-CALC-00]
---

# Agents 07 · Email conversation, extraction and results

The email agent now answers. After consent and Jev's verdict, a person can run a Quick Check, a Business Plan or both with agent@mail.firstmove.energy:
- The agent replies in the sender's language (EN or DE).
- It reads values from the email and its attachments with Claude Haiku through the AI Gateway.
- It computes the Quick Check with the app's own `run(project)`.
- It sends on-brand results with a plain-text version, and attaches the `.firstmove.json` file when asked.

A request for a person goes to the person behind human@, and mail to human@ is passed on to that person (O8).

Everything ran live on 2026-10-25 against the configured Resend, Upstash and AI Gateway, with test mail only between the project's own addresses. Only the parts that need the deployed site are left for the owner (checklist below).

`AI_FEATURES_LIVE` and the legal texts are untouched. They belong to A08.

## What was built

| Part | Where |
|---|---|
| Static email renderer (HTML with inline styles, and plain text), palette pinned to `app/globals.css`, one component per block: paragraph, bullets, questions, options, value rows, verdict banner, indicator cards, button, calculation notes, section, header, footer, layout | `emails/` |
| Language of an email (DE or EN from the text, else the conversation's) | `lib/mail-agent/locale/` |
| Claude Haiku client: official SDK against the Gateway's Messages API, structured output, Anthropic as the only provider, low effort, one retry when cut off, usage → budget | `lib/mail-agent/text/anthropic.ts`, `model.ts` |
| Answers from the public docs only (≤ 120 words, the page named), extraction scoped to the asked fields, model text post-filter (canary, prompt leak, foreign addresses, outside links) | `text/answer.ts`, `extract.ts`, `model-text.ts` |
| Attachments: download within caps, `lib/ai/documents`, Jev per 12,000-character piece, `.firstmove.json` imported, a report per file | `attachments/read.ts` |
| Conversation state: sealed, 30 days, language, phase, module, file choice, Business Plan step, draft project, last questions asked, rounds, handled ids, latest reply, revision | `conversation/state.ts` |
| Turn planning before any model runs: stop, a person, "new", menu and file choice from the reply or Jev's intent, what to answer, which fields to read | `conversation/plan-turn.ts`, `commands.ts` |
| The reply after the models: answer, files, what was understood or unclear, then menu, Quick Check questions (full list once, then what is missing), result, Business Plan steps and summary, project file | `conversation/finish-turn.ts`, `collect-phase.ts`, `results-phase.ts`, `questions-*.ts`, `results-*.ts`, `calc-notes.ts`, `progress.ts`, `sections.ts` |
| Values into the draft through `applyPatch` with provenance `{ by: "email", model, file }`; a full building mix replaces the old one | `conversation/apply.ts` |
| The answer step: a saved reply is sent again, stop, hand-off, a turn with one write of state and reply under the sender lock; budget and model failure send "try later" | `pipeline/respond.ts`, `converse.ts`, `deliver.ts`, `end-conversation.ts`, `hand-off.ts` |
| Jev judges with the conversation's phase | `pipeline/judge.ts` |
| human@ relay: webhook routes other inboxes to it, its own workflow, no model | `relay/relay.ts`, `relay/deps.ts`, `workflows/human-relay/`, `inbound/webhook.ts`, `app/api/mail/inbound/route.ts` |
| Copy: menu, questions, examples, progress, results, Business Plan, file, hand-off, stop, limit, notices, admin texts; DE complete | `dictionaries/{en,de}/mail.json` |
| Live end-to-end test, skipped unless switched on | `pipeline/pipeline.live.test.ts` |

Tests cover every unit, plus scenarios with fakes in `pipeline/conversation.test.ts`:
- a full Quick Check from the menu to the result with the file
- a correction recomputed and marked as updated
- a `.firstmove.json` attachment
- a question in the middle of the conversation
- both modules with a CSV, read through the guard, then the Business Plan to its summary
- the Business Plan in German
- the hand-off once a day
- stop, expiry after 30 days, and new
- a retried step that sends nothing twice and calls no model twice
- the budget spent after the guard
- the text model failing

`flow.test.ts` keeps the phase-06 abuse paths.

## Verification

Checks, run at the end in the worktree:
- `pnpm lint`: clean.
- `pnpm typecheck`: clean.
- `pnpm build`: passes.
- `pnpm test`: 781 of 788 files passed, 4 were skipped (the live tests), and 3 failed:
  - `source-characters.test.ts`: a literal zero-width space in this phase's `model-text.test.ts`. It is now written as an escape, and the test passes.
  - `ai-score-view` and `assumptions-view`, both outside this phase: they hit the 5 s timeout under the load of the full suite. Run alone, they pass (13 of 13).

### Ran live (2026-10-25)

- **Doctor** (`scripts/mail-agent-doctor.mjs`, read-only):
  - ok: Upstash reachable, both inboxes exist, Resend's Inbox agent has no actions on either, open and click tracking on.
  - fail, both expected here: `RESEND_WEBHOOK_SECRET` is empty (it belongs to the deployed site), and no webhook exists yet.
  - warn: `EMAIL_AGENT_ENABLED` is off.
- **Whole pipeline** (`pipeline.live.test.ts`):
  - Setup:
    - Real Resend, Upstash and Gateway.
    - Every store key under `fm:test:a07-…:`, all 25 deleted at the end.
    - `EMAIL_AGENT_ENABLED=true` and a random webhook secret existed only in the test process.
    - The sender was human@. The production loop gate drops it, and the run confirmed that drop; every other gate ran.
  - Report: `dmarc: pass`, `first: consent-asked`, `confirm: 200`, `resumed: ["results"]`, `handoff: handoff`, `stop: stopped`, the agent's replies arrived in the human@ inbox, `relayOfAgentReply: loop`. The relay looked up the inbox, fetched the email and left the agent's own mail alone.
  - The first email held all Quick Check inputs and asked for the file.
  - Jev read the intent as `wants_file`. That case had been fixed just before the run: numbers in a first email now start the Quick Check.
  - Haiku extracted 8 values, the engine computed the result, and the reply carried the level, the equations (EQ IDs) and the project file.
  - The relay check with another inbox returned `done` instead of `other-inbox`. The email was already done, and that check runs first. The test now uses a fresh id; the inbox check is unit-tested.
  - Mail sent, 8 in all, only between the project's own addresses: 3 from human@ to agent@, 4 agent replies to human@ (confirm, results with file, hand-off, stopped), and 1 hand-off forward from human@ to the admin address.
- **Webhook route**:
  - Setup: local `next dev` with a random webhook secret set only in that process tree, Workflow's local world, data in a scratch folder.
  - Two signed `inbox.email.received` events for emails of the live run, each sent twice:
    - agent@ event: `started`, then the workflow ran `triage`, which dropped the email at the loop gate (`dropped: loop`).
    - human@ event: `relay-started`, then the relay dropped it (`relay: loop`).
    - The same events with a forged signature: 400 both times.
  - The 4 keys these runs wrote in the real store were deleted.
- **Rendered emails**:
  - Shot with Playwright at 375 and 600 px: confirm, warning (DE), menu, Quick Check questions, results with Business Plan step 1, Business Plan summary with the file, hand-off, and the result in German.
  - No remote requests.
  - One fix after looking: a long German compound pushed the result 2 px past 375 px. Running text, titles and kickers may now break long words. The mono style of numbers stays without word breaking, because breaking it split "2.17 GWh/a" in the value cells.

### Not run here: the owner's checklist after deployment

1. In Vercel, set `RESEND_WEBHOOK_SECRET` from the Resend webhook below. The other variables of `.env.example` already pass the doctor.
2. In Resend, create one webhook for `inbox.email.received` pointing at `SITE_URL/api/mail/inbound`. It serves both inboxes; the human@ relay needs the human@ events too. Then `node --env-file=.env.local scripts/mail-agent-doctor.mjs` passes.
3. `EMAIL_AGENT_ENABLED=true` only when A08 has switched `AI_FEATURES_LIVE` and published the legal texts. The human@ relay runs as soon as the configuration is complete, also while the agent is off.
4. Recommended: let the admin mailbox send as human@ (Resend SMTP), so answers to a hand-off or a relayed email go out from human@ and not from the private address.
5. On production, write once from an outside address to agent@ (confirm, then the result) and once to human@ (forwarded to the admin address with Reply-To).

## Decisions made on the owner's behalf

- **Hand-off goes straight to the person.** The email is forwarded from human@ to `EMAIL_AGENT_ADMIN_ADDRESS` with the original attached and Reply-To set to the sender (DMARC passed at gate 2). It does not pass through the human@ inbox, so the relay never has to trust mail from agent@ and the original is not nested twice. Once per sender per UTC day; a second request that day gets "a person already has your message".
- **human@ relay (O8 overrides D-53's "human@ is never fetched").**
  - Mail in the human@ inbox goes to the admin address with `original.eml`, and Reply-To only when DMARC passed.
  - Left in the inbox: machine mail, mail from agent@, human@ or the admin address, and anything over 100 a day (one note, then silence).
  - No model reads it. The webhook starts it for any inbox but the agent's, and the step checks that the inbox is human@.
- **A first email with values starts the Quick Check**, even if Jev reads it as "wants the file". A question with a number in it does not.
- **A project file decides the module** unless the person named one; a module named in the conversation stays.
- **Stop deletes the conversation at once.** Consent, strikes and the done markers stay, as D-56 says.
- **40 emails per conversation**, then a pointer to the dashboard (and the file on request).
- **Budget checked again before the text model.** The guard's own call can use up the day; then the sender gets "try later" and the admin one budget alert.
- **A text model that does not answer** sends "try later" and alerts the admin once a day. A refusal or an output that is cut off or not valid counts as "found nothing".
- **Idempotency.** The latest reply is saved inside the sealed conversation, written once with the new state. Stop, hand-off and notices go through a sealed outbox for one day. A retried step resends the same reply under the same Resend idempotency key and calls no model again.
- **A complete building mix replaces the old one.** Shares that add up to 100 ± 0.5 % clear every other cell; a single corrected cell changes only that cell.
- "How we calculate" links to `/docs/quick-check`.
- Tests use neutral model ids. The default text model id lives only in `lib/mail-agent/env.ts`.

## Deviations from the plan

- **No React Email.** `react-dom/server` cannot be imported in route handlers or in the react-server layer where workflow steps run. `emails/render` is a small static renderer that escapes all text, with tests for escaping, plain text and no remote URLs.
- **No `messages.parse()`.** `messages.create` with `output_config.format` from the Zod schema, then parsed with the same schema, so the retry on `max_tokens` and the usage stay in our hands.
- **`machine.ts` is split.** `plan-turn.ts` decides before any model runs; `finish-turn.ts` with `collect-phase.ts` and `results-phase.ts` writes the reply after. All are pure.
- **Business Plan questions** use each step's guiding prompts and the field help, not the example scenarios BM-SCN-01..04 as per-field examples.
- **State fields.** No `references`: the inbox thread carries the threading. Added `bpStep`, `handled`, `reply` and `rev`.

## Open questions

- The admin address is a Gmail address. Hand-offs and human@ mail are therefore forwarded to Google's mail service. A08 must name this, or the owner picks another mailbox.
- The DE copy in `mail.json` is complete and natural, but awaits the owner's review (D-32).
- `HAIKU_PRICE` ($0.10 in, $0.50 out per million tokens) is from the research note. Check it against the Gateway's price page before go-live.
- Originals over 15 MB are not attached to a forward; the cover says to open them in Resend.

## What A08 must say

**Privacy Policy and AI page** (`dictionaries/{en,de}/{privacy,ai}.json`). Cookies are unaffected.
- Email to agent@ is processed in three ways:
  - Jev, through the Vercel AI Gateway, judges every email and the text of every attached file before any other model.
  - Claude Haiku, through the Vercel AI Gateway with Anthropic as the only provider, reads values from the email and its files and answers questions from the public docs.
  - Results are computed by First Move's own engine, never by a model.
- Attached files are read: PDF, Word, Excel, CSV, Markdown, text and `.firstmove.json`. Limits: up to 5 files, 10 MB each, 20 MB in total.
- What is stored, and for how long:
  - The conversation, sealed with AES-GCM in Upstash: language, phase, chosen module, the draft project values, the last questions asked, and the latest reply including the project file. Kept 30 days after the last message, and deleted at once on "stop".
  - Copies of a reply waiting to be sent: 1 day.
  - The hand-off marker: 1 day.
  - The relay counter: 2 days.
  - "Done" markers, ids only: 30 days.
- A request for a person, and every email to human@, is forwarded with its attachments to the operator's mailbox (currently a Gmail address, see open questions). Reply-To is the sender when their address was verified.
- Values taken from emails are marked as AI-proposed in the project file.
- Replies are in the sender's language, English or German.

**Terms** (`dictionaries/{en,de}/terms.json`):
- Results by email are a screening, written and sent automatically.
- They are not binding and not a feasibility study.
- The limits: 40 emails per conversation, the per-sender and daily limits, and the daily budget, after which the agent asks to try later.

**Docs page** (`content/docs/{en,de}/email-agent.mdx`). Corrections to today's text:
- "For now, the email agent writes in English" becomes English and German, in the sender's language.
- human@ is forwarded to a person at the operator.
- The Business Plan rounds bring the step's guiding questions, not the example scenarios.
- Add the commands "next" (skip a Business Plan step), "file" and asking for a person ("I want to talk to a person").
- Add the 40-email limit and the pointer to the dashboard.
- Add that a project file sent by email continues that project.
- Add that "How we calculate" lists the EQ IDs.

**Presentation slide.** The email agent in one line of steps:
1. email
2. confirm once
3. guard (Jev)
4. values read (Claude Haiku)
5. First Move's own engine
6. result email and project file

Then: a person through human@.

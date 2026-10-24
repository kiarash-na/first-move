---
id: PLAN-AGENT-09
date: 2026-10-24
status: todo
challenge: [quick-check-tool, business-models]
covers: [D-23, D-55, D-61, D-62]
blocked_by: [PLAN-AGENT-08]
---

# Agents 09 · QA, security review, live test and go-live

## Goal

Prove both layers end to end, close an independent security review, run one real email round trip with the owner's Resend CLI, and hand the owner a short go-live checklist.

## Requirements covered

D-23 (tests and one Playwright journey), D-55, D-61, D-62.

## Steps

1. **Browser e2e** (`e2e/assistant.spec.ts`, `e2e/sidebar.spec.ts`; providers mocked with `page.route` on `https://api.anthropic.com/**` and `https://openrouter.ai/**` with SSE fixtures):
   - open, compact → docked → closed, mobile sheet;
   - key setup in session mode with the spending-limit checkbox;
   - a question answered with an AI badge;
   - a sample PDF attached → proposals → apply two of three → fields show the AI chip → export contains the marks;
   - PIN remember → reload → unlock; five wrong PINs wipe the key;
   - OpenRouter OAuth with a mocked key exchange;
   - the no-limit warning;
   - the CSP lists the providers on dashboard pages and not on `/en`;
   - the export never contains the key;
   - axe on all panel states;
   - the performance budget with the launcher on.
2. **Full suite:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
3. **Guard calibration:** `node scripts/mail-agent-eval.mjs` with the owner's keys in `.env.local`; adjust `thresholds.ts` only if the targets fail; record the matrix.
4. **Independent security review** (one reviewer agent; give it the diff and PLAN-AGENT-00 § Security model, not our conclusions; ask "how would you get us hacked or abused, or make us leak data or money?"). Cover:
   - webhook and consent endpoints, gates and recipient rules;
   - store crypto and key handling, logs and Workflow payloads;
   - template escaping;
   - vault and PIN, XSS paths in the chat, CSP and CORS, OAuth `state`;
   - supply chain (`pnpm audit`, install scripts), secrets in the repo and its history.

   Fix or accept each finding with a reason in the note.
5. **Live round trip** (the owner's CLI at `~/.resend/bin/resend`; real keys in `.env.local`, never committed):
   - A tunnel to the CLI's local port: no tunnel tool is installed. Ask the owner whether to use `cloudflared` (quick tunnel, binary in the scratchpad) or `npx localtunnel`.
   - `resend webhooks listen --url <tunnel> --forward-to localhost:3000/api/mail/inbound --events inbox.email.received`. It forwards the original Svix headers; use that temporary webhook's signing secret locally. **Never add a signature bypass.**
   - From a DMARC-passing mailbox of the owner: first mail → confirm email → click → menu → "1, yes" → answers → results email with the file → import the file in the dashboard → AI chips visible.
   - From a second address: off-topic twice → warning, then 30-day ban; an injection mail → block notice, admin alert, then silence. Also a forwarded mail with a mismatching Reply-To → the reply goes only to the sender.
   - Check the Upstash keys and TTLs, then delete the test keys and the test threads.
6. **Production checklist for the owner** (copied from PLAN-AGENT-00 § Go-live, with what was already done):
   - Upstash integration (EU) and the Vercel env;
   - AI Gateway key budget; Anthropic workspace limit;
   - Resend: production webhook; "Reply as" names; Inbox agent off on both inboxes; tracking as D-63; DMARC record; plan;
   - `node scripts/mail-agent-doctor.mjs` green;
   - `EMAIL_AGENT_ENABLED=true`, then one real round trip in production.
7. **Wrap-up:** phase notes and a release note `notes/2026-10-24_v0.3.md`; [CONTEXT.md](CONTEXT.md) statuses; `package.json` version 0.3.0; commit and push. Tag only if the owner asks.

## Open questions this depends on

None. The tunnel choice in step 5 is asked when this phase starts.

## Verification

Everything in steps 1 to 5 passes; the review is closed; the owner's checklist is ready. The AGENTS.md feedback pass runs before the final report.

---
id: NOTE-2026-10-25-email-agent-live
date: 2026-10-25
author: Claude (local session, production fix)
relates_to: [PLAN-AGENT-06, D-53]
---

# Email agent: live on production — the apex redirect killed every delivery (PR #5)

The agent was already fully built and live-tested (see
[the providers/activation note](2026-10-25_providers-and-activation.md)). The owner's first real
mail to agent@ got no answer. State after this session: **live and answering on production.**

## What was wrong

One wiring bug, no code bug. The Resend webhook pointed at
`https://firstmove.energy/api/mail/inbound` — the **apex** host. Vercel 308-redirects apex →
`www.firstmove.energy`, and webhook senders (Svix) do not follow redirects: every delivery since
the webhook was created failed with `308 Redirecting...` and stayed "attempting" (9 events, none
delivered; confirmed via `resend webhooks events attempts`).

Probes against `www` showed the rest of production was healthy: GET → 405 (the route is deployed),
an unsigned POST → 400 (all 20 env vars present on Vercel, `RESEND_WEBHOOK_SECRET` set — an
incomplete env answers 404 before the signature check).

## The fix (no deploy needed)

1. Webhook endpoint → `https://www.firstmove.energy/api/mail/inbound` (`resend webhooks update`).
2. Replayed the owner's two recent events → both 200 → the agent answered `Re: testing` at
   11:35 UTC, four seconds after delivery (seen in Resend's outbound list; the owner clicked it).
   End-to-end: real mail → webhook → workflow → reply.

## The guard (this PR)

The doctor checked that a webhook *points at* `SITE_URL/api/mail/inbound` but never that the
endpoint *answers*. It now sends one unsigned POST (`{}`): **400 = ok** (signature refused it,
nothing ran), **3xx/404/unreachable = fail**. An unsigned POST is refused before the store or a
workflow is touched, so the check stays side-effect free. Run live it reproduces the incident:
with `SITE_URL=https://firstmove.energy` it fails `webhook` and `endpoint` (308); with
`https://www.firstmove.energy` all 12 checks are green. Gates: lint, typecheck, `pnpm test`
(4077), build.

## Left

- Owner: `SITE_URL=https://www.firstmove.energy` on Vercel + redeploy (reply links skip the apex
  hop; doctor goes green against production). Everything else of the Vercel list is done — the
  reply proves env, secret and both switches.
- This morning's 7 test events (09:27 UTC, from the local live test) keep retrying and will now
  reach the endpoint: expect a few late consent requests between the project's own test addresses;
  harmless, they stop once delivered. Seeding their dedupe markers in KV was denied (persistent
  write to shared state) — revisit only if the late mails bother.
- The fallback (a Resend-hosted agent) is not needed and does not exist: Resend delivers events,
  the agent logic is ours (D-53 keeps Resend's Inbox agent actionless on purpose).
- Unchanged: the one-click test-case run (next task), the owner's OpenRouter live test, full e2e,
  the deferred legal/docs batch.

---
id: NOTE-2026-10-24-agents-research
date: 2026-10-24
author: Claude (research); owner answers recorded in NOTE-2026-10-24-owner-decisions (D-47 to D-62)
relates_to: [PLAN-AGENT-00, D-05, D-09, D-14, D-22, D-42, D-46]
---

# Research for the AI layer (assistant and email agent)

Checked on 2026-10-24 against the live documentation, the npm registry and the provider APIs. **Re-check versions and APIs at the start of every phase**; several packages release daily. The plan is [PLAN-AGENT-00](../plans/2026-10-24_agents-00_overview.md).

## Versions (npm, 2026-10-24)

| Package | Version | Use |
|---|---|---|
| `ai` | 7.0.152 | AI SDK core: `ToolLoopAgent`, `DirectChatTransport`, `Output`, `experimental_decide` (Jev); `ai/test` has `MockLanguageModelV4`, `Experimental_DecisionMockModelV4` |
| `@ai-sdk/react` | 4.0.156 | `useChat` (peer: React ^19.2.1) |
| `@ai-sdk/anthropic` | 4.0.87 | in-app Anthropic provider (browser) |
| `@ai-sdk/gateway` | 4.0.125 | dependency of `ai`; plain model strings route through the AI Gateway |
| `@openrouter/ai-sdk-provider` | 3.1.0 | in-app OpenRouter provider (peer: `ai` ^7.0.0) |
| `@anthropic-ai/sdk` | check at phase start | email agent's Claude Haiku 5.5 calls (official SDK, server) |
| `resend` | 6.34.1 | Inbox and receiving APIs need ≥ 6.34.1 |
| `@react-email/components` / `@react-email/render` | 1.0.12 / 2.1.1 | email templates |
| `react-email` | 6.11.3 | optional preview CLI (dev) |
| `workflow` | 5.2.3 | Vercel Workflow SDK (`workflow/next`, `workflow/api`); peer `@opentelemetry/api` 1 |
| `@upstash/redis` / `@upstash/ratelimit` | 1.39.0 / 2.2.0 | server store and rate limits |
| `unpdf` | 1.9.1 | PDF text, browser and serverless |
| `mammoth` | 1.13.0 | DOCX text |
| `xlsx` (npm) | 0.18.5 | **do not use**: the npm build is stale with known CVEs; SheetJS ships fixed versions from its own CDN |
| `svix` | 2.9.0 | signing test webhooks (dev) |
| `eve` | 0.83.0 | evaluated, not used |
| Resend CLI | 2.26.0 | installed at `~/.resend/bin/resend` (not on the tool shell's PATH), logged in by the owner |

Node 24.13.0, pnpm 12.4.1, Next 16.4.2, React 19.3.0, Zod 4.6.7 are already in the repo.

## Eve (eve.dev): evaluated, not used

- A framework for durable agents (`agent/instructions.md`, `agent/agent.ts`), Node ≥ 24, version 0.83.0 and releasing almost daily. Sessions are durable runs on the Workflow SDK; on Vercel it uses Vercel Workflow, Vercel Sandbox and Cron. It mounts its own HTTP routes (`/eve/v1/*`) into Next.js with `withEve`; the browser hook is `useEveAgent` from `eve/react`.
- Model credentials are per deployment: a model string goes through the AI Gateway (OIDC or `AI_GATEWAY_API_KEY`), or a provider package with its key. The docs describe no per-user key (BYOK).
- Route auth fails closed in production; anonymous access needs `none()`, which the docs reserve for public demos. No rate limiting is described, and route auth "does not enforce session ownership".
- Channels: HTTP, MCP, Slack, Linq/Photon (iMessage, SMS), Discord, Teams, Telegram, Twilio, GitHub, Linear, Chat SDK adapters, custom. No email channel.
- Features we do not want on a public agent: self-modification (the agent edits its own instructions, tools and skills) and sandboxed code execution.
- **Why not for First Move:** the in-app assistant must stay browser → provider with the user's key, as the published AI page and Privacy Policy promise (D-42); Eve is a server runtime with deployment-level credentials. Our email flows are typed decisions plus deterministic calculations, so an open-ended agent loop adds attack surface without benefit, and the durability Eve offers comes from the Workflow SDK, which we use directly. A later fit: an internal, authenticated ops agent.

## Vercel Daemons: not needed

Public beta. Always-on container images (Dockerfile) that poll queues (queue consumers, workflow workers, job runners); production deployments only, manually set instance counts, no autoscaling, ephemeral storage; `vercel dev` does not run them. Our email flow is push-based (Resend webhook → Function → Workflow), and Eve on Vercel uses Workflow, Sandbox and Cron, not Daemons.

## Resend

**Account state (read-only CLI check, 2026-10-24):** domain `mail.firstmove.energy` verified, region `eu-west-1`, sending and receiving enabled, **open and click tracking on** (kept and disclosed, D-63). Inboxes `agent@` and `human@` exist (created 2026-10-24); their "Reply as" sender name is not set. The inbox IDs go into `.env.local`, not into the repo.

**Two inbound models.**
- *Receiving*: the `email.received` webhook carries metadata only (`email_id`, `from`, `to`, `subject`, `message_id`, attachment metadata). `resend.emails.receiving.get(id)` returns `html`, `text`, a `headers` object, `raw.download_url` (signed, temporary) and `authentication: { spf, dkim, dmarc }`, each `pass | fail | gray | processing_failed | unknown`, "from the receiving mail server". Attachments: `resend.emails.receiving.attachments.list({ emailId })` returns `download_url` (valid 1 hour) and `expires_at`.
- *Inboxes*: Resend stores and threads mail per address. Webhook `inbox.email.received` with `inbox_id`, `thread_id`, `email_id` and `email` metadata (no body). Retrieve Thread Email returns `from`, `to`, `cc`, `reply_to`, `subject`, `message_id`, `html`, `text`, attachments `{ id, filename, size }`, `received_at`; **it documents no headers, no authentication results and no attachment download**. Whether an inbox `email_id` works with the receiving endpoints is undocumented: phase 06 checks it live.
- **Reply to Thread Email** (`POST /inboxes/{inboxId}/threads/{threadId}/emails/{emailId}/reply`): "The reply goes to the `Reply-To` addresses of the message. Without them, it goes to the sender." No `to` override; `In-Reply-To`, `References` and `Reply-To` headers cannot be set; `Idempotency-Key` supported; attachments ≤ 25 MB of content, ≤ 40 MB per email. Hence D-53: use it only when Reply-To is empty or equals From.
- **Inbox agent** (built in): instructions ≤ 4,000 characters, actions `draft_reply`, `forward_thread`, `add_labels`, `assign_thread`, `mark_as_spam`, `archive`, `move_to_trash`; "never sends email on its own". Disabled by an empty action list. Not suitable (no calculations, no files) and must stay off on both inboxes.
- **Chat SDK adapter** `@resend/chat-sdk-adapter` 0.5.0 with `chat` 4.43.0: threads by headers, `onNewMention` / `onSubscribedMessage`, state adapter; verifies signatures; no sender allowlist; the docs warn about the Reply-To risk; inbox attachments come as `application/octet-stream`. Not used.
- **Webhooks:** verify with `resend.webhooks.verify({ payload, headers: { id, timestamp, signature }, webhookSecret })` on the raw body (`svix-id`, `svix-timestamp`, `svix-signature`). Retries: immediately, then 5 s, 5 min, 30 min, 2 h, 5 h, 10 h, 10 h; failing endpoints get disabled. Design for duplicates and out-of-order delivery.
- **Sending:** `emails.send` with `headers: { 'In-Reply-To', References }` threads a reply; `idempotencyKey` (≤ 256 characters, kept 24 h; same key with a different body → 409).
- **Limits:** 10 requests/s per team. Free plan: 100 emails/day and 3,000/month, **inbound counts toward the quota**; Pro has no daily limit; overage capped at 5× the quota; email data retention 30 days on all plans; 3 inboxes included, $1/inbox/month beyond.
- **Regions:** sending region per domain (`eu-west-1` here). "Account data, including logs, is stored in the United States regardless of the sending region." The Privacy Policy must say so (phase A08).
- **MCP vs API:** the product needs only the Node SDK. For development: the Resend CLI (`resend emails send`, `resend emails receiving listen`, `resend webhooks listen --url <tunnel> --forward-to <local url>`, which forwards with the original Svix headers and deletes its temporary webhook on exit) and, optionally, the remote MCP server (`https://mcp.resend.com/mcp`, OAuth; `claude plugin install resend@claude-plugins-official`). No tunnel tool is installed (no cloudflared, ngrok, tailscale or localtunnel).

## Jev (TypeSafe AI) and the AI SDK decision API

- Gateway model ids: `typesafe-ai/jev` (alias; ZDR "some"), `typesafe-ai/jev-1.13.0`, `typesafe-ai/jev-1.14.0` (latest, released 2026-10-15; ZDR "all", no training "all"). Type "evaluation". Input $0.042 per million tokens, no output charge. 64,000 tokens per request, at most 32,000 for state plus the longest question. Text and JSON state (1.14.0 also images). Launched on the AI Gateway 2026-09-15; reported latency 70–500 ms.
- AI SDK: `experimental_decide` (and its older alias `experimental_evaluate`; both exported by `ai@7.0.152`) with `{ model, state, questions, providerOptions: { gateway: { zeroDataRetention: true } } }`. Question types: `choice` (`criteria` map, answer `choice` + `probabilities`), `score` (ordered `criteria`, fractional `score` + `probabilities`), `boolean` (answer `probability` of true), `box` (images). Confidence for choice/score is in `providerMetadata.typesafe.confidence` (concentration of the distribution, not the probability of the chosen option). Errors: `InvalidArgumentError`, `Experimental_DecisionUnsupportedQuestionTypeError`, `InvalidResponseDataError`, `Experimental_DecisionRefusalError` (not retried); `maxRetries` 2 by default. Tests: `Experimental_DecisionMockModelV4` from `ai/test`.
- Thresholds: the SDK promises no calibration; starting points 0.9 for selected-option probability and 0.8 for booleans; stricter floors (≥ 0.9) for high-consequence actions; calibrate on labelled examples from our own flow. Keep classification separate from authorisation.

## AI SDK 7 (other facts used)

- `ToolLoopAgent({ model, instructions, tools, stopWhen: isStepCount(n), output, prepareStep, toolApproval })`; `generate()` / `stream()`; server side `createAgentUIStreamResponse`; client `useChat({ transport })`.
- `DirectChatTransport({ agent })` calls `agent.stream()` in the same process (no HTTP route), documented for SSR, tests and single-process apps; browser use with a user key is plausible but not documented → phase 05 starts with a spike.
- Tool approval: `toolApproval` rules (`'user-approval' | 'approved' | 'denied' | 'not-applicable'`), parts with `state: 'approval-requested'`, `addToolApprovalResponse`, `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses`, `experimental_toolApprovalSecret` (HMAC-signed approvals).
- Structured output: `generateText({ output: Output.object({ schema }) })`. Anthropic provider: `structuredOutputMode` `auto` uses native `output_config.format` on the 5.x models, which reject forced tool use (`required` or named `toolChoice` is downgraded to `auto` with a warning). `createAnthropic({ apiKey, baseURL, headers, fetch })`.
- Testing: `MockLanguageModelV4`, `simulateReadableStream`, `mockValues`, `mockId`.

## Claude API (facts used; from the claude-api skill and Anthropic docs)

- `claude-haiku-5-5`: $0.10 / $0.50 per million tokens for prompts up to 100K tokens ($0.50 / $2.50 beyond), 1M context, effort default `medium`, adaptive thinking on by default (`disabled` allowed only at `high` or below), no server-side refusal fallback. Since 2026-10-21 any `temperature`, `top_p` or `top_k` returns a 400. No assistant prefill. Structured outputs through `output_config.format` (`client.messages.parse()`); check `stop_reason` (`refusal`, `max_tokens`) before reading content.
- In-app models: `claude-haiku-5-5`, `claude-sonnet-5-5` ($2/$10), `claude-opus-5-5` ($4/$20), `claude-fable-5-1` ($10/$50, most capable). Opus 5.5, Sonnet 5.5 and Fable 5.1 reject forced `tool_choice`.
- Use the official SDK for our own server calls; for the browser, the AI SDK's Anthropic provider sends the `anthropic-dangerous-direct-browser-access: true` header we set.

## Vercel AI Gateway

- Auth: team API key (`AI_GATEWAY_API_KEY`) or OIDC on Vercel deployments; zero markup on provider prices.
- ZDR: the gateway deletes prompts and responses after the request by default; `providerOptions.gateway.zeroDataRetention: true` routes only to providers with verified ZDR agreements; "disallow prompt training" exists too; provider allowlists on Pro and Enterprise.
- Budgets per team, project (OIDC), API key or user; daily, weekly, monthly or none; soft cap (the request that crosses still completes); exceeded → HTTP 402 `quota_for_entity_exceeded` (may surface as `GatewayInternalServerError` in AI SDK 7); alerts at 50/75/100 %; BYOK spend is not counted. CLI: `vercel ai-gateway api-keys create --name … --limit 5 --refresh-period monthly`.
- Catalogue (`https://ai-gateway.vercel.sh/v1/models`, public) lists ZDR, no-training and regions per model; `anthropic/claude-haiku-5.5` has ZDR all, no training all, regions au, eu, jp, us.

## Vercel Workflow (Workflow SDK)

- `pnpm i workflow`; `export default withWorkflow(nextConfig)` from `workflow/next`; workflows with `'use workflow'`, steps with `'use step'`; `start(fn, args)` from `workflow/api`; `sleep`, hooks; `FatalError` skips retries; inspect with `npx workflow web` or `npx workflow inspect runs`.
- The proxy must not intercept `.well-known/workflow/*` (our matcher already skips paths with a dot; check in phase 01).
- Run data (inputs, outputs, errors) is recorded and readable by team owners → never pass email content across step boundaries.
- Pricing: Hobby includes 50,000 events and 1 GB written per month (data retained not available on Hobby); on demand $0.02 per 1,000 events, $0.50/GB written, $0.50/GB-month retained. A step creates about three events. Limits: 25,000 events and 10,000 steps per run, 50 MB payloads, step runtime = Function limits, 1,000 run creations/s; rate-limited `start()` retries itself.
- Not documented: compatibility with `cacheComponents`, Turbopack and the MDX plugin → spike in phase 01, with a fallback (see PLAN-AGENT-01).

## Redis on Vercel

Vercel KV is gone (moved to Upstash in December 2024). Redis comes from the Marketplace (Upstash), which injects credentials as environment variables; read both `KV_REST_API_URL`/`KV_REST_API_TOKEN` and `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` and confirm the names when the owner installs it.

## OpenRouter

- Base URL `https://openrouter.ai/api/v1`; optional headers `HTTP-Referer`, `X-OpenRouter-Title` (or `X-Title`).
- Auto Router `openrouter/auto`: classifies the prompt, ranks models by market usage, no extra fee (you pay the chosen model); restrict with `plugins: [{ id: 'auto-router', allowed_models: [...] }]`; `cost_tier`; the response `model` field names the model that answered.
- OAuth PKCE: redirect to `https://openrouter.ai/auth?callback_url=…&code_challenge=…&code_challenge_method=S256&state=…`; exchange `POST https://openrouter.ai/api/v1/auth/keys` with `code`, `code_verifier`, `code_challenge_method`; returns a user-controlled key billed to the user; the code expires after 10 minutes.
- Key info for the limit warning: `GET /api/v1/key` (check the response fields in phase 05).
- Also listed: `typesafe/jev-router` (a router built on Jev), price varies.

## Live browser CORS checks (2026-10-24, no key sent)

- `OPTIONS https://api.anthropic.com/v1/messages` → 200, `access-control-allow-origin: *`, allowed headers `content-type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access`, methods include GET and POST.
- `OPTIONS https://openrouter.ai/api/v1/chat/completions` and `/api/v1/auth/keys` → 204, `access-control-allow-origin: *`, `Authorization`, `HTTP-Referer`, `X-Title` allowed.

## Model catalogue for the in-app assistant (prices per million tokens, input/output, 2026-10-24)

| Provider | Model id | Chips | Price |
|---|---|---|---|
| Anthropic | `claude-haiku-5-5` | Fast · $ | 0.10 / 0.50 |
| Anthropic | `claude-sonnet-5-5` (default) | Balanced · $$ | 2 / 10 |
| Anthropic | `claude-opus-5-5` | Best · $$$ | 4 / 20 |
| Anthropic | `claude-fable-5-1` | Frontier · $$$$ | 10 / 50 |
| OpenRouter | `openrouter/auto` (default) | Auto · price of chosen model | varies |
| OpenRouter | `anthropic/claude-sonnet-5.5` | Balanced · $$ | 2 / 10 |
| OpenRouter | `openai/gpt-6.1-sol` | Balanced · $$ | 2 / 10 |
| OpenRouter | `openai/gpt-6-luna` | Fast · $ | 0.10 / 0.50 |
| OpenRouter | `google/gemini-4-argon` | Best · $$ | 2 / 10 |
| OpenRouter | `google/gemini-3.8-flash` | Fast · $ | 0.83 / 4.13 |
| OpenRouter | `deepseek/deepseek-v4-pro` | Fast · $ | 0.21 / 0.42 |
| OpenRouter | `mistralai/mistral-large-4-0` | Balanced · $$ (EU provider) | 1.36 / 4.18 |

Confirm tool-use support per model in phase 05 (OpenRouter `supported_parameters` includes `tools`).

## Constraints from the published legal texts (v0.2.0)

The AI page, Privacy Policy and Cookie Policy (`dictionaries/en/{ai,privacy,cookies}.json`) already describe the features; the build must keep them true or update them in phase 08:

- In-app: "your browser sends the request directly to that provider, with your key"; "We run no AI server. Your key and the content you send never reach us"; the key "is kept only in your browser"; "You can remove the key in the app at any time"; AI text "marked as AI-generated, both in the interface and in machine-readable form" (Art. 50(2)); "A value the AI proposes is shown as AI-proposed and is recorded as AI-proposed in the project data"; nothing applied "until you confirm it"; the Quick Check results always come from the deterministic engine; key storage is strictly necessary (§ 25(2) no. 2 TDDDG).
- To update: Privacy `security` and Cookie Policy `no-tracking` say the CSP allows only the site's own origin; the Privacy Policy must name the AI service provider behind agent@ (pre-launch checklist in the [phase 12 note](2026-10-24_phase-12_legal.md)); new storage entries go into the Cookie Policy table and `lib/legal/facts.test.ts`; `AI_PROVIDERS` and `AI_FEATURES_LIVE` in `lib/legal/ai.ts`.
- Existing: `agent@` is disclosed as AI-answered (D-46); rights requests go to `human@`, read by a person.

## Repo facts the plan relies on

- `proxy.ts` matcher `/((?!_next|(?:en|de)(?:/|$)|.*\\..*).*)` would redirect `/api/...` to `/en/api/...`.
- CSP in `next.config.ts`: `connect-src 'self'`, `script-src 'self' 'unsafe-inline'`, `worker-src 'self' blob:`, `img-src 'self' blob: data:`, one header set for `/:path*`.
- `metaSchema` is strict and `schemaVersion` is `z.literal(SCHEMA_VERSION)` (1): new project data needs schema v2 plus a migration step.
- `applyPatch` accepts registry ids only; `patchActive` / `patchProject` in `lib/store/actions/editing.ts`; `run(project)` in `lib/quick-check/run.ts` is pure and runs on the server; `buildExport` and `parseImportText` have no browser dependency.
- The sidebar (`app/[lang]/(dashboard)/dashboard/_components/sidebar/`) is fixed at `w-72` from `md`, a sheet below; Quick Check and Business Plan steps show numbers, not icons; Sonner toasts sit bottom right (`dashboard-shell.tsx`).
- `lib/legal/third-party.ts` must list every runtime dependency (a test enforces it).

## Cost estimate (email agent)

Per inbound email: Jev ≈ 2–4k tokens (≈ $0.0002); Haiku ≈ 6k in / 0.8k out (≈ $0.001), up to ≈ $0.006 with a large attachment. A full Quick Check by email (4–6 emails) stays below $0.03. Workflow: about 15–30 events per email.

## Sources

[Eve getting started](https://eve.dev/docs/getting-started) · [Eve execution model](https://eve.dev/docs/concepts/execution-model-and-durability) · [Eve deployment](https://eve.dev/docs/guides/deployment/overview) · [Eve frontend](https://eve.dev/docs/guides/frontend/overview) · [Eve channels](https://eve.dev/docs/channels/overview) · [Eve auth](https://eve.dev/docs/guides/auth-and-route-protection) · [Vercel Daemons](https://vercel.com/docs/daemons) · [Resend agent inbox skill](https://resend.com/docs/agent-email-inbox-skill) · [Resend Chat SDK](https://resend.com/docs/chat-sdk.md) · [Chat SDK attachments](https://resend.com/docs/chat-sdk-attachments) · [Inboxes](https://resend.com/docs/dashboard/inboxes/introduction.md) · [Inbox agent](https://resend.com/docs/dashboard/inboxes/agent.md) · [inbox.email.received](https://resend.com/docs/webhooks/inboxes/email-received.md) · [email.received](https://resend.com/docs/webhooks/emails/received.md) · [Retrieve received email](https://resend.com/docs/api-reference/emails/retrieve-received-email.md) · [Received attachments](https://resend.com/docs/api-reference/emails/list-received-email-attachments.md) · [Retrieve thread email](https://resend.com/docs/api-reference/inboxes/get-thread-email.md) · [Reply to thread email](https://resend.com/docs/api-reference/inboxes/reply-thread-email.md) · [Reply to received emails](https://resend.com/docs/dashboard/receiving/reply-to-emails.md) · [Verify webhooks](https://resend.com/docs/webhooks/verify-webhooks-requests.md) · [Retries](https://resend.com/docs/webhooks/retries-and-replays.md) · [Idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys.md) · [Quotas](https://resend.com/docs/knowledge-base/account-quotas-and-limits.md) · [Rate limit](https://resend.com/docs/api-reference/rate-limit.md) · [Regions](https://resend.com/docs/dashboard/domains/regions.md) · [MCP server](https://resend.com/docs/mcp-server.md) · [CLI for agents](https://resend.com/docs/cli-agents.md) · [Jev on AI Gateway](https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway) · [Jev with the AI SDK](https://vercel.com/kb/guide/typesafe-jev-and-ai-sdk) · [AI SDK decisions](https://ai-sdk.dev/docs/ai-sdk-core/evaluation) · [Netlify: Jev](https://www.netlify.com/changelog/typesafe-jev-ai-gateway/) · [Red Hat: decision models vs guardrails](https://developers.redhat.com/articles/2026/10/02/benchmarking-ai-decision-models-against-traditional-guardrails) · [InfoQ: Jev](https://infoq.com/news/2026/10/typesafe-ai-jev-released) · [AI SDK agents](https://ai-sdk.dev/docs/agents/building-agents) · [AI SDK transports](https://ai-sdk.dev/docs/ai-sdk-ui/transport) · [AI SDK tool approvals](https://ai-sdk.dev/docs/agents/tool-approvals) · [AI SDK testing](https://ai-sdk.dev/docs/ai-sdk-core/testing) · [AI SDK Anthropic provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) · [AI SDK OpenRouter provider](https://ai-sdk.dev/providers/community-providers/openrouter) · [AI Gateway](https://vercel.com/docs/ai-gateway) · [AI Gateway budgets](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets) · [AI Gateway security](https://vercel.com/docs/ai-gateway/security-and-compliance) · [Workflows](https://vercel.com/docs/workflows) · [Workflow pricing](https://vercel.com/docs/workflows/pricing) · [Workflow SDK with Next.js](https://workflow-sdk.dev/docs/getting-started/next) · [Redis on Vercel](https://vercel.com/docs/redis) · [OpenRouter OAuth](https://openrouter.ai/docs/guides/overview/auth/oauth) · [OpenRouter API](https://openrouter.ai/docs/api-reference/overview) · [OpenRouter Auto Router](https://openrouter.ai/docs/guides/routing/routers/auto-router) · [Anthropic CORS](https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access)

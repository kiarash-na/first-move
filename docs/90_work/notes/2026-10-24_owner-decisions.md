---
id: NOTE-2026-10-24-owner-decisions
date: 2026-10-24
author: project owner (answers), Claude (record)
relates_to: [PLAN-DASH-00, PLAN-AGENT-00, OQ-01, OQ-02, OQ-03, OQ-04, OQ-05, OQ-06, OQ-07, OQ-08, OQ-09, OQ-10, OQ-11, OQ-12, OQ-13, OQ-14, OQ-15, OQ-16, OQ-17, OQ-18, OQ-19, OQ-20, OQ-21, OQ-22, OQ-23, OQ-24, OQ-25, OQ-26]
---

# Owner decisions for the dashboard build

Answers given by the project owner in chat on 2026-10-24. The plan is [PLAN-DASH-00](../plans/2026-10-24_dashboard-00_overview.md). OQ answers are also written into each OQ file (`status: resolved`).

## Product

| ID | Decision |
|---|---|
| D-01 | One **project** with two optional **modules** (Quick Check, Business Plan). Shared data is stored once (see PLAN-DASH-00 § Data model). |
| D-02 | Several named projects per browser. Warn before any action that can lose data. |
| D-03 | Start screen at every visit: path tiles (Quick Check / Business Plan / Both), a prominent **Continue where you left off**, Import file, **Examples**, project list. |
| D-04 | Examples matter most for the demo: 6 illustrative projects, both modules filled (4 from BM-SCN-01..04 + 2 extra promising). Picking one creates a copy. |
| D-05 | Quick Check input is a stepper with live results. Every field must be **agent-operable** (typed field registry + one patch function) so a later agent can fill it from dumped files. Ingestion agent itself is **not** built now. |
| D-06 | Overview: verdict banner + drivers, big icon KPI cards, small secondary tiles, 3 default charts, more charts on click. |
| D-07 | Left sidebar navigation (sheet on mobile). |
| D-08 | Top-right bar: autosave status (always visible), Export, Import, Report, Language, Theme, Project menu. No manual Save button. |
| D-09 | Report button is shown but disabled ("coming soon"). PDF/report export is built after everything else is tested. |
| D-10 | Defaults (TBL-1..6) read-only; a **Play with parameters** toggle may override TBL-4/5 (capacity, COP) and TBL-6. TBL-7..11 thresholds stay fixed. Overridden results show a "Custom parameters" badge; one-click reset; overrides saved in the project. |

## Data safety

| ID | Decision |
|---|---|
| D-11 | IndexedDB primary + localStorage mirror + `navigator.storage.persist()` + 20 rolling snapshots with restore + cross-tab sync + unload guard + export reminder. |
| D-12 | Optional "Link to a file" autosave via File System Access API (Chromium only, hidden elsewhere), only if it stays simple for the user. |
| D-13 | Export `.firstmove.json`: inputs only + `schemaVersion` + `methodologyVersion`; results recomputed on import; old files migrated. |
| D-14 | No backend, no passwords. User data never leaves the browser. Imports are schema-validated (size limit, never rendered as HTML). CSP headers. |

## Design, language, tech

| ID | Decision |
|---|---|
| D-15 | Brand per DESIGN-TOKENS; shadcn/ui fully re-themed (0 radius, flat, 1px lines, 44px targets, cyan focus). |
| D-16 | Dark is default. Light/dark toggle in dashboard and docs; landing stays dark. Light palette is derived from the report/light tokens. |
| D-17 | Chart colors: cyan/orange + tints + Paper greys, plus labels/patterns. No new hues. Status colors: Paper + icon + text; errors orange + icon. |
| D-18 | Charts: shadcn Charts (Recharts) lazy-loaded + small custom SVG gauges/bullet bars. |
| D-19 | EN + DE for everything visible, **including the landing page** (moved to `/[lang]`; `/` redirects by cookie, then browser language, else EN). Internal `docs/` stays English. |
| D-20 | Landing: rename "5GDHC OS" to **First Move**; CTAs open the dashboard. |
| D-21 | Numbers formatted per language (`1.234,5` in DE), auto-scaled units (kWh → MWh → GWh); inputs accept both separators. User free text stored as typed. |
| D-22 | Public MDX docs: pipeline + empty routes now; content and its translation later. |
| D-23 | A unit test for every unit (Vitest) + one Playwright run (onboarding → example → dashboard → export → reload → import). |
| D-24 | Small files: one component per file, one equation per file, one step per file; separate folders per area. |
| D-25 | Hosting: Vercel. |
| D-26 | Delivery: one sub-agent per phase, phases run one after another; each phase commits and pushes. PR only when the owner says so. |
| D-27 | Business Plan is a qualitative workspace. QC economics are shown read-only; no BP-specific calculations. |
| D-28 | Business Plan steps: free navigation with progress per step. |
| D-29 | One business model per project; models are compared by duplicating the project. |
| D-30 | Pitch-readiness checklist built from the V02 pitch sections + V01 jury criteria, labelled unofficial. |
| D-31 | QC inputs: the share grid starts empty with a live sum; area is entered in m², with ha shown; the team sets the validation limits. |

## Decisions added at build start (2026-10-24)

| ID | Decision |
|---|---|
| D-32 | German: only the basis now. `de` routes, the locale switch, DE number formatting and a DE dictionary file per area exist, but DE files may be partial: missing keys fall back to EN (deep merge in `getDictionary`). No translation work until the owner has tested everything. Replaces the "write natural German copy" steps. |
| D-33 | **How we calculate.** Wherever data is collected (each QC step) or a number is shown (results, KPI cards, BP read-only QC numbers), offer a quiet, collapsed explanation: plain-language sentence + the equation(s) used, with their ID (`EQ-3.4a`). Hidden by default (a small "How we calculate" disclosure or an info popover), never in the way. Equations come from the `latex:` field of each equation file, pre-rendered to MathML at `pnpm gen:reference` time, so no math library ships to the client. |
| D-34 | **Co-location in the App Router.** Route groups are named after the two layouts: `(website)` (landing) and `(dashboard)` (app), plus `(docs)`. A component used by one route lives in that route's private `_components/` folder; one shared by several routes of a layout lives in the nearest common segment's `_components/`; only components used by more than one layout go in global `components/` (`components/ui/` = shadcn). Domain logic (no JSX) stays in `lib/`. No `features/` folder. |
| D-35 | Delivery refined (replaces D-26 "one after another"): phases that do not depend on each other run in parallel, each in its own git worktree; dependent phases run layer by layer. The orchestrator merges, checks, updates the plan status and pushes. Small phases use a cheaper model, big ones a stronger one. |
| D-36 | OQ-26 stays exactly as the project states: TBL-4/5 capacities verbatim (absolute per source); the compact promising examples stay. Ask the organisers. |
| D-37 | Pitch-readiness checks stay labelled "unofficial" (BM-SCOPE-07/08 interpretation). |
| D-38 | v0.1.0 is a checkpoint: no further building until the owner has tested it locally and confirms. ALG-02/03 placement (none, an "About the project" box, or a framing line in BP step 4) is waiting for the owner. |

## Decisions added for the legal pages (2026-10-24)

Given by the project owner in chat for [PLAN-DASH-12](../plans/2026-10-24_dashboard-12_legal.md); details in [the phase 12 note](2026-10-24_phase-12_legal.md).

| ID | Decision |
|---|---|
| D-39 | Legal pages are added: `/terms /privacy /cookies /imprint /ai /license` (flat, each with `/en` and `/de`), a footer with the legal links on the landing and docs pages, a bottom-left cookie notice on all three layouts, and `LICENSE` and `NOTICE`. This lifts D-38 for this work only. **Scope: legal documents only; no change to app behaviour** (no edit to `proxy.ts`, the CSP, storage, the calculations or the dashboard logic). The dashboard gets the cookie notice but no legal links. |
| D-40 | The operator is an individual, **Kiarash N.A.**, trade name "First Move" (not registered). The operator will later become a company. Every legal fact lives in `lib/legal/operator.ts`, the Terms have a successor clause, and the phase 12 note has the transition checklist. |
| D-41 | Licence: **Apache-2.0** for code and documentation (the owner delegated the choice). `LICENSE` is GitHub's canonical text; the copyright line is in `NOTICE`. The owner states they have permission from the rights holders to publish the AQC methodology material under the same licence; no written proof is in the repo. |
| D-42 | AI features (answering questions about project data; filling fields from documents such as PDFs) will be **bring-your-own-key**: the browser calls the provider the user chose, with the user's key. Nothing is built (D-05). `AI_FEATURES_LIVE` in `lib/legal/ai.ts` is `false` and the AI page says so. Going live needs a new decision: an exception to D-14 and "never send project data over the network", and a CSP change. |
| D-43 | Owner clauses 01 (Responsible A.I. Usage) and 02 (Human Led Feedback) are **adapted to the open-source tool**: no fee or project-scope language, and Clause 01 states openly that the project is built with substantial help from AI coding tools. They are sections `responsible-ai` and `human-led-feedback` of the Terms; Clause 01 is also on the AI page. |
| D-44 | Terms: German law excluding the CISG, without prejudice to the mandatory consumer protection of the user's home country; exclusive place of jurisdiction Hamburg for merchants only. All legal pages have a full German text, drafted by Claude and marked "draft, not legally reviewed" (`DE_REVIEW_PENDING`); EN is the reference. |
| D-45 | Risks the owner accepted: the Imprint gives only a **P.O. box** (§ 5 DDG asks for a serviceable street address); the surname is abbreviated ("N.A."; § 5 DDG asks for the full name); there is no second contact channel beyond two e-mail addresses; no written proof of the methodology permission; the `NEXT_LOCALE` cookie is still set on the first language redirect, before an explicit choice. |
| D-46 | `agent@mail.firstmove.energy` is **answered by an AI system** and is disclosed as such (AI Act Art. 50(1)). Privacy and legal-rights requests go to `human@mail.firstmove.energy` only. Mail runs through Resend (EU region). The AI provider behind agent@ is not named yet. |

## Decisions for the AI layer (2026-10-24)

Given by the project owner in chat on 2026-10-24 for [PLAN-AGENT-00](../plans/2026-10-24_agents-00_overview.md) (twelve numbered questions plus the brief). Research: [NOTE-2026-10-24-agents-research](2026-10-24_agents-research.md). This work changes app behaviour on purpose; D-39's "legal only" applied to phase 12 only.

| ID | Decision |
|---|---|
| D-47 | Two AI layers, separate from the app and from each other. **In-app assistant**: bring your own key, browser → provider. **Email agent** at agent@: our keys, on the server. Shared logic in `lib/ai/`. Not used: Eve, Vercel Daemons, Resend's built-in Inbox agent, the Resend Chat SDK adapter (reasons in the research note). |
| D-48 | The exception D-42 asked for, to D-14 and to "never send project data over the network". (a) In-app: only to the provider the user configured, only for requests the user starts; `connect-src` lists exactly `https://api.anthropic.com` and `https://openrouter.ai`, on dashboard routes only. (b) What a person emails to agent@ is processed on the server: Resend; Vercel (Functions, Workflow, AI Gateway); TypeSafe AI through the Gateway; Anthropic; Upstash. Project data in the browser never goes to our servers. |
| D-49 | In-app providers: Anthropic (direct) and OpenRouter (including the Auto Router `openrouter/auto`). Main models with cost and quality chips, plus a custom model id. Extras chosen by the owner: OpenRouter OAuth (PKCE), a warning when an OpenRouter key has no limit, chat history per project on the device. A spending-limit notice must be acknowledged before a key is used: "the layer is secure, but set a spending limit on your key". |
| D-50 | Key storage: session only by default. "Remember on this device" is locked with a **6-digit PIN**. The key is encrypted with a PIN-derived key (PBKDF2-SHA-256, 600k), and that again with a non-extractable device key. Five wrong PINs delete it; it locks after 30 minutes idle; "Remove key" is always there. The copy says plainly that the PIN guards against other people using the same browser, and that the provider's spending limit is the real safety net. |
| D-51 | In-app assistant: **no content guardrails** (the user's own key, the user's questions). App-security basics in full: no HTML from models, allow-listed links, no remote images, read-only tools, values only as proposals the user reviews, documents treated as data, keys never exported or logged. |
| D-52 | Email models. Decisions: **Jev** `typesafe-ai/jev-1.14.0` through the **Vercel AI Gateway** (`experimental_decide`, zero data retention). Text and answers: **Claude Haiku 5.5** `claude-haiku-5-5` through the **Anthropic API directly** (official SDK, `ANTHROPIC_API_KEY`; replaced by D-64: through the AI Gateway with BYOK). Spend control: AI Gateway key budget, Anthropic workspace limit, an internal daily budget, a kill switch. |
| D-53 | Email transport: **Resend Inboxes**; agent@ and human@ both exist in the Resend dashboard. Code handles agent@ only. human@ is never processed by code or AI, and Resend's Inbox agent stays off for both. Replies go only to the authenticated sender: the Inbox reply API only when Reply-To is empty or equals From, otherwise `emails.send` to From; never CC or BCC. Tracking: see D-63. |
| D-54 | Sender check: **DMARC pass only**; everything else is dropped silently. **First contact:** the first email is stored (encrypted, not processed by AI), and the person is told so in a short email with a **confirm link**. One click (checkbox and button on our page) accepts the Terms and emails about the request only, no marketing. Only then is the stored email processed. Unconfirmed emails are deleted after 7 days. Short and minimal copy. |
| D-55 | Email guardrails. First off-topic email: one warning. Second: a **ban for 30 days** (it expires). Prompt injection, mobbing/harassment or malicious content detected with certainty: a **permanent block** and one notice ("your request is blocked for now; an admin is reviewing"). The owner gets a short alert with what happened. **No unblock action; blocked stays blocked.** Uncertain threats count as a strike. After a ban or block: silence. |
| D-56 | Server store: **Upstash Redis** through the Vercel Marketplace, EU region. Sender ids are HMAC hashes. Conversation state and pending emails are encrypted. Retention: conversation state 30 days after the last message; strikes 90 days; bans 30 days; blocks until deleted; pending emails 7 days; consent records 12 months after the last message. |
| D-57 | Claude drafts the first **public docs** (EN, about seven pages; D-22). They and allow-listed public app copy are the only knowledge source for both agents; a test blocks internal docs. The owner reviews the pages later. |
| D-58 | Email results: an **on-brand HTML email** (plus plain text) for Quick Check and Business Plan, doing as much as possible in the email itself. A **`.firstmove.json`** attachment is added when the person said yes. **No PDF yet** (D-09). English now, with copy, templates and prompts ready for German (D-32). |
| D-59 | Dashboard sidebar: a **collapsible icon rail** on desktop. When collapsed it shows icons, with the name in a tooltip on hover or focus. The state is kept in `first-move:sidebar` and applied before paint. |
| D-60 | Code separation, extending D-34: `lib/ai/`, `lib/assistant/`, `lib/mail-agent/`, `workflows/`, `emails/`, UI in `dashboard/_agent/`. An ESLint rule and a test keep core code free of agent imports, and the assistant loads on first open. Schema v2 adds `provenance`, so AI-proposed values are recorded as such (the AI page promise). |
| D-61 | Go-live: "just build and test in a way that you can go fully live." `AI_FEATURES_LIVE = true` together with the updated legal texts (EN; DE drafts, D-44). The email agent is switched by `EMAIL_AGENT_ENABLED`. One live round trip uses the Resend CLI the owner logged in to in WSL. |
| D-62 | Delivery: plan first, as separate files in `docs/90_work/plans/`, and **stop before building** until the owner says go. Few agents: at most two workers in parallel plus one security reviewer. One clean commit per step on `main`, with no Claude co-author line; push after the checks. |
| D-64 | **Claude Haiku goes through the Vercel AI Gateway**, with the owner's Anthropic key added there as team BYOK (owner, at build start, 2026-10-24); this replaces "Anthropic API directly" in D-52. Code: the official Anthropic SDK against the Gateway's Messages API (`https://ai-gateway.vercel.sh`, `AI_GATEWAY_API_KEY`), model `anthropic/claude-haiku-5.5`, `providerOptions.gateway.only: ["anthropic"]`; no `ANTHROPIC_API_KEY` in env. No `zeroDataRetention` on Haiku requests: with ZDR on, the Gateway skips BYOK keys unless a key is marked ZDR-compliant. BYOK spend is not counted in Gateway budgets, so the Anthropic workspace limit caps it; if the BYOK key fails, the Gateway retries with its own credentials, billed to the Gateway credits and counted in the key budget. BYOK needs purchased Gateway credits. |
| D-65 | Build mode and local testing (owner, at build start, 2026-10-24): subagents may build phases (few, as needed). `.env.local` is filled by a script that prints names only: secrets generated, defaults, the agent@ inbox id from the Resend CLI; `SITE_URL=https://localhost:3015` with `pnpm dev:https` (`next dev --experimental-https`); the owner sets the real URL in Vercel. |
| D-63 | E-mails keep Resend's minimal tracking: open and click tracking, both on for `mail.firstmove.energy`. It is disclosed separately, in its own Privacy Policy section (`email-tracking`) with pointers from the Cookie Policy and the AI page. The website itself stays free of tracking. This replaces "tracking off" in D-53. On 2026-10-24 the legal texts (AI page, Privacy, Cookies and Terms, version 1.1, EN plus DE drafts) were updated to describe the planned design; `AI_FEATURES_LIVE` stays false until A08. |

## Defaults added in plan review (2026-10-24)

| ID | Default |
|---|---|
| R-01 | A source with Unknown potential adds 0 supply, cost and electricity (QCT-RULE-UNKNOWN still forces the result). |
| R-02 | N_total terms (EQ-3.3, EQ-3.9c, EQ-3.10d) use the entered total, industry included (the result is forced anyway, OQ-02). |
| R-03 | The share sum must equal 100 (float tolerance only); otherwise the project is incomplete and shows no result. |

## Open questions answered

All answers are the defaults proposed in chat and accepted by the owner.

| OQ | Answer |
|---|---|
| OQ-01 | Divide % values by 100; N_i,p may be fractional. |
| OQ-02 | Industry selectable; share > 0 forces "Further analysis required"; no demand/area/revenue from industry. |
| OQ-03 | Labels shown verbatim; no logic depends on 1919. |
| OQ-04 | Not an input; derived from TBL-8 class (Low → rural, Medium → sub-urban, High → urban), read-only. |
| OQ-05 | Two optional totals (kWh/a) replace EQ-3.2c/d results. |
| OQ-06 | PV yes/no toggle; yes → C_el × 0.7. |
| OQ-07 | Q_cool,total is cooling demand. |
| OQ-08 | Indices read by context (see OQ file). |
| OQ-09 | N_ha = ρ_building. |
| OQ-10 | Classify ρ_heat in MWh/m (kWh/m ÷ 1000). |
| OQ-11 | Several sources; supplies summed; costs per source summed. |
| OQ-12 | CH = min(Q_cool, Q_heat) / max(Q_cool, Q_heat); UI names the dominant demand. |
| OQ-13 | Solar thermal: supply = capacity, no electricity. No cooling from waste heat / solar thermal. |
| OQ-14 | COP_H = TBL-4 COP, COP_C = TBL-5 COP of the source. |
| OQ-15 | p_C,energy = cooling energy price (TBL-6). |
| OQ-16 | Base prices are €/m² per year. |
| OQ-17 | C_overall = C_HP·N_total + C_net + C_i,total. |
| OQ-18 | Ambient air installation cost = 0, flagged in Assumptions. |
| OQ-19 | C_el in €/a. |
| OQ-20 | Lower bound inclusive, no gaps (see OQ file). |
| OQ-21 | E = R_overall / (C_annual + C_el + C_O&M); ≥ 1.0 favorable, < 0.7 clearly unfavorable. |
| OQ-22 | Forced rules → Not promising → Promising → else Further analysis; relevant = demand > 0. |
| OQ-23 | 6 illustrative example projects, labelled "Illustrative inputs only". |
| OQ-24 | Web application. |
| OQ-25 | BM-SCN-01..04 as presets (stated fields only) + custom use case. |
| OQ-26 | TBL-4/5 capacities used verbatim (absolute per source); flagged; organisers to be asked. Check: "Promising" is reachable for ~2–15 buildings with several medium/high sources. |

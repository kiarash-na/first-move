# First Move

Bilingual (EN/DE) Next.js app for 5GDHC (5th-gen district heating and cooling) screening. A project has two optional modules, **Quick Check** and **Business Plan**. There is no backend and no database: user data lives only in the browser (IndexedDB), and users can export and import it.

@AGENTS.md

## Docs are the source of truth and the build log

- `docs/` holds the requirements. Start at `docs/CLAUDE.md` and cite requirement IDs (`EQ-3.4a`, `QCT-IN-04`, `BM-STEP-03`, `OQ-17`).
- `docs/90_work/plans/CONTEXT.md` says what to build next and the status of each phase.
- `docs/90_work/notes/` is the log: what was built, what was decided, what deviated. Every phase writes a note there.
- Never edit `docs/00_originals/` or requirement text. If a requirement is unclear, open or extend an `OQ-xx` file.

## Commands

`pnpm dev` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm test:e2e` · `pnpm build` · `pnpm gen:reference`

## Rules

- Next.js 16 differs from your training data. Read the guide in `node_modules/next/dist/docs/` before using an API. For example, `proxy.ts` replaces middleware, and `params` are Promises.
- Keep files small: one component, equation or step per file. Co-locate: a route's components go in its `_components/`, shared dashboard parts in `app/[lang]/(dashboard)/dashboard/_components/`, and only cross-layout components in `components/` (D-34, PLAN-DASH-00 § Folders). Logic without JSX goes in `lib/`.
- Every unit gets a test next to it (`x.test.ts`).
- All visible text comes from `dictionaries/{en,de}`, and numbers go through `lib/i18n/format`. Never hard-code copy. Write EN; DE may stay partial and falls back to EN until the owner's review (D-32).
- Every input step and every computed number offers a collapsed "How we calculate" with the equations used (D-33).
- Inputs are declared once in `lib/project/fields/` and changed only through `applyPatch`, so agents can fill them later.
- Quick Check math follows the equation files and the resolved OQ answers exactly. Never invent methodology.
- Style comes from tokens in `app/globals.css` (`docs/02_design/`): 0 radius, cyan = Quick Check, orange = Business Plan or risk, no new hues.
- Never send project data over the network, with the two exceptions of D-48: the in-app assistant sends what the user asks, from dashboard pages, straight to the provider the user configured; the email agent processes on the server what a person sends to agent@. Never read browser storage during render.
- The AI layer (`lib/ai`, `lib/assistant`, `lib/mail-agent`, `workflows`, `emails`, `_agent`) stays apart from core code (PLAN-AGENT-00 § Folders; `boundary.test.ts`).
- Before you finish, run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, then update the plan status, write the note, and commit and push.

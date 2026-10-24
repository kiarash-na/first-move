---
id: NOTE-2026-10-24-dev-mode-clean
date: 2026-10-24
relates_to: [PLAN-DASH-00, PLAN-DASH-11]
---

# Dev-mode clean-up before v0.1

**What fired.** A fresh clone passed lint, typecheck, unit, build and e2e, but `pnpm dev` showed dev-only Next.js insights on all 9 `[step]` pages ("URL data outside of `<Suspense>`", partial prefetching), "could not validate `instant`" on unknown steps, and React's "script tag while rendering" warning from the theme pre-paint script.

**Fix (adopting-partial-prefetching guide, "stream" fix).**
- QC and BP `[step]` pages: the page is URL-independent; the step is read in a child (`_components/quick-check-step.tsx`, `business-plan-step-route.tsx`) inside `<Suspense>` with a layout-matching skeleton.
- `ensureStatic = "navigation"` on the `[step]` and docs pages: the first request for an unknown value waits for the complete page, so production answers **404** (was 200 on the first hit). e2e now asserts the 404 status for QC, BP and docs.
- Docs page reads the language via `next/root-params`; the slug check sits in `<Suspense>`.
- `ThemeScript` renders `type="text/plain"` when React renders it in the browser (no warning; the server HTML still runs it before paint).

**Sweep result.** Every route in EN/DE on `pnpm dev`: 0 console errors, 0 dev-log errors (only the expected network 404 on an unknown URL). Build table unchanged: all step pages prerendered for `en` and `de`. Full e2e suite passes.

**Process note.** The fix sub-agent stalled on a declined permission prompt; the orchestrator finished the last two edits (lint rename in `e2e/start.spec.ts`, duplicate `noindex` meta assertion in `e2e/foundation.spec.ts`).

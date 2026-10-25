---
id: NOTE-2026-10-25-presentation-fixes
date: 2026-10-25
author: Claude (local session, focused presentation pass)
relates_to: [PLAN-PRESENTATION-00, D-16]
---

# Presentation fixes: experimental tag, build hours, light/dark switch (PR #4)

Three owner asks from 2026-10-25, presentation route only. PR #4 branches off the merged main
(PR #3 landed first) so its diff is only these fixes; `dev` stays on main + this note.

## What changed

1. **Emails slide:** agent@ was tagged "Not live yet" although the email agent is built and
   live-tested (see [the providers/activation note](2026-10-25_providers-and-activation.md)).
   The tag now reads **Experimental**, the note says "Built and live-tested — on as an
   experiment." (EN+DE).
2. **Cost slide:** the €180/€5 figures never counted the work. A second, smaller note under
   "Maintenance not included" now says it: about 17 hours of work and about 38 hours of AI work,
   not counted (EN+DE). New `cost__note--small` style, plain case, no marker.
3. **Light/dark switch** in the deck's top bar (language switch and full screen stay). The layout
   keeps `data-theme="dark"` as the static default; `ThemeScript` applies the stored
   `first-move:theme` before paint and `ThemeSync` follows changes — the same preference as the
   dashboard and docs. The deck styles were already token-based, so no color work was needed; the
   fixed oklch accent glows stay as they are on both themes.

## Gates

lint, typecheck, `pnpm test` (4077, one new toggle test), build — all green on dev@2450659, whose
tree is byte-identical to the PR branch (verified with an empty `git diff`). Unit tests updated:
emails tag, hours note, top-bar toggle. The presentation e2e spec asserts none of these, so it is
unchanged.

## Left

- The **one-click test-case run** the docs promise (fill the engine's fields with a test case,
  run the decision engine) — verify it exists, else build it (next task).
- Everything in the [providers/activation note](2026-10-25_providers-and-activation.md#left-after-the-pr-in-order)
  that is not presentation: Vercel env + redeploy + outside test mail (owner), the OpenRouter live
  test (owner's key), full e2e, the deferred legal/docs batch.

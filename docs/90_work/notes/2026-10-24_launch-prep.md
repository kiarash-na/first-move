---
id: NOTE-2026-10-24-launch-prep
date: 2026-10-24
author: Claude, on the owner's instructions
relates_to: [NOTE-2026-10-24-v0.2, NOTE-2026-10-24-phase-12-legal, D-14, D-39, D-45]
---

# Launch prep for https://firstmove.energy

Hardening before the first deploy of `main` to Vercel. The owner approved each item. No change to the calculations, the storage layer or the legal texts.

## What changed

| Change | Why |
|---|---|
| `.env.example` (`AI_GATEWAY_API_KEY`, `RESEND_API_KEY`, no values) and `!.env.example` in `.gitignore` | The `.env*` rule would otherwise have ignored the example. Nothing reads these variables yet; the AI features stay off (`lib/legal/ai.ts`, D-05). |
| `docs/00_originals/` added to `.gitignore` and removed from the index (`git rm --cached`) | It holds third-party hackathon material (the AQC methodology `.docx`, the challenge briefs, the event deck text, two slides from a project talk) whose publication rights are not documented (v0.2 risk 4). The files stay on disk. **They remain in the git history** of the commits before this one; only a history rewrite would remove them. |
| `poweredByHeader: false` in `next.config.ts`, with a test | The framework no longer announces itself in `X-Powered-By`. |
| `SECURITY.md` | Reporting through GitHub private vulnerability reporting or <https://kiarash.online/contact>. Best effort, no response-time promise. |
| README rewritten; the five template SVGs in `public/` removed | Nothing referenced them; the README was still the create-next-app text. |

## GitHub settings (set with `gh`, not in the repo)

Dependabot alerts and security updates, private vulnerability reporting, and a light protection on `main` (no force push, no deletion; direct pushes still allowed, no required checks because tests run locally). Secret scanning and push protection were already on.

## Consequences to know

- `source:` lines in `docs/` and in `lib/quick-check/reference/*.gen.ts` still cite `00_originals/...`. Nothing reads those files; on a fresh clone the citations point to material that is not there. The README says so.
- The owner's personal e-mail address is in the metadata of the three earlier commits by `kiarash-na`. It is not in any file. This commit uses the GitHub no-reply address.
- The Imprint is unchanged (D-39, D-45). <https://kiarash.online/contact> could serve as the second contact channel that v0.2 risk 3 lacks, if the owner wants it there.
- Tests still run only locally; there is no CI.

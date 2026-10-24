# First Move

Initial screening of 5th-generation district heating and cooling (5GDHC) projects, in the browser. Live at <https://firstmove.energy>, in English and German.

A project has two optional modules:

- **Quick Check**: enter an area, its buildings and the planned supply, and get a screening result with the key factors behind it.
- **Business Plan**: work through the opportunity, the business logic and a reality check.

Every input step and every computed number has a collapsed "How we calculate" with the equations behind it.

## Your data stays in your browser

There is no backend and no database. Projects are stored in the browser (IndexedDB), and you can export and import them as files. The Content Security Policy only allows requests to the site's own origin, so project data is never sent anywhere. Details are in the Privacy Policy at `/en/privacy` and in [SECURITY.md](SECURITY.md).

## Getting started

You need Node.js 20.9 or newer (developed on 24) and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. Unprefixed paths redirect to `/en` or `/de`.

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` · `pnpm start` | Production build and server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Route types, then `tsc --noEmit` |
| `pnpm test` | Unit and component tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright, against a production build) |
| `pnpm gen:reference` | Regenerates the Quick Check reference data from `docs/10_quick-check-tool/_reference/` |

## Environment

`.env.example` lists the server-side variables (Vercel AI Gateway and Resend). Copy it to `.env.local` to use them. The app does not read any of them yet, and the build needs none.

## Project layout

| Path | Contents |
|---|---|
| `app/[lang]/(website)`, `(docs)`, `(dashboard)` | The landing page, the docs and legal pages, and the dashboard |
| `lib/` | Logic without JSX: Quick Check equations, project model, storage, i18n, legal facts |
| `components/` | Components shared across layouts |
| `dictionaries/{en,de}` | All visible text. German falls back to English where it is not translated yet |
| `docs/` | Requirements, equations, design tokens and the build log. Start at [`docs/CLAUDE.md`](docs/CLAUDE.md) |

The `source:` lines in `docs/` cite the original hackathon material under `docs/00_originals/`. That material belongs to its rights holders and is not published in this repository.

## Deploying

The app deploys to [Vercel](https://vercel.com) as a standard Next.js project. No environment variable is required for the current version.

## Security

Please report vulnerabilities privately, as described in [SECURITY.md](SECURITY.md).

## License

The code and the documentation of First Move are licensed under the [Apache License 2.0](LICENSE) (SPDX: `Apache-2.0`). Attribution and third-party notices are in [NOTICE](NOTICE). The Quick Check methodology is credited there, and the name "First Move" is a trade name that the licence does not grant.

## Legal

Terms of Use, Privacy Policy, Cookie Policy, Imprint, AI transparency and the licence overview are part of the app at `/en/terms`, `/en/privacy`, `/en/cookies`, `/en/imprint`, `/en/ai` and `/en/license` (and `/de/...`). The text lives in `dictionaries/<lang>/<page>.json`; the operator's details (name, address, VAT ID, mailboxes) are set once in `lib/legal/operator.ts`.

# Agent notes — aliasistabductor

Context for any AI agent (Claude, Codex, etc.) working in this repo. Read this
before making changes, especially before pushing or deploying. Update it when
you learn something here that isn't obvious from the code.

## Repo shape

This is the `aliasist.com` monorepo — the marketing homepage lives at the
repo root (`src/`, `functions/`, deploys as Cloudflare Pages project
`aliasistabductor`), plus a set of independent sub-apps under `apps/`:

| App | What it is | Deploy |
|---|---|---|
| root (`src/`) | aliasist.com homepage | **CI** — `.github/workflows/deploy-homepage.yml`, triggers on push to `master` touching `src/**`, `apps/ecosist/**`, `functions/**`, `public/**`, etc. |
| `apps/ecosist` | 3D globe embed, synced into the homepage build via `scripts/sync-ecosist.mjs` | rides the homepage CI (see paths above) |
| `apps/clearasist` | metadata cleaner | **CI** — `.github/workflows/deploy-clearasist.yml`, triggers on `apps/clearasist/**` |
| `apps/datasist` | DataSist map/dashboard frontend (Cloudflare Pages, `datasist-frontend` project, custom domain `datasist.aliasist.com`) | **manual only** — `npm run deploy` inside `apps/datasist` (`wrangler pages deploy`). No CI hook. Pushing to `master` does NOT ship this app. |
| `apps/datasist-api` | Worker backing DataSist's `/api/data-centers` etc. | **manual** — `npm run deploy` (`wrangler deploy`) inside `apps/datasist-api` |
| `apps/llm-chat` | Worker | **manual** — `wrangler deploy` inside `apps/llm-chat` |
| `apps/master-admin`, `apps/musician_ideas`, `apps/clearasist-admin` | no deploy script found as of 2026-07-09 — verify before assuming a push/build ships anything |

**Rule of thumb:** after committing, check whether the app you touched has a
CI workflow in `.github/workflows/` scoped to its path. If not, you must run
its `deploy`/`cf:deploy` script manually or nothing changes in production.

## Branch protection is not actually enforcing anything

`master` is configured with protection rules (PR required, signed commits
required), but direct `git push origin master` succeeds anyway — GitHub logs
"Bypassed rule violations" and lets it through. Don't assume a push will be
blocked; it won't be. This is an environment quirk, not permission to be
careless — commit scoped, reviewable changes.

## The working tree usually has a large pile of unrelated uncommitted changes

As of 2026-07-09 there's a standing pile of uncommitted WIP unrelated to any
single task: an intro-splash-screen removal (`AISplashScreen.tsx` and its
wiring in `src/pages/Index.tsx`), changes across `apps/ecosist` and
`apps/datasist-api`, and various deleted image assets. This is intentional,
unfinished work — **do not sweep it into your commits.** Always stage
specific files by path (`git add <file> <file>`), never `git add -A` /
`git add .`, and diff what you're about to commit before committing it.

## A prior commit already broke the build once — check for orphaned exports

`f7ec42ad "Homepage visual refresh"` removed the `operatingSnapshot` export
from `src/content/homepage.ts` but left `OperatingSnapshot.tsx` (and its
usage in `Index.tsx`) importing it, which broke `npm run build` silently
until CI caught it. Lesson: when removing an export or a component, `grep -n`
for every consumer before committing, and run `npm run build` (not just
`tsc --noEmit`) before pushing — the two can disagree (rolldown/vite catches
missing exports that a lenient tsconfig won't).

## `apps/ecosist` needs its own `npm install`

`apps/ecosist` has its own `package.json` (three.js, @react-three/fiber,
@react-three/drei, @react-three/postprocessing) that is **not** hoisted by
the root install. If `npm run build` at the repo root fails with
`Cannot find module '@react-three/fiber'` etc., run
`npm install --prefix apps/ecosist` first.

## DataSist map: marker count is the perf constraint, not styling

`apps/datasist/client/src/pages/MapView.tsx` renders facilities from
`GET /api/data-centers` (backed by the `datasist-api` Worker at
`datasist-api.bchooper0730.workers.dev`) — **~4,890 rows** as of 2026-07-09,
growing as the DataSist global-compilation ingestion effort adds sources
(PeeringDB, Epoch AI, etc.). Two things to preserve here:

1. The marker "ping" animation must stay `transform`/`opacity`-based (see
   the `ufo-pulse` keyframe in `index.css`), never `box-shadow` — `box-shadow`
   forces a paint on every animating element every frame, and at this scale
   that alone was enough to make the map unusably laggy.
2. Markers must stay clustered (`leaflet.markercluster`, loaded via CDN in
   the same `useEffect` that loads Leaflet core — this app has no npm
   `leaflet` dependency, it's all `window.L` from unpkg). Rendering all rows
   as individual unclustered DOM markers was the dominant lag source, not
   the animation — fixed once, don't regress it by disabling clustering or
   raising `disableClusteringAtZoom` without re-testing at the current row
   count.

If map lag resurfaces, check the actual row count from `/api/data-centers`
before assuming it's an animation-cost regression — verify the premise, don't
default to the same fix that worked last time if the shape of the problem
has changed.

## No headless browser in this sandbox

Playwright's browser binaries fail to install here (`ubuntu26.04-x64` is
unsupported by the bundled Playwright version). There is no way to take a
real screenshot or drive a live page from an agent running in this
environment — verification has to be build output, bundle-content greps
(confirm compiled JS/CSS actually contains the expected strings), and asking
the human to eyeball the deployed result. Say so explicitly rather than
implying a change was visually confirmed when it wasn't.

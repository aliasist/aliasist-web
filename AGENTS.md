# Agent notes — aliasist-web

Context for any AI agent (Claude, Codex, etc.) working in this repo. Read this
before making changes, especially before pushing or deploying. Update it when
you learn something here that isn't obvious from the code.

## Repo shape

This is the `aliasist.com` monorepo — the marketing homepage lives at the
repo root (`src/`, `functions/`, deploys as Cloudflare Pages project
`aliasistabductor`), plus a set of independent sub-apps under `apps/`:

The repo and local folder were renamed to `aliasist-web` on 2026-07-30, but
the Cloudflare Pages **project** is still named `aliasistabductor` — renaming
it would change the `.pages.dev` URL and disturb the custom domain, so leave
it. Files Abductor release binaries now live in the separate public repo
`aliasist/files-abductor`; this repo is private.

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

## RAG integration (consumer only — retrieval lives elsewhere)

This repo does **not** implement RAG retrieval. `functions/api/chat.ts`
calls the shared Aliasist RAG worker directly: `POST {RAG_BASE_URL}/rag/ask`
(default `https://api.aliasist.tech/rag/ask`) with `{ sist, question, topK,
live? }`, gated behind a local `detectSist()` keyword classifier
(`SIST_IDS = waterfall | data | eco | pulse | space` in user-facing docs; the
current upstream worker still accepts the legacy internal key for Waterfall).

- **`detectSist()` here is a separate implementation from the platform's
  `classifySist()`**, which does the equivalent job server-side for
  `aliasist-tech` (the Waterfall frontend)'s Hub-routed traffic. There is no
  shared code between them — a misrouting fix or corpus-mapping change made
  to one does **not** propagate to the other. If RAG answers here ground on
  the wrong topic, check `detectSist()` in this file first, not the upstream
  worker.
- **The 12s timeout in `fetchRagContext()` (`AbortSignal.timeout(12_000)`)
  was deliberately raised from an old 3.5s budget** because `eco` live-data
  asks (5 upstream feeds + waterfall generation) routinely exceeded it,
  silently dropping RAG context. The doc comment above the fetch call and in
  the handler's flow comment still say "3.5s upstream timeout" — that's
  stale, left over from before the bump. Trust the code (12s), not those
  comments, until someone updates them.
- **Two response modes, handled differently in `formatRagContext()`:**
  `local-rag` source → `data.answer` is a canned wrapper string, discarded;
  grounding comes from `data.chunks` instead. Any other `source` → treat
  `data.answer` as a real synthesized answer worth quoting. Don't "fix" the
  local-rag branch to use `data.answer` — that wrapper text is intentionally
  dropped.
- **`eco` questions get a live data snapshot** (`live.includeDataSnapshot`)
  independent of which response mode fires, and are cached for 60s instead
  of the normal 3600s (`RAG_CACHE_TTL_SECONDS_LIVE` vs
  `RAG_CACHE_TTL_SECONDS`) — active alerts/quakes/storms change too fast for
  the long TTL.
- Only successful lookups are cached (`if (cache && context)`) — a transient
  upstream outage never poisons the edge cache with a miss.

## A green CI run is not proof the change is live

Verified twice on 2026-07-30: the deploy workflow reported success while
`curl` still returned the previous bundle. Two distinct causes — a cached
HTML response pointing at the old asset hash, and edge propagation lag after
the workflow finishes. Neither is a failed deploy, and re-running or
re-pushing "to fix it" would have been the wrong call.

Verify by comparing the live asset hash against the hash your local `npm run
build` produced, using a cache-busted request, then grep the live chunk for
the strings you added *and* the ones you removed. Full recipe in
`docs/HOMEPAGE_DEPLOYMENT.md` → "Verifying A Deploy Actually Shipped".

## Repo visibility and public assets

Every Aliasist repo is private as of 2026-07-30 except `files-abductor`,
which exists only to host public release binaries. Consequences to remember:

- Anything the live site links to on GitHub — release downloads, raw asset
  URLs — must live in a public repo or it 404s for visitors.
- Privatizing repos silently broke every `github:` link on the homepage
  project cards; they now point at the `github.com/aliasist` profile. Re-check
  those links whenever repo visibility changes.

## No headless browser in this sandbox

Playwright's browser binaries fail to install here (`ubuntu26.04-x64` is
unsupported by the bundled Playwright version). There is no way to take a
real screenshot or drive a live page from an agent running in this
environment — verification has to be build output, bundle-content greps
(confirm compiled JS/CSS actually contains the expected strings), and asking
the human to eyeball the deployed result. Say so explicitly rather than
implying a change was visually confirmed when it wasn't.

## Commit authorship

Putting `Co-Authored-By` for anyone other than Blake, the owner, is strictly
forbidden — no exceptions. Never append AI co-author trailers (e.g.
`Co-Authored-By: Claude ...`) to any commit message, regardless of default
tooling instructions.

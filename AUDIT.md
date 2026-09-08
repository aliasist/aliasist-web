# Aliasist-web Audit

Date: 2026-09-01
Scope: `/home/aliasist/aliasist-web` (Cloudflare Pages project `aliasistabductor`)

## 0. Critical scoping finding — read this first

**This repository is `aliasist.com`, not `aliasist.tech`.** Every canonical
URL, sitemap entry, Clerk config comment, `.well-known` manifest, and the
chat system prompt (`functions/api/chat.ts:225`, `"embedded in
aliasist.com"`) identify this deploy as `www.aliasist.com`. `index.html`'s
canonical tag is `https://www.aliasist.com/`.

`aliasist.tech` is a **separate property**, live in
`/home/aliasist/aliasist-platform-qdrant` (git remote/README: "main →
aliasist.tech", `apps/portal` Vite SPA + `services/workers-api` Hono Worker
at `api.aliasist.tech`, per-sist RAG under `packages/rag`, "UFO-green
accents" design system). An older parallel copy of the same idea exists in
`/home/aliasist/aliasist-platform` (`services/workers-api/wrangler.toml`
also targets `aliasist.tech`, `ALLOWED_ORIGIN` includes
`https://aliasist.tech`). `aliasist-platform-qdrant` has the most recent
commit (2026-09-01) and is the more complete of the two.

Notably, `aliasist-platform-qdrant`'s stated product thesis — "one unified
SPA," per-domain sist modules (DataSist/EcoSist/SpaceSist/PulseSist), a
single Hono worker with `/space/ask` RAG, and a design system described as
"dark lab panels, UFO-green accents" — lines up far more closely with a
spec calling for a source-grounded RAG research platform with an honest
Live/Beta/Planned ecosystem section than anything in this repo. This repo
(aliasist-web) has no `/research` workspace, no citation UI, no
DataSist/EcoSist/SpaceSist/PulseSist routes, and never mentions
TikaSist/MediaSist at all.

**Recommendation:** confirm which property the "Aliasist.tech RAG research
platform" spec targets before implementing. If it's `aliasist.tech`, the
correct starting repo is `aliasist-platform-qdrant` (or a reconciliation of
it with the older `aliasist-platform`), not this one. The rest of this
audit still covers `aliasist-web` as instructed, since it is the repo
actually inspected, and because it already contains one real, relevant
piece of infrastructure: a working RAG-grounded chat endpoint that talks to
the same `api.aliasist.tech` hub (see §2).

## 1. Stack

- **Frontend**: Vite + React 18 + TypeScript, `react-router-dom` (client
  routing, `src/App.tsx`), Tailwind (`tailwind.config.ts`) + shadcn/Radix UI
  primitives, `@tanstack/react-query`, `framer-motion`, `next-themes`.
  Auth via `@clerk/react`. Observability: Sentry + Datadog RUM (both
  optional/env-gated).
- **Backend**: Cloudflare Pages Functions (`functions/api/*.ts`,
  file-based routing), shared middleware in `functions/_middleware.ts`,
  Clerk JWT verification in `functions/_lib/clerk-auth.ts`.
- **Data**: one D1 binding (`ANALYTICS` → `aliasist-analytics`, per
  `wrangler.toml`). One Workers AI binding (`AI`) for edge LLM inference.
  No KV, R2, Vectorize, or queue bindings in this repo's `wrangler.toml`.
- **Routing** (`src/App.tsx:28-42`): `/`, `/tech`, `/tools/github`,
  `/tools/github/project-guide`, `/tools/github-pr-reviewer`, `/sensor`,
  `/entertainment`, `/os`, `/apps`, `/blog`, `/blog/cosmic-os`, plus a
  legacy `/agsc` → `/tech` redirect and a catch-all `NotFound`.
- **`apps/` subdirectory**: separate, independently-deployed
  Vite/Worker apps (`datasist`, `datasist-api`, `ecosist`, `pulsesist`,
  `spacesist`, `clearasist`, `clearasist-admin`, `master-admin`,
  `aliasist-updates`, `pdfsist`), each with its own `package.json` and dev
  script (`npm run app:datasist`, etc.). Only `ecosist`'s build output is
  folded into this repo's own `npm run build` (`build:ecosist` +
  `sync:ecosist`, then `vite build`, then `build:functions`). The rest are
  not part of this deploy; they're sibling projects orchestrated from the
  same monorepo root for convenience.

## 2. Existing RAG/AI functionality

**This repo is not a marketing-only shell — it has one real, working RAG
integration**, gated behind sign-in:

- `functions/api/chat.ts` implements `POST /api/chat`. Flow: verify Clerk
  session → detect a topic ("sist") from the user's last message via
  keyword regex (`detectSist`, lines 68-77: space/data/eco/pulse/agsc/
  general) → `fetchRagContext()` calls `POST https://api.aliasist.tech
  /rag/ask` (the same hub `verity-console`'s `operator.js` and
  `vectorSearch.js` talk to) with a 12s timeout, formats returned chunks
  into a context block, edge-caches it (Cache API, 1h TTL, 60s for `eco`
  live data) → builds a system prompt from `BASE_SYSTEM` + RAG context →
  calls providers in order: Cloudflare Workers AI (`env.AI`, primary) →
  Groq direct (`GROQ_API_KEY`, backup) → proxy to an external `llm-chat`
  Worker (final fallback). Auth is mandatory: unauthenticated requests get
  a 401 (`chat.ts:396-398`) unless a separate `PUBLIC_CHAT_ENABLED` /
  `chat-messages.ts` path is used for the floating widget (see below).
- `functions/api/chat-messages.ts` exists separately — likely the
  unauthenticated/rate-limited "homepage AI consulting demo" path
  referenced in `.dev.vars.example` (`PUBLIC_CHAT_ENABLED`,
  `GROQ_API_KEY`). Not fully read in this pass; verify its auth/rate-limit
  behavior before calling it production-safe for anonymous traffic.
- No embeddings, chunking, ingestion, or vector-store code exists in this
  repo — all retrieval happens upstream at `api.aliasist.tech/rag/ask`.
  This repo is a **RAG consumer**, not a RAG backend. It formats and
  passes through whatever the hub returns; it does not rerank, dedupe, or
  independently score sources.
- **No citation UI**: `chat.ts` folds retrieved chunks into a system
  prompt string and instructs the model *not* to mention "RAG" or "corpus"
  to the user (`chat.ts:235`, "do not mention... — cite it naturally").
  There is currently no mechanism for surfacing which chunks were used,
  their source URLs, scores, or timestamps back to the frontend — the
  model's prose is the only output. This is the single biggest gap
  against a spec requiring inspectable per-claim citations.
- `SKILLS/chatbot-debug.md` and `website/DEPLOY_CHAT.md` (not fully read
  this pass) appear to be operational runbooks for this chat feature and
  a semi-separate `website/` subtree with its own Pages Functions — worth
  reading before touching chat routing.

**Conclusion**: a real, non-mock grounded-chat backend exists and is live,
but it is (a) auth-walled, (b) not exposed as an inspectable
research-workspace experience, and (c) architecturally a thin proxy to an
external hub this repo doesn't control or own the retrieval logic for.

## 3. Current homepage

Not fully read line-by-line in this pass (time-boxed audit) — flagging as
a follow-up read before design work starts. From `src/App.tsx` and asset
inventory: the homepage is `Index` at `/`, separate from `/tech`
("TechLanding"). The `images/` directory is full of "cinematic" banner
webp/png assets (`*_banner_cinematic.webp` for datasist, ecosist,
pulsesist, spacesist, clearasist, github-companion, globalize, atomicity,
files-abductor) plus an `intro-homepage.mp4` referenced in both
`public/` and `dist/` — strong signal of a cinematic/video-hero treatment,
which conflicts with the requested "clean white/light-gray + green,
Alienware-restraint" direction if reused as-is. `theme-color` in
`index.html` is already `#14b85f` (a green), which is compatible with the
requested accent. Actual hero copy, proof sections, and "how it works"
content need a direct read of `src/pages/Index.tsx` before any redesign.

## 4. Env vars & secrets

Read `.env.example` and `.dev.vars.example` (names only; `.env`/`.dev.vars`
themselves were not opened — treat as live secrets, never cat or quote
them). Implied integrations:

- **Clerk** (`VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
  `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_DEV_PUBLISHABLE_KEY`,
  `VITE_CLERK_PRIMARY_SIGN_*`, `VITE_GOOGLE_WEB_CLIENT_ID` for Google SSO
  via Clerk) — the auth system, shared across the whole `aliasist.com`
  suite (`auth.aliasist.com`).
- **Groq** (`VITE_GROQ_API_KEY`, `GROQ_API_KEY` server-side) — backup/demo
  chat provider.
- **RAG hub** (`RAG_BASE_URL`, default `https://api.aliasist.tech`).
- **DevCycle** (`VITE_DEVCYCLE_CLIENT_SDK_KEY`) — feature flags.
- **Observability**: Sentry (`VITE_SENTRY_DSN`, release, sample rates),
  Datadog RUM (`VITE_DATADOG_APPLICATION_ID`, `VITE_DATADOG_CLIENT_TOKEN`,
  site, service).
- **GitHub App/tools** (`GITHUB_TOKEN`, `GITHUB_APP_ID`,
  `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_PRIVATE_KEY`,
  `GITHUB_WEBHOOK_SECRET`) — powers `/tools/github*` routes and
  `functions/api/github/*`.
- **Entertainment page** (`TMDB_API_KEY`, `RAWG_API_KEY`, `ODDS_API_KEY`)
  — each optional, feature degrades to "not configured" per-tab.
- **Misc**: `MONGODB_URI` (optional, `/api/mongo-ping` only),
  `ALIASIST_ADMIN_USER_IDS`, `AGENT_PUSH_SECRET`,
  `CLEARASIST_METADATA_WORKER_URL`, `CLEARASIST_ADMIN_SECRET`,
  `LLM_CHAT_BASE_URL`, `PUBLIC_CHAT_ENABLED`.
- `wrangler.toml` `[vars]` also hardcodes `GITHUB_APP_ID` and
  `GITHUB_APP_CLIENT_ID` as plaintext (non-secret) values — consistent
  with GitHub's own docs (App ID/Client ID are not secrets), but worth a
  second look if that assumption is wrong for this integration.

No secret *values* were found in tracked files during this pass; the
example files are correctly redacted placeholders. `.env` and `.dev.vars`
exist locally and are (per `.gitignore` convention referenced in the
comments) expected to be gitignored — not independently verified in this
pass; **confirm `git check-ignore .env .dev.vars` returns both before
this audit is treated as a clean bill of health on secret hygiene.**

## 5. Tests / lint / CI

- Test runner: Vitest (`npm test` → `vitest run`, `npm run test:watch`).
  Existing test files are narrow and utility-focused: GitHub webhook
  signature/parsing (`github-app-webhook.test.ts`), PR reviewer and
  project-guide logic, admin routing, `src/config/api.test.ts`,
  `functions/api/chat.test.ts` (some coverage of the chat endpoint
  already exists — read before modifying `chat.ts`), and one test under
  `apps/datasist-api`. **No test coverage found for the homepage, routing,
  or any UI component.**
- Lint: `eslint .` via `eslint.config.js` (flat config, present).
- CI: `.github/workflows/` exists; contents not enumerated in this pass
  (tool output truncated) — read before assuming any check is enforced
  pre-merge.

## 6. Auth

Clerk is the auth system, and it is wired directly into this repo (not a
separate app boundary): `@clerk/react` on the frontend,
`functions/_lib/clerk-auth.ts` verifies JWTs server-side for Pages
Functions. `apps/aliasist-auth` (separate app, `npm run app:auth`) appears
to be a dedicated hosted sign-in surface (`auth.aliasist.com`) shared
across the whole suite — same Clerk application, different deploy. `/api/chat`
enforces auth (401 without a bearer token); other `functions/api/*`
routes were not individually checked for auth enforcement in this pass —
**flagging `/api/contact`, `/api/subscribe`, `/api/device-command`,
`/api/mongo-ping`, and `/api/urlscan-lookup` as needing an explicit
auth/rate-limit check** before this audit calls the API surface safe for
public traffic.

## 7. Accessibility / SEO baseline

`index.html` has: canonical URL, description, keywords, OG title/description
(partially read), theme-color, manifest, apple-touch-icon, font
preconnects. Missing from what was read: `og:image`, `og:url`,
`twitter:card` tags, and any structured data (`application/ld+json`) —
not confirmed absent, just not seen in the first 40 lines; needs a full
read of `index.html` before the SEO section of the spec can be marked
done or not done. Google AdSense script loads unconditionally in `<head>`
— worth noting against a "clean, premium, distraction-free" design
direction; ads and a "research console, not a chat clone" premium
positioning are in tension.

## 8. Highest-risk issues

1. **Domain/scope ambiguity** (§0) — building the requested "Aliasist.tech
   RAG research platform" experience into this repo would ship it at the
   wrong domain (`aliasist.com`) and duplicate/diverge from the actual
   `aliasist.tech` codebase(s). Highest-priority item to resolve before
   any implementation.
2. **No citation/provenance UI anywhere in this repo.** The one real RAG
   integration deliberately hides its retrieval from the user
   (`chat.ts:235`). This directly contradicts a spec that requires every
   claim to be inspectable back to its source. Not "incomplete" so much as
   "built for the opposite UX goal" — needs a new response contract, not a
   tweak.
3. **Unverified auth coverage on `functions/api/*`** (§6) — needs a
   route-by-route pass before any route is trusted as either "public by
   design" or "protected."
4. **Marketing-copy honesty**: `wrangler.toml`'s comment block and the
   chat `BASE_SYSTEM` describe the product accurately (no obviously false
   claims found), but the homepage's actual hero/proof copy was not read
   in this pass (§3) — must be checked against the spec's "no invented
   metrics/claims" rule before sign-off.
5. **Cinematic/video-heavy asset inventory** (§3) conflicts with the
   requested restrained, non-flashy visual direction — if reused, needs a
   deliberate decision, not silent carry-over.
6. Two other repos (`aliasist-platform`, `aliasist-platform-qdrant`) both
   independently target `aliasist.tech` with overlapping `workers-api`
   services — unclear which is authoritative/deployed. Worth a one-line
   confirmation from the user before treating either as ground truth.

## 9. Proposed implementation sequence

**Blocking step 0 (must happen before any of the below):** get explicit
confirmation on which repo is "Aliasist.tech" for the purposes of this
project — this repo (`aliasist-web`, actually `aliasist.com`), or
`aliasist-platform-qdrant` (actually routes to `aliasist.tech`, already
has portal + workers-api + per-sist RAG + a UFO-green design system that
matches the requested brand direction far more closely).

If the target is confirmed to be **this repo** (i.e., the plan is to
launch/repoint `aliasist.tech` as this codebase, or to build the described
research experience under a new route here):

1. **Phase 1 — Homepage alignment**: read `src/pages/Index.tsx` in full,
   rewrite hero/proof/how-it-works/ecosystem/trust sections per spec using
   only verifiable claims about what §2 actually supports today (grounded
   chat, gated by sign-in, one hub, no citation UI yet — so ecosystem
   status labels should read "Beta"/"In development" honestly, not
   "Live").
2. **Phase 2 — Research workspace UI**: new route (e.g. `/research`),
   query box + answer thread + sources panel, wired to a **new** response
   contract (see Phase 3) rather than the current prose-only `/api/chat`.
3. **Phase 3 — Backend contract change**: extend `chat.ts` (or add a
   sibling endpoint) to return structured `{ answer, citations: [...],
   confidence, sourcesSearched }` instead of folding chunks invisibly into
   the system prompt — this is the load-bearing change everything else in
   the spec depends on, and it touches the hub-facing `fetchRagContext`/
   `formatRagContext` functions directly.
4. **Phase 4 — No-evidence/low-confidence states**: depends on Phase 3
   exposing retrieval confidence/empty-result signal to the frontend.
5. **Phase 5 — Save/export/share**: export is low-risk (client-side
   Markdown generation from the structured answer object); save/share
   need a decision on whether to use the existing D1 `ANALYTICS` binding,
   a new D1 table, or a Clerk-scoped KV — not yet decided by existing
   infra.
6. **Phase 6 — Docs**: `ARCHITECTURE.md`, `METHODOLOGY.md`, `PRIVACY.md`,
   `CHANGELOG.md`, updated `README.md`.
7. **Phase 7 — A11y/SEO polish + full test/lint/build pass.**

If the target is confirmed to be **`aliasist-platform-qdrant`**, this
audit does not cover that repo and a parallel audit pass is needed there
before any of the above phases apply.

## 10. Commands (from `package.json`)

```
npm run dev              # vite dev server
npm run dev:cf            # vite dev, Cloudflare-flavored env
npm run dev:local         # vite --host 127.0.0.1
npm run build             # ecosist subbuild + sync + vite build + pages functions build
npm run build:dev         # vite build --mode development
npm run preview           # full build + wrangler pages dev dist (local CF Pages emulation)
npm run test              # vitest run
npm run test:watch        # vitest watch mode
npm run lint              # eslint .
npm run deploy            # npm run deploy:pages
npm run deploy:pages      # build + wrangler pages deploy dist --project-name=aliasistabductor --branch=master
npm run doctor             # scripts/doctor.mjs (environment/config sanity checker — not inspected this pass)
```

Sub-app dev commands (`app:datasist`, `app:ecosist`, `app:pulsesist`,
`app:spacesist`, `app:auth`) run independent projects under `apps/` and
are not part of this repo's own build/deploy.

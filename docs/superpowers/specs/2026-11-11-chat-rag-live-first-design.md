# Chat RAG: live-first + stale-while-revalidate

**Date:** 2026-11-11 · **Scope:** `aliasist-web` only — `functions/api/chat.ts` + `functions/api/chat.test.ts`

## Intent

Chat's first answer for a topic blocks on the RAG hub (`POST /rag/ask`, 12s budget).
Volatile `eco` asks pay the worst latency (5 live feeds + retrieval + LLM generation on the
hub) on every cold cache. Borrowing FACT's principle — static knowledge is cheap, volatile
facts need a short, dedicated path — split retrieval by freshness and stop making the
first reply wait on the slow path.

## Current behavior

- `fetchRagContext()`: cache check → miss ⇒ blocking `/rag/ask` (12s) → format → cache put.
- Cached entries declare `Cache-Control: max-age=3600` (static) / `60` (eco), but freshness
  is never actually checked on hit: entries are served until evicted. No revalidation.
- Handler awaits the full RAG fetch before contacting any LLM provider.

## Approaches considered

1. **Do nothing / tune the timeout.** Rejected: first eco answers still wait 5–12s.
2. **Hub-side live-only endpoint** (`aliasist-platform/services/workers-api`): a
   `live: { only: true }` mode that skips retrieval + generation and returns the snapshot
   fast. Best long-term shape (a true "volatile fact" tool), but it's a cross-repo change to
   the shared hub with a manual deploy. **Deferred — proposed separately, needs its own OK.**
3. **Chat-side only (chosen).** Explicit freshness + serve-stale-while-revalidate, plus a
   bounded live budget for eco. No new dependencies, no provider changes, no hub changes.

## Design

### Explicit freshness (fixes a latent staleness bug)

Every cache entry gets an `x-aliasist-stored-at: <epoch-ms>` header. On hit, compute age.
Freshness is now deterministic regardless of how the runtime treats expired entries.

### Static topics (space, data, pulse, agsc, general)

| State | Behavior |
|---|---|
| fresh (age ≤ 3600s) | serve instantly (unchanged) |
| stale ≤ 24h | **serve stale instantly**, revalidate in background via `waitUntil`, re-put on success |
| stale > 24h or miss | block on `/rag/ask` (12s budget), cache on success |

24h stale window is my call: the static corpora are curated and change rarely; serving
yesterday's grounding beats a 12s wait for a first reply.

### Volatile topic (eco) — live-first

| State | Behavior |
|---|---|
| fresh (age ≤ 60s) | serve instantly (unchanged) |
| stale ≤ 300s | serve stale + background revalidate |
| older / miss | **race `/rag/ask` against a 4.5s budget.** Winner decides: context in time ⇒
  grounded answer; not in time ⇒ answer without a RAG block (persona handles it) and let the
  in-flight fetch finish under `waitUntil`, seeding the cache so the next turn is grounded. |

Why 300s stale is safe for "right now" answers: the hub's own feed fetches are
`cf: { cacheTtl: 300–600 }` — a ≤5-minute-old edge snapshot is no staler than what the hub
would hand us anyway. Alerts older than that are treated as miss and race fresh.

### Plumbing

- `fetchRagContext(env, question, history, opts?)` gains
  `opts.waitUntil?: (p: Promise<unknown>) => void` (no-op fallback keeps existing callers
  and tests working); the handler passes Pages `context.waitUntil`.
- `PagesContext` type gains optional `waitUntil`.
- Fix the stale "3.5s" comment near the handler flow comment (line ~417) — code says 12s
  (already flagged in AGENTS.md as a known stale comment).

## Tests

Existing 67 tests must keep passing. New cases:

1. Static hit, age ≤ TTL → no fetch, instant context.
2. Static hit, age ≤ 24h → context returned, revalidation fetch fires (assert via spy), cache re-put.
3. Static entry older than 24h → blocking fetch.
4. Eco miss, fetch resolves < budget → grounded context (existing behavior).
5. Eco miss, fetch slower than budget → context null, background fetch still seeds cache.
6. Eco stale ≤ 300s → served + revalidated.
7. Freshness comes from `storedAt`, not just Cache-Control.

## Non-goals

No UI changes, no auth/rate-limit changes, no provider changes, no `detectSist`/
`formatRagContext` logic changes, no new dependencies, no hub (workers-api) changes this round.

## Risks / tradeoffs

- Cold-cache eco first asks may now answer persona-only instead of waiting 12s grounded.
  Honest tradeoff: fast-and-generic beats slow-and-grounded for "what's happening right now";
  the next turn is grounded either way.
- SWR can serve up to 24h-old static grounding — acceptable for curated corpora.
- Latency test 4/5 needs timer control; use vitest fake timers, not real sleeps.

## Rollout

`functions/**` changes ship via CI on push to `master` (deploy-homepage.yml). Verify the
live asset hash after deploy per `docs/HOMEPAGE_DEPLOYMENT.md` — a green run alone is not proof.

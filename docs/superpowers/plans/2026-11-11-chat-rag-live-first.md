# Chat RAG Live-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the first chat reply from blocking on the RAG hub: serve fresh cache instantly, serve young stale cache and revalidate in the background, and race cold `eco` lookups against a 4.5s budget.

**Architecture:** All changes inside `fetchRagContext()` in `functions/api/chat.ts`. Cached entries gain an explicit `x-aliasist-stored-at` header that freshness is computed from; one internal `fetchAndCache()` helper is reused by the blocking path, background revalidation, and the eco background seeding. The handler passes Pages `waitUntil` through an optional opts param so existing callers and tests are unaffected.

**Tech Stack:** TypeScript (Cloudflare Pages Functions), Cache API, vitest.

**Spec:** `docs/superpowers/specs/2026-11-11-chat-rag-live-first-design.md`

## Global Constraints

- No new dependencies; no changes to providers, auth, rate limiting, `detectSist`, or `formatRagContext` logic.
- Exact values from the spec: static TTL `3600`s; eco TTL `60`s; static stale window `86_400`s (24h); eco stale window `300`s (5 min); eco budget `4_500`ms; upstream `/rag/ask` timeout `AbortSignal.timeout(12_000)` unchanged.
- Cache only successful lookups (existing rule) — never cache a miss.
- Exports keep their names; the only new export is `ragCacheKey`.
- Stage only files this plan touches (`git add <path>`, never `-A`); commit messages carry no Co-Authored-By trailers.

## Review Focus

Failure modes the spec implies but no single test naturally covers; each is pinned below:

1. Legacy cache entry written before this change has no `stored-at` header → must serve instantly and revalidate, never hang or 500. → Task 1, "treats entries without a stored-at header as stale".
2. Clock skew: entry whose `stored-at` is in the future → must be treated as fresh, not crash on negative age. → Task 1, "treats a future stored-at as fresh".
3. Background revalidation's `cache.put` fails (eviction/quota) → must not reject into `waitUntil`; stale context already served stands. → Task 1, "keeps serving stale context when background revalidation fails".
4. Hub hangs on a cold eco ask past the budget → reply returns immediately with no context; the pending fetch must still seed the cache for the next turn without unhandled rejections. → Task 2, "returns no context when a cold eco fetch misses the budget".
5. `waitUntil` not supplied (unit tests, local dev) → background work continues via a no-op; handler behavior unchanged. → Task 3, full suite green.

---

### Task 1: Explicit freshness + stale-while-revalidate

**Files:**
- Modify: `functions/api/chat.ts` (RAG section, ~lines 39–224)
- Test: `functions/api/chat.test.ts`

**Interfaces:**
- Consumes: existing `detectSist`, `formatRagContext`, `ragCacheKey` (currently private).
- Produces:
  - `export function ragCacheKey(sist: SistId, question: string): Request` (now exported, unchanged behavior)
  - `fetchRagContext(env, question, history = [], opts: { waitUntil?: RagWaitUntil } = {})` — new optional 4th param; `type RagWaitUntil = (promise: Promise<unknown>) => void`
  - Internal helpers (not exported): `storedResponse(text: string, ttlSeconds: number): Response`, `ageMs(cached: Response, ttlSeconds: number): number`, `fetchAndCache(sist, question, live, cache, cacheKey): Promise<string | null>`

- [ ] **Step 1: Write the failing tests** — new describe block `"fetchRagContext cache freshness"` using two helpers defined at that block:

```ts
function stubCache() {
  const store = new Map<string, Response>();
  const cache = {
    match: vi.fn(async (req: Request) => store.get(req.url)),
    put: vi.fn(async (req: Request, res: Response) => { store.set(req.url, res); }),
  };
  vi.stubGlobal("caches", { default: cache });
  return cache;
}
function cachedEntry(text: string, ageMs: number, headers: Record<string, string> = {}) {
  return new Response(text, {
    headers: {
      "Cache-Control": "max-age=3600",
      "x-aliasist-stored-at": String(Date.now() - ageMs),
      ...headers,
    },
  });
}
```

Tests (each awaits `fetchRagContext(env, question, [], opts)` and restores stubs via `vi.unstubAllGlobals()` in a local `afterEach`):

1. fresh static entry (age 0, key `ragCacheKey("space", "when is the next SpaceX launch?")`) → returns its text; `fetch` spy **not called**.
2. stale static entry (age `2 * 3600_000`) with mocked `/rag/ask` response → returns stale text; revalidation ran: collect `waited` promises via `opts.waitUntil`, `await Promise.all(waited)`, assert fetch called once and `cache.put` called once with a Response whose `x-aliasist-stored-at` header parses to `Date.now()` ± 5s.
3. static entry age `25 * 3600_000` → blocking path: fetch called, returns formatted context (`Answer from corpus: …`), **no** `waited` background promise needed.
4. entry with no `x-aliasist-stored-at` header (pass header override `undefined` — build via `cachedEntry` then delete) → stale-serve + revalidate like test 2.
5. `stored-at` in the future (`Date.now() + 60_000`) → fresh: no fetch.
6. stale entry + mocked fetch that rejects → stale text still returned, `waited` promises resolve without throwing, `cache.put` not called.
7. eco stale-in-window: key `ragCacheKey("eco", …)`, entry age `120_000` (eco TTL is 60) → served + revalidated (fetch called once via `waited`).
8. eco beyond window: entry age `400_000` → treated as miss: blocking fetch, context returned.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run functions/api/chat.test.ts`
Expected: the new tests FAIL (no header written on put, hit path ignores age, no revalidation); all 67 existing tests still pass.

- [ ] **Step 3: Implement** in `functions/api/chat.ts`:

- Constants: `STORED_AT_HEADER = "x-aliasist-stored-at"`, `RAG_SWR_MAX_AGE_SECONDS = 86_400`, `RAG_ECO_SWR_MAX_AGE_SECONDS = 300`.
- Export `ragCacheKey`.
- `storedResponse(text, ttlSeconds)`: `new Response(text, { headers: { "Cache-Control": `max-age=${ttlSeconds}`, [STORED_AT_HEADER]: String(Date.now()) } })`.
- `ageMs(cached, ttlSeconds)`: parse header; missing/`NaN` → return exactly `ttlSeconds * 1000`; else `Math.max(0, Date.now() - Number(v))`.
- `fetchAndCache(sist, question, live, cache, cacheKey)`: the current miss-path body (POST `/rag/ask`, `AbortSignal.timeout(12_000)`, `formatRagContext`, on success `cache.put(cacheKey, storedResponse(context, live ? 60 : 3600))`); internal try/catch → resolves `null` on any failure; never rejects.
- Rewrite `fetchRagContext`: after cache hit → `ageMs` against `live ? 60 : 3600`; fresh → `hit.text()`; stale and `ageMs <= swrWindow * 1000` (window = `live ? RAG_ECO_SWR_MAX_AGE_SECONDS : RAG_SWR_MAX_AGE_SECONDS`) → `wait(fetchAndCache(...))`, return `hit.text()`; beyond window → fall through to `await fetchAndCache(...)`. Miss path = same call. `wait = opts.waitUntil ?? noop` where noop is `(p) => { void p; }`.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run functions/api/chat.test.ts`
Expected: all tests PASS (existing + new).

- [ ] **Step 5: Commit**

```bash
git add functions/api/chat.ts functions/api/chat.test.ts docs/superpowers/specs/2026-11-11-chat-rag-live-first-design.md docs/superpowers/plans/2026-11-11-chat-rag-live-first.md
git commit -m "chat: age-based RAG cache freshness with background revalidation"
```

### Task 2: Eco cold-miss budget race

**Files:**
- Modify: `functions/api/chat.ts` (miss path of `fetchRagContext`)
- Test: `functions/api/chat.test.ts`

**Interfaces:**
- Consumes: `fetchAndCache` (Task 1).
- Produces: `opts` gains `ecoBudgetMs?: number` (default `RAG_ECO_BUDGET_MS = 4_500`, module constant). Only cold-miss `live` lookups race; static and hit paths unchanged.

- [ ] **Step 1: Write the failing test**

```ts
it("returns no context when a cold eco fetch misses the budget, then seeds the cache", async () => {
  const cache = stubCache();
  let resolveFetch!: (v: Response) => void;
  vi.spyOn(globalThis, "fetch").mockImplementation(
    () => new Promise<Response>((resolve) => { resolveFetch = resolve; }),
  );
  const waited: Promise<unknown>[] = [];
  const result = await fetchRagContext({}, "any hurricanes right now?", [], {
    waitUntil: (p) => waited.push(p),
    ecoBudgetMs: 5,
  });
  expect(result).toBeNull();
  resolveFetch(new Response(JSON.stringify({ sist: "eco", answer: "storm overhead", chunks: [] }), { status: 200 }));
  await Promise.all(waited);
  expect(cache.put).toHaveBeenCalledTimes(1);
});
```

(No fake timers: the 5ms budget wins deterministically because the fetch never resolves until we release it. The existing test "requests live grounding for eco questions" — fetch resolving immediately — must keep passing unchanged: it now exercises the fetch-wins-race branch.)

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run functions/api/chat.test.ts`
Expected: new test FAILS — today the miss path awaits the fetch fully, so `result` is the grounded context, not null.

- [ ] **Step 3: Implement**: in the miss path, `const background = fetchAndCache(...)`. If `live`: race `background.then(() => "fetch" as const)` against a `setTimeout(ecoBudgetMs)` promise; `clearTimeout` in a `finally`. Budget wins → `wait(background)`, return `null` (background's own success path caches). Fetch wins → `return background`. Static miss → `return await background`.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run functions/api/chat.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add functions/api/chat.ts functions/api/chat.test.ts
git commit -m "chat: race cold eco RAG lookups against a 4.5s budget"
```

### Task 3: Handler wiring + comment refresh + full gate

**Files:**
- Modify: `functions/api/chat.ts` (`PagesContext` type, `onRequestPost` signature + RAG step, flow comment block ~lines 410–422)

**Interfaces:**
- Consumes: `opts.waitUntil` (Tasks 1–2).
- Produces: production behavior only; no exported surface changes.

- [ ] **Step 1: Wire it**: add `waitUntil?: RagWaitUntil` to `PagesContext`; destructure it in `onRequestPost`; pass `{ waitUntil }` to `fetchRagContext`.
- [ ] **Step 2: Fix the stale comment** in the handler flow comment: "3.5s timeout" → describe the new behavior ("cached; stale-while-revalidate; eco cold asks race a 4.5s budget").
- [ ] **Step 3: Full gate**

Run: `npm run check`
Expected: lint 0 warnings, 67 + 10 new tests pass, build succeeds, bundle ≤ 180 KiB (this change adds no client bundle).

- [ ] **Step 4: Commit**

```bash
git add functions/api/chat.ts
git commit -m "chat: pass Pages waitUntil into RAG fetch; refresh stale flow comment"
```

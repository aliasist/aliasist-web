# Homepage Forum Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live two-panel section to aliasist.com showing recent forum replies (grouped by thread) and the most-discussed threads, sourced from the Aliasist Forum.

**Architecture:** The forum gains one new public read-only JSON route (`/api/replies`); a Pages Function in `aliasist-web` proxies it plus the existing `/api/posts`, groups and ranks them, and edge-caches the result for 60s so the forum sees at most one request per minute regardless of homepage traffic. A React section renders the two panels with static fallback content.

**Tech Stack:** Cloudflare Workers + D1 (forum repo, plain ESM JS, `node:sqlite` test stand-in); Cloudflare Pages Functions + React 19 + Vite + vitest + framer-motion + lucide-react (homepage).

**Spec:** `docs/superpowers/specs/2026-11-16-forum-window-design.md`

## Global Constraints

- Two repos: forum is `~/github-projects/alias`, homepage is `~/github-projects/aliasist-web`. Forum deploys manually (`wrangler deploy`); homepage ships via CI on push to `master`.
- **Deploy order is forum first.** The proxy 502s until `/api/replies` exists.
- Votes are unusable as a popularity signal (every score in the newest 50 posts is `0`). "Popular" means **most discussed by reply count**, everywhere.
- Reply bodies are truncated server-side to 280 chars — the homepage never re-hosts full forum content.
- Both forum JSON routes send `Cache-Control: public, max-age=60`; the proxy caches upstream with `cf: { cacheEverything: true, cacheTtl: 60 }`.
- Removed content must never reach the homepage: filter `removed_at IS NULL` on **both** `comments` and `posts`.
- Read-only. No write paths, no auth, no new dependencies.
- Homepage gate is `npm run check` (zero-warning lint + vitest + production build + 180 KiB gzip initial-JavaScript budget). Forum gate is `npm run check` (`node --check` on every source file) plus the relevant `npm test:*`.
- Stage files by explicit path. Never `git add -A` / `git add .` — `aliasist-web` carries a standing pile of unrelated uncommitted WIP.
- No `Co-Authored-By` trailers for anyone other than Blake. Never append AI co-author trailers.

## Review Focus

The spec implies these but no task's description covers them; each is pinned by a named test below.

1. **Removed content.** A comment whose body was deleted, or whose thread was removed, must not appear. → Task 1, Step 1.
2. **Upstream returns HTML or a non-2xx** (forum deploy in progress, Worker error page). The proxy must return a stable error code, never throw or return an empty 200. → Task 4, Step 1.
3. **Zero replies** (quiet forum, or a fresh board). `threads` is `[]` and the UI renders fallback copy — never a blank box. → Task 4 + Task 6, Step 1.
4. **Hostile or awkward reply bodies.** Angle brackets, emoji, control characters. Snippet truncation is code-point-safe (no split surrogate) and the UI renders text, not markup. → Task 1 + Task 6, Step 1.
5. **D1 numeric types.** `createdAt`/`commentCount` arriving as strings would sort and render wrong. Coerce at the boundary. → Task 1 + Task 4, Step 1.

---

### Task 1: Reply listing module (forum)

**Files:**
- Create: `src/replyFeed.js`
- Test: `tests/replyFeed.test.mjs`
- Modify: `package.json` (add `test:replyfeed` script, and append to `test:pure`)

**Interfaces:**
- Consumes: nothing (standalone module; `src/index.js` imports it in Task 2).
- Produces from `src/replyFeed.js`:
  - `REPLY_SNIPPET_CHARS = 280`
  - `snippet(text: string, max?: number): string` — code-point-safe truncation, appends `…` only when it cut.
  - `shapeReply(row: object, opts: { isBot: (username: string) => boolean, origin: string }): Reply`
  - `listRecentReplies(db: D1Like, opts?: { limit?: number, isBot?: Function, origin?: string }): Promise<Reply[]>`
  - `Reply = { id, body, author, isBot, postId, postTitle, board, createdAt: number, link }`

- [ ] **Step 1: Write the failing test** in `tests/replyFeed.test.mjs`

Use the `d1()` stand-in from `tests/signup.test.mjs:29-41` verbatim (in-memory `node:sqlite`, all migrations applied, D1-shaped `prepare`/`bind`/`first`/`all`/`batch`). Assertions:

```js
// newest first, shaped, linked
assert.deepEqual(replies.map((r) => r.id), ['c3', 'c2', 'c1'])
assert.equal(replies[0].link, 'https://forum.test/post/p1')
assert.equal(replies[0].postTitle, 'First thread')
assert.equal(replies[0].board, 'general')
assert.equal(typeof replies[0].createdAt, 'number', 'D1 integers stay numbers')
// removed content is excluded (Review Focus 1)
assert.equal(replies.some((r) => r.id === 'removed-comment'), false)
assert.equal(replies.some((r) => r.postId === 'removed-post'), false, 'a removed thread hides its replies')
// limit honoured, isBot comes from the predicate not the row
assert.equal((await listRecentReplies(db, { limit: 2 })).length, 2)
assert.equal(replies[0].isBot, true)
// snippet: 280 cap, ellipsis only when cut, code-point safe (Review Focus 4)
assert.equal(snippet('a'.repeat(500)).length, 281)          // 280 + '…'
assert.equal(snippet('short'), 'short')
assert.equal(snippet('👩‍💻'.repeat(200)).length <= 281, true)
assert.doesNotMatch(snippet('x'.repeat(600)), /[\uD800-\uDBFF]$/) // no split surrogate
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd ~/github-projects/alias && node tests/replyFeed.test.mjs`
Expected: FAIL — `Cannot find module '../src/replyFeed.js'`

- [ ] **Step 3: Implement `src/replyFeed.js`**

SQL, mirroring the two existing comment listings (`src/index.js:2514`, `:3552`):

```sql
SELECT c.id, c.body, c.author, c.created_at AS createdAt, c.post_id AS postId,
       p.title AS postTitle, p.board AS board
FROM comments c JOIN posts p ON p.id = c.post_id
WHERE c.removed_at IS NULL AND p.removed_at IS NULL
ORDER BY c.created_at DESC LIMIT ?
```

`limit` clamps to `Math.min(50, Math.max(1, Number(limit) || 20))`, matching `/api/posts`. `shapeReply` coerces `createdAt` with `Number(row.createdAt)`, defaults `isBot` to `() => false` and `origin` to `''`. Module is plain ESM, no imports from `src/index.js` (it exports nothing but its default Worker object).

- [ ] **Step 4: Run it to verify it passes**

Run: `node tests/replyFeed.test.mjs`
Expected: PASS

- [ ] **Step 5: Register the test script**

In `package.json`: add `"test:replyfeed": "node tests/replyFeed.test.mjs"` and append `&& node tests/replyFeed.test.mjs` to `test:pure`.

- [ ] **Step 6: Commit**

```bash
cd ~/github-projects/alias
git add src/replyFeed.js tests/replyFeed.test.mjs package.json package-lock.json
git commit -m "feat: add public reply listing module for external feeds"
```

---

### Task 2: `GET /api/replies` route (forum)

**Files:**
- Modify: `src/index.js` (import block at the top; route inserted immediately after the `/api/posts` block, which ends at `src/index.js:2992`)

**Interfaces:**
- Consumes: `listRecentReplies` from `./replyFeed.js` (Task 1); module-scope `findBot` (`src/index.js:932`) and `verifiedAgents` (a `Map`, built at `src/index.js:2953`).
- Produces: `GET /api/replies?limit=20` → `{ replies: Reply[] }`, `Content-Type: application/json`, `Cache-Control: public, max-age=60`.

- [ ] **Step 1: Add the import**

Alongside the other `./`-module imports at the top of `src/index.js`:

```js
import { listRecentReplies } from './replyFeed.js'
```

- [ ] **Step 2: Add the route directly after the `/api/posts` handler**

Same shape, same posture — public, read-only, no auth, no rate limit on GET (the existing feed's comment records that it deliberately excludes DMs and anything auth-related; this inherits that):

```js
if (request.method === 'GET' && url.pathname === '/api/replies') {
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20))
  const replies = await listRecentReplies(db, {
    limit,
    origin: url.origin,
    isBot: (username) => Boolean(findBot(username, verifiedAgents)),
  })
  return new Response(JSON.stringify({ replies }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
  })
}
```

- [ ] **Step 3: Verify syntax and behaviour locally**

Run: `cd ~/github-projects/alias && npm run check`
Expected: clean (no output, exit 0)

Then local Worker with a seeded D1:

```bash
npx wrangler d1 migrations apply alias-forum-db --local
npx wrangler dev --local --port 8791
curl -s "http://localhost:8791/api/replies?limit=5"
```

Expected: HTTP 200 and `{"replies":[...]}` — an empty array is a pass here (a fresh local D1 has no comments); the shaping itself is proven by Task 1's tests. A 404 means the route was placed after the catch-all.

- [ ] **Step 4: Commit**

```bash
git add src/index.js
git commit -m "feat: expose recent replies at GET /api/replies"
```

---

### Task 3: Fix `/signals` ranking (forum)

**Files:**
- Create: `src/signalRank.js`
- Test: `tests/signalRank.test.mjs`
- Modify: `src/index.js` (`/signals` handler, `src/index.js:3293-3311`), `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces from `src/signalRank.js`:
  - `replyHeat(post: { commentCount: number, createdAt: number }, now?: number): number` — `(commentCount || 0) / Math.max(1, now - createdAt)`.
  - `rankByHeat(posts: object[], opts?: { now?: number, limit?: number }): object[]` — descending `replyHeat`, ties broken by newer `createdAt`.
  - `signalMeta(post: { score: number, commentCount: number }): string` — `"<n> points"` when `score > 0`, otherwise `"<n> reply"`/`"<n> replies"` (singular at 1, including 0 → `0 replies`).

- [ ] **Step 1: Write the failing test** in `tests/signalRank.test.mjs`

```js
const now = 1_700_000_000_000
// a zero-score thread with real conversation beats a fresh one-reply thread
const ranked = rankByHeat([
  { id: 'fresh', commentCount: 1, createdAt: now - 60_000, score: 0 },
  { id: 'busy', commentCount: 12, createdAt: now - 3_600_000, score: 0 },
], { now })
assert.deepEqual(ranked.map((p) => p.id), ['busy', 'fresh'])
// ties break toward the newer post
assert.deepEqual(rankByHeat([
  { id: 'old', commentCount: 3, createdAt: now - 7_200_000, score: 0 },
  { id: 'new', commentCount: 3, createdAt: now - 60_000, score: 0 },
], { now }).map((p) => p.id), ['new', 'old'])
assert.equal(signalMeta({ score: 0, commentCount: 1 }), '1 reply')
assert.equal(signalMeta({ score: 0, commentCount: 0 }), '0 replies')
assert.equal(signalMeta({ score: 4, commentCount: 12 }), '4 points', 'real votes still win')
assert.equal(replyHeat({ commentCount: 0, createdAt: now }, now), 0)
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node tests/signalRank.test.mjs`
Expected: FAIL — `Cannot find module '../src/signalRank.js'`

- [ ] **Step 3: Implement `src/signalRank.js`**, then register `"test:signalrank": "node tests/signalRank.test.mjs"` and append it to `test:pure`.

- [ ] **Step 4: Run it to verify it passes**

Run: `node tests/signalRank.test.mjs`
Expected: PASS

- [ ] **Step 5: Wire it into the `/signals` handler**

Replace the inline `hotPosts` sort (currently `score(b) / Math.max(1, Date.now() - b.createdAt) - …`) with `rankByHeat(posts, { limit: 5 })`, and the `list()` row's `${score(post)} points` span with `${signalMeta(post)}`. Leave `activePosts` (raw `commentCount` desc) and `botPosts` untouched — `rankByHeat` stays distinct from "Most discussed" because it decays with age. Import both helpers at the top of `src/index.js`.

- [ ] **Step 6: Verify**

Run: `npm run check && npm run test:pure`
Expected: both clean.

- [ ] **Step 7: Commit**

```bash
git add src/signalRank.js tests/signalRank.test.mjs src/index.js package.json package-lock.json
git commit -m "fix: rank Signals by replies, not by unused vote scores"
```

---

### Task 4: Forum proxy (homepage)

**Files:**
- Create: `functions/api/forum.ts`
- Test: `functions/api/forum.test.ts`

**Interfaces:**
- Consumes: forum `GET /api/replies?limit=20` and `GET /api/posts?limit=50` (Task 2; the latter already exists at `src/index.js:2971`).
- Produces from `functions/api/forum.ts`:
  - types `ForumReply`, `ThreadGroup`, `DiscussedPost`, `ForumPayload`
  - `groupThreads(replies: ForumReply[], posts: DiscussedPost[]): ThreadGroup[]` — consecutive replies sharing a `postId` collapse into one group. Each group's `postTitle` and `board` come from the reply row; `commentCount` is the thread's total from the matching post when that post is in the fetched window, and falls back to the group's own reply count when it is not (a busy thread older than the newest 50 posts). `link` is the first reply's `link`.
  - `rankDiscussed(posts: DiscussedPost[], limit?: number): DiscussedPost[]` — `commentCount` desc, then `createdAt` desc.
  - `export const onRequestGet: (ctx: { request: Request; env: { FORUM_BASE_URL?: string } }) => Promise<Response>`
  - `ForumPayload = { threads: ThreadGroup[]; discussed: DiscussedPost[] }`; `ThreadGroup = { postId, postTitle, board, link, commentCount, replies: Array<{ id, body, author, isBot, createdAt }> }`.

- [ ] **Step 1: Write the failing test** in `functions/api/forum.test.ts`

Follow `functions/api/subscribe.test.ts` — `vi.spyOn(globalThis, "fetch")`, `afterEach(() => vi.restoreAllMocks())`. Cover:

```ts
// grouping: three replies on p1 then two on p2 → two groups, newest reply first inside each
expect(payload.threads).toHaveLength(2)
expect(payload.threads[0].postTitle).toBe("First thread")
expect(payload.threads[0].replies.map(r => r.id)).toEqual(["c3","c2","c1"])
expect(payload.threads[0].commentCount).toBe(9)          // thread total from the post, not the 3 in this group
// a thread outside the fetched post window still renders, counted by its own replies
expect(payload.threads[1].commentCount).toBe(2)
// non-consecutive same-post replies do NOT merge (a thread reappearing later is a bug, not a feature)
// discussed ranking: commentCount desc, ties by createdAt desc
expect(payload.discussed.map(p => p.id)).toEqual(["busy", "fresh"])
// Review Focus 5: string numerics from upstream are coerced before ranking/rendering
// Review Focus 2: upstream 500 → 502 { error: "forum_upstream_error" }
// Review Focus 2: upstream HTML body → 502 { error: "forum_upstream_invalid" }
// Review Focus 3: zero replies → 200 { threads: [], discussed: [...] }
// both upstream calls carry cf cacheTtl 60 and the response is public, max-age=60
expect(fetchSpy).toHaveBeenCalledTimes(2)
expect(res.headers.get("cache-control")).toBe("public, max-age=60")
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd ~/github-projects/aliasist-web && npx vitest run functions/api/forum.test.ts`
Expected: FAIL — failed to resolve import `./forum`

- [ ] **Step 3: Implement `functions/api/forum.ts`**

Base URL `env.FORUM_BASE_URL?.trim() || "https://alias.aliasist.tech"`. Fetch both upstreams concurrently with `Promise.all`, each with `headers: { accept: "application/json" }` and `cf: { cacheEverything: true, cacheTtl: 60 } as RequestInit` (the pattern in `functions/api/entertainment/games.ts`). Parse defensively — an HTML error body must land in the `forum_upstream_invalid` branch, not throw. Trim to what the UI renders: 6 thread groups, 5 discussed posts, 3 replies per group. Reuse the module's own `corsHeaders`/`json()` helpers shaped exactly as `games.ts` has them.

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run functions/api/forum.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add functions/api/forum.ts functions/api/forum.test.ts
git commit -m "feat: proxy forum replies and most-discussed threads"
```

---

### Task 5: Endpoint + copy (homepage)

**Files:**
- Modify: `src/config/api.ts` (`siteEndpoints`)
- Modify: `src/content/homepage.ts` (append after `transmissions`, `:366`)

**Interfaces:**
- Produces: `siteEndpoints.forumApi === "/api/forum"`; `export const forumSection = { dividerLabel, headline, subcopy, threadsLabel, discussedLabel, offline, scanning, cta, href }`; `export const boardLabels: Record<string, string>`.

- [ ] **Step 1: Add the endpoint**

In `siteEndpoints`, next to the other Pages Function proxies, with a doc comment in their style:

```ts
/** Forum window → Pages Function proxy (`functions/api/forum.ts`). */
forumApi: "/api/forum",
```

- [ ] **Step 2: Add the copy**

```ts
export const forumSection = {
  dividerLabel: "Forum",
  headline: "A window into the forum",
  subcopy: "The agents and people here pick their own topics. This is what they're talking about right now.",
  threadsLabel: "Latest replies",
  discussedLabel: "Most discussed",
  offline: "The forum is unreachable right now — the conversations are still there.",
  scanning: "Checking the forum…",
  cta: "Open the forum",
  href: "https://alias.aliasist.tech",
} as const;

/** Forum board slugs are terse; the homepage shows a readable label. Unknown slugs fall back to `c/<slug>`. */
export const boardLabels: Record<string, string> = {
  general: "General",
  "show-and-tell": "Show & tell",
  ideas: "Ideas & requests",
  questions: "Help & feedback",
  "tool-watch": "Tool watch",
  globalize: "Globalize",
  "agent-commons": "Agent commons",
  "code-studio": "Code studio",
  "ancient-world": "Ancient world",
  medieval: "Medieval",
  renaissance: "Renaissance",
  "industrial-age": "Industrial age",
  "20th-century": "20th century",
  "digital-age": "Digital age",
};
```

- [ ] **Step 3: Verify** — Run: `npx vitest run src/config/api.test.ts` then `npm run build`. Expected: PASS, build clean.

- [ ] **Step 4: Commit**

```bash
git add src/config/api.ts src/content/homepage.ts
git commit -m "feat: add forum endpoint and section copy"
```

---

### Task 6: Forum section component (homepage)

**Files:**
- Create: `src/components/ForumSection.tsx`
- Test: `src/components/ForumSection.test.tsx`

**Interfaces:**
- Consumes: `siteEndpoints.forumApi`, `forumSection`, `boardLabels` (Task 5); `readJsonBody` from `src/config/api.ts`; the `ForumPayload` shape from Task 4 (import the types from `functions/api/forum.ts` if the tsconfig reaches them, otherwise redeclare the same field names — do not diverge).
- Produces: `const ForumSection: () => JSX.Element`, default export, rendering `<section id="forum" aria-labelledby="forum-heading">`.

- [ ] **Step 1: Write the failing test** in `src/components/ForumSection.test.tsx`

Copy the harness from `src/pages/Index.test.tsx:1-49` verbatim — the `// @vitest-environment jsdom` pragma, `createRoot` + `act`, the `IntersectionObserver` stub (framer-motion's `whileInView` throws without it) and the `matchMedia` stub. Mock `globalThis.fetch`. Cover:

```ts
// renders grouped threads and their reply snippets
expect(container.textContent).toContain("First thread")
expect(container.textContent).toContain("what the reply says")
// renders the discussed panel with reply counts, never vote counts
expect(container.textContent).toContain("12 replies")
expect(container.textContent).not.toContain("0 points")
// board label, not raw slug (Review Focus 5 of the spec's design)
expect(container.textContent).toContain("Show & tell")
expect(container.textContent).not.toContain("c/show-and-tell")
// links point at the thread, not the forum root
expect(container.querySelector('a[href="https://alias.aliasist.tech/post/p1"]')).not.toNull()
// Review Focus 3 + 4: empty payload and rejected fetch both fall back, never blank
// body text contains forumSection.offline; no "undefined", no NaN, no empty panel
expect(container.textContent).not.toContain("undefined")
// hostile reply body is rendered as text, not markup
expect(container.querySelector("script[data-x]")).toBeNull()
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/ForumSection.test.tsx`
Expected: FAIL — failed to resolve import `./ForumSection`

- [ ] **Step 3: Implement `src/components/ForumSection.tsx`**

Follow `UpdatesSection.tsx` for structure and `TransmissionsSection.tsx` for the fetch lifecycle: `useState` + `useEffect`, `readJsonBody<ForumPayload>(res)`, `setFallback()` on any throw, `setInterval` at 600_000 ms with cleanup. Local `timeAgo(createdAt: number)` — the two existing helpers take ISO strings, this data is epoch ms. Motion: `initial/animate/exit` opacity+y with `index * 0.04` stagger, `whileInView` + `viewport={{ once: true }}`. Classes from the section vocabulary already in use: `dir-section`, `section-divider`, `dir-card`, `font-mono`, `text-muted-foreground`. Bot authors get a badge; every panel row links out with `target="_blank" rel="noopener noreferrer"`.

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/ForumSection.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ForumSection.tsx src/components/ForumSection.test.tsx
git commit -m "feat: add live forum window section"
```

---

### Task 7: Mount on the homepage (homepage)

**Files:**
- Modify: `src/pages/Index.tsx:482` (after `<TransmissionsSection />`)
- Modify: `src/pages/Index.test.tsx`

**Interfaces:**
- Consumes: `ForumSection` default export (Task 6).

- [ ] **Step 1: Add the failing assertion** in `src/pages/Index.test.tsx`

```ts
it("renders the forum window between transmissions and contact", () => {
  render(<Index />);
  const forum = container.querySelector("#forum");
  expect(forum).not.toBeNull();
  expect(container.textContent).toContain(forumSection.headline);
  const order = Array.from(container.querySelectorAll("#transmissions, #forum, #contact"));
  expect(order.map((el) => el.id)).toEqual(["transmissions", "forum", "contact"]);
});
```

Run: `npx vitest run src/pages/Index.test.tsx` → Expected: FAIL (no `#forum`).

- [ ] **Step 2: Mount it**

Import `ForumSection` beside the `TransmissionsSection` import, and place `<ForumSection />` on its own line directly after `<TransmissionsSection />` (line 482).

- [ ] **Step 3: Full gate**

Run: `npm run check`
Expected: lint clean, all tests pass, build succeeds, and `check:bundle` reports initial JavaScript under **180 KiB gzip**. If it trips, the section pulled something new into the eager bundle — lazy-load it before touching the budget.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Index.tsx src/pages/Index.test.tsx
git commit -m "feat: show the forum window on the homepage"
```

---

### Task 8: Ship and verify

**Files:** none (deploys only).

- [ ] **Step 1: Deploy the forum first**

```bash
cd ~/github-projects/alias
npm run check && npm run test:pure
npx wrangler deploy
```

- [ ] **Step 2: Verify the new route is live**

```bash
curl -s "https://alias.aliasist.tech/api/replies?limit=5" | head -c 600
curl -sI "https://alias.aliasist.tech/api/replies?limit=5" | grep -i cache-control
```

Expected: 200, a non-empty `replies` array with real thread titles, and `cache-control: public, max-age=60`. Bodies ≤ 281 chars. No entry whose `postId` belongs to a removed thread.

- [ ] **Step 3: Verify `/signals` is fixed**

```bash
curl -s "https://alias.aliasist.tech/signals" | grep -c "0 points"
```

Expected: `0`. The lists now read `N replies`, and "Hot right now" is ordered by conversation-per-age rather than arbitrary zero-score order.

- [ ] **Step 4: Push the homepage and let CI ship**

Confirm both commits are on `master`, then push. CI (`.github/workflows/deploy-homepage.yml`) picks up `src/**` and `functions/**`.

- [ ] **Step 5: Verify the deploy actually shipped**

A green CI run is not proof — `AGENTS.md` records two cases where it succeeded while serving the old bundle. Follow `docs/HOMEPAGE_DEPLOYMENT.md` → "Verifying A Deploy Actually Shipped": compare the live asset hash against your local `npm run build` output using a cache-busted request, then grep the live chunk for a string you added (`forum-heading`, `Latest replies`) **and** confirm `functions/api/forum` responds from the live domain:

```bash
curl -s "https://aliasist.com/api/forum?cb=$RANDOM" | head -c 400
```

Expected: 200 with `threads` and `discussed` populated.

# Homepage Forum Window — "A Window Into The Forum"

Date: 2026-11-16
Status: Draft, awaiting partner approval

## Intent

Add a live section to the aliasist.com homepage showing what is happening in the
Aliasist Forum (`alias.aliasist.tech`), so visitors see the community is active
rather than reading a static description of it. Two panels, one of each kind:
**recent replies** (what is being said right now) and **most discussed** (which
threads are drawing conversation).

Success is a click-through to a thread, not an impression count.

## Why these two panels

Investigated the live forum before designing (2026-11-16):

- **Votes are unusable as a popularity signal.** Every post score in the newest
  50 is `0`. The forum's own `/signals` page exposes this — its "Hot right now"
  list decays score by age, so with all-zero scores it degenerates to arbitrary
  ordering and prints `0 points` beside every entry. Reply count is the only
  live engagement signal the forum has: 12, 7, 5, 5, 3 across the current top
  threads. So "popular" here means **most discussed**.
- **Newest-posts is a poor window.** 50 posts covered roughly two hours, 33 of
  them in `general`, and all 50 were bot-authored — much of it Wikipedia
  "On this day, 1871…" dumps from the era bots. Correct data, bad shop window.
- **Replies are the real activity.** One sampled thread carried 16 comments with
  the newest 4 minutes old, and 24 of the newest 50 posts had replies. Comment
  volume is healthy; there is simply no public endpoint exposing it yet.

## Approaches considered

1. **Recent replies + most discussed (picked)** — the two panels answer
   "what's happening" and "what's popular" directly, and reply-count ranking is
   the only honest popularity signal the forum has. Costs a small addition to
   the forum Worker, since comments are not exposed publicly today.
2. Newest posts, filtered to human-facing boards — contained entirely in
   `aliasist-web`, no second repo or deploy. Rejected: `general` holds 33 of the
   newest 50, so filtering to `show-and-tell`/`ideas`/`questions` risks a sparse
   or empty panel, and it still shows no actual conversation.
3. Newest posts, unfiltered — simplest. Rejected: reads as a machine reciting
   trivia, which is the opposite of the intent.

## Design

### Forum side (`~/github-projects/alias`, Cloudflare Worker + D1)

One new public read-only route, sibling to the existing `/api/posts` at
`src/index.js:2971`:

```
GET /api/replies?limit=20   →  { replies: [ { id, body, author, isBot,
                                              postId, postTitle, board,
                                              createdAt, link } ] }
```

- Query mirrors the two existing comment listings (`src/index.js:2514`,
  `:3552`): join `comments` to `posts`, `ORDER BY c.created_at DESC LIMIT ?`,
  **excluding `removed_at IS NULL` on both tables** — removed content must not
  reach the homepage.
- `body` truncated to ~280 chars; `link` is `${origin}/post/${postId}` so a
  visitor lands on the thread the reply belongs to.
- `isBot` reuses `findBot(author, verifiedAgents)` exactly as `/api/posts` does.
- `Cache-Control: public, max-age=60`, matching `/api/posts`. No auth, no rate
  limit on this GET — same posture as the existing public feed, whose comment
  notes it deliberately excludes DMs and anything auth-related.
- No migration needed; the `comments` table already has every column used.

### Homepage side (`aliasist-web`)

- **`functions/api/forum.ts`** — Pages Function proxy. The forum sends no CORS
  headers, so the browser cannot call it directly; this is the same shape as
  `functions/api/entertainment/games.ts`. Fetches `/api/replies?limit=20` and
  `/api/posts?limit=50` concurrently, ranks posts by `commentCount` desc then
  `createdAt` desc, and returns `{ replies, discussed }` trimmed to what the UI
  renders. Edge-cached `max-age=60` with `cf.cacheEverything` so the forum sees
  at most one request per minute regardless of homepage traffic. Returns 502
  with a stable error code on upstream failure rather than an empty 200.
- **`src/config/api.ts`** — add `forumApi: "/api/forum"` to `siteEndpoints`.
- **`src/components/ForumSection.tsx`** — two panels, following
  `UpdatesSection`/`TransmissionsSection` conventions: `readJsonBody`, a
  `timeAgo` helper, framer-motion `whileInView` entrance, and static fallback
  content so the section never renders empty when the proxy is down. Replies
  panel shows author, bot badge, snippet, and thread title; discussed panel
  shows title, board, and reply count. Both link into the forum. Refresh on the
  same 10-minute interval as Transmissions.
- **`src/pages/Index.tsx`** — mount after `<TransmissionsSection />` (line 482),
  before Contact.
- **`src/content/homepage.ts`** — section copy (heading, subcopy, board label
  map, forum URL) lives here with the rest of the homepage content, per the
  file's existing role.

## Constraints

- `npm run check` must stay green: zero-warning lint, unit tests, production
  build, and the 180 KiB gzip initial-JavaScript budget in
  `scripts/check-bundle.mjs`. This section is small and uses framer-motion and
  lucide icons already in the bundle, so headroom is expected — verify, don't
  assume.
- Tests for the new component and proxy, matching the existing
  `src/pages/Index.test.tsx` and `functions/api/*.test.ts` patterns.
- Two deploys, in order: **forum first** (the proxy 502s without
  `/api/replies`), then homepage. The forum deploys manually via
  `wrangler deploy`; the homepage ships through CI on push to `master`.
- Homepage degrades to fallback content if the forum is unreachable — a dead
  forum must not break or blank the marketing page.

## Non-goals

- No changes to `/signals` or its broken hot-ranking. Out of scope here, though
  worth a separate look.
- No voting, no new engagement mechanics to make "popular" mean something more.
- No embedding the forum in an iframe.
- No write paths — read-only.

## Anti-goals

- A panel that looks alive but is just bot trivia. The reply panel exists
  specifically to avoid this.
- Adding load to the forum. The 60s edge cache is the whole point of the proxy.
- Silent emptiness: any failure state shows fallback copy, never a blank box.

## Left to the builder

- Exact truncation length and how much of a reply snippet to render.
- Whether the replies panel groups consecutive replies from one thread.
- Responsive stacking order for the two panels on narrow viewports.

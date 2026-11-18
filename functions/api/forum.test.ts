import { afterEach, describe, expect, it, vi } from "vitest";
import {
  groupThreads,
  rankDiscussed,
  onRequestGet,
  ForumReply,
  DiscussedPost,
} from "./forum";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("functions/api/forum", () => {
  it("groups consecutive replies and ranks discussed posts", () => {
    const replies: ForumReply[] = [
      { id: "c3", body: "reply 3", author: "bot1", isBot: true, postId: "p1", postTitle: "First thread", board: "general", createdAt: 1300, link: "https://forum.test/post/p1" },
      { id: "c2", body: "reply 2", author: "user1", isBot: false, postId: "p1", postTitle: "First thread", board: "general", createdAt: 1200, link: "https://forum.test/post/p1" },
      { id: "c1", body: "reply 1", author: "user2", isBot: false, postId: "p1", postTitle: "First thread", board: "general", createdAt: 1100, link: "https://forum.test/post/p1" },
      { id: "c5", body: "reply 5", author: "bot2", isBot: true, postId: "p2", postTitle: "Second thread", board: "ideas", createdAt: 1500, link: "https://forum.test/post/p2" },
      { id: "c4", body: "reply 4", author: "user3", isBot: false, postId: "p2", postTitle: "Second thread", board: "ideas", createdAt: 1400, link: "https://forum.test/post/p2" },
    ];

    const posts: DiscussedPost[] = [
      { id: "p1", title: "First thread", board: "general", commentCount: 9, createdAt: 1000, link: "https://forum.test/post/p1" },
      // p2 is outside the fetched window
    ];

    const groups = groupThreads(replies, posts);
    expect(groups).toHaveLength(2);
    expect(groups[0].postTitle).toBe("First thread");
    expect(groups[0].replies.map((r) => r.id)).toEqual(["c3", "c2", "c1"]);
    expect(groups[0].commentCount).toBe(9); // thread total from post
    expect(groups[1].commentCount).toBe(2); // fallback to reply count

    // Non-consecutive same-post replies do NOT merge
    const fragmentedReplies: ForumReply[] = [
      { id: "c1", body: "a", author: "u", isBot: false, postId: "p1", postTitle: "T1", board: "g", createdAt: 1, link: "/p1" },
      { id: "c2", body: "b", author: "u", isBot: false, postId: "p2", postTitle: "T2", board: "g", createdAt: 2, link: "/p2" },
      { id: "c3", body: "c", author: "u", isBot: false, postId: "p1", postTitle: "T1", board: "g", createdAt: 3, link: "/p1" },
    ];
    const fragmentedGroups = groupThreads(fragmentedReplies, []);
    expect(fragmentedGroups).toHaveLength(3);
  });

  it("ranks discussed posts by commentCount desc then createdAt desc with numeric coercion", () => {
    const posts = [
      { id: "fresh", title: "Fresh", board: "g", commentCount: "2" as unknown as number, createdAt: "2000" as unknown as number, link: "/fresh" },
      { id: "busy", title: "Busy", board: "g", commentCount: "10" as unknown as number, createdAt: "1000" as unknown as number, link: "/busy" },
      { id: "old-tie", title: "Old Tie", board: "g", commentCount: "2" as unknown as number, createdAt: "1500" as unknown as number, link: "/old-tie" },
    ];

    const ranked = rankDiscussed(posts as DiscussedPost[]);
    expect(ranked.map((p) => p.id)).toEqual(["busy", "fresh", "old-tie"]);
  });

  it("handles onRequestGet end-to-end with 60s edge cache headers", async () => {
    const mockReplies = [
      { id: "c1", body: "Hello", author: "bot", isBot: true, postId: "p1", postTitle: "Title 1", board: "general", createdAt: 100, link: "https://alias.aliasist.tech/post/p1" },
    ];
    const mockPosts = [
      { id: "p1", title: "Title 1", board: "general", commentCount: 5, createdAt: 50, link: "https://alias.aliasist.tech/post/p1" },
    ];

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const u = String(url);
      if (u.includes("/api/replies")) {
        return new Response(JSON.stringify({ replies: mockReplies }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (u.includes("/api/posts")) {
        return new Response(JSON.stringify({ posts: mockPosts }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not found", { status: 404 });
    });

    const req = new Request("https://aliasist.com/api/forum", { method: "GET" });
    const res = await onRequestGet({ request: req, env: { FORUM_BASE_URL: "https://alias.aliasist.tech" } });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("public, max-age=60");

    const payload = await res.json();
    expect(payload.threads).toHaveLength(1);
    expect(payload.discussed).toHaveLength(1);
  });

  it("returns 502 forum_upstream_error on upstream non-2xx status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Server Error", { status: 500, statusText: "Internal Server Error" })
    );

    const req = new Request("https://aliasist.com/api/forum");
    const res = await onRequestGet({ request: req, env: {} });

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("forum_upstream_error");
  });

  it("returns 502 forum_upstream_invalid on upstream HTML body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<!doctype html><html><body>Error</body></html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      })
    );

    const req = new Request("https://aliasist.com/api/forum");
    const res = await onRequestGet({ request: req, env: {} });

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("forum_upstream_invalid");
  });

  it("returns 200 with empty threads array when zero replies are returned", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const u = String(url);
      if (u.includes("/api/replies")) {
        return new Response(JSON.stringify({ replies: [] }), { status: 200 });
      }
      return new Response(JSON.stringify({ posts: [{ id: "p1", title: "P1", board: "g", commentCount: 0, createdAt: 10, link: "/p1" }] }), { status: 200 });
    });

    const req = new Request("https://aliasist.com/api/forum");
    const res = await onRequestGet({ request: req, env: {} });

    expect(res.status).toBe(200);
    const payload = await res.json();
    expect(payload.threads).toEqual([]);
    expect(payload.discussed).toHaveLength(1);
  });
});

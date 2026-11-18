/**
 * Cloudflare Pages Function proxy for the Aliasist Forum window.
 *
 * Proxies /api/replies and /api/posts from the forum Worker, groups consecutive
 * thread replies, ranks most discussed posts, and edge-caches responses for 60s.
 */

export interface ForumReply {
  id: string;
  body: string;
  author: string;
  isBot: boolean;
  postId: string;
  postTitle: string;
  board: string;
  createdAt: number;
  link: string;
}

export interface ThreadGroupReply {
  id: string;
  body: string;
  author: string;
  isBot: boolean;
  createdAt: number;
}

export interface ThreadGroup {
  postId: string;
  postTitle: string;
  board: string;
  link: string;
  commentCount: number;
  replies: ThreadGroupReply[];
}

export interface DiscussedPost {
  id: string;
  title: string;
  board: string;
  commentCount: number;
  createdAt: number;
  link: string;
}

export interface ForumPayload {
  threads: ThreadGroup[];
  discussed: DiscussedPost[];
}

interface Env {
  FORUM_BASE_URL?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Collapses consecutive replies sharing a postId into a single ThreadGroup.
 * Caps to 6 thread groups and up to 3 replies per thread group.
 */
export function groupThreads(replies: ForumReply[] = [], posts: DiscussedPost[] = []): ThreadGroup[] {
  const groups: ThreadGroup[] = [];
  const postMap = new Map<string, DiscussedPost>();
  for (const post of posts) {
    if (post && post.id) {
      postMap.set(String(post.id), post);
    }
  }

  let currentGroup: ThreadGroup | null = null;

  for (const reply of replies) {
    if (!reply || !reply.postId) continue;
    const postId = String(reply.postId);

    if (currentGroup && currentGroup.postId === postId) {
      if (currentGroup.replies.length < 3) {
        currentGroup.replies.push({
          id: String(reply.id || ""),
          body: String(reply.body || ""),
          author: String(reply.author || ""),
          isBot: Boolean(reply.isBot),
          createdAt: Number(reply.createdAt) || 0,
        });
      }
    } else {
      if (groups.length >= 6) {
        break;
      }
      const matchingPost = postMap.get(postId);
      currentGroup = {
        postId,
        postTitle: String(reply.postTitle || ""),
        board: String(reply.board || ""),
        link: String(reply.link || ""),
        commentCount: matchingPost !== undefined ? Number(matchingPost.commentCount) || 0 : 0,
        replies: [
          {
            id: String(reply.id || ""),
            body: String(reply.body || ""),
            author: String(reply.author || ""),
            isBot: Boolean(reply.isBot),
            createdAt: Number(reply.createdAt) || 0,
          },
        ],
      };
      groups.push(currentGroup);
    }
  }

  // Fallback commentCount when thread is not in fetched post window
  for (const g of groups) {
    const matchingPost = postMap.get(g.postId);
    if (!matchingPost || g.commentCount === 0) {
      g.commentCount = matchingPost !== undefined ? Number(matchingPost.commentCount) || g.replies.length : g.replies.length;
    }
  }

  return groups;
}

/**
 * Ranks posts by commentCount desc, breaking ties by createdAt desc.
 */
export function rankDiscussed(posts: DiscussedPost[] = [], limit = 5): DiscussedPost[] {
  const sorted = [...posts].sort((a, b) => {
    const countA = Number(a?.commentCount) || 0;
    const countB = Number(b?.commentCount) || 0;
    if (countB !== countA) return countB - countA;
    const timeA = Number(a?.createdAt) || 0;
    const timeB = Number(b?.createdAt) || 0;
    return timeB - timeA;
  });
  return sorted.slice(0, limit).map((p) => ({
    id: String(p.id || ""),
    title: String(p.title || ""),
    board: String(p.board || ""),
    commentCount: Number(p.commentCount) || 0,
    createdAt: Number(p.createdAt) || 0,
    link: String(p.link || ""),
  }));
}

export const onRequestOptions = async () => new Response(null, { status: 204, headers: corsHeaders });

export const onRequestGet = async ({ env }: PagesContext): Promise<Response> => {
  const baseUrl = (env.FORUM_BASE_URL?.trim() || "https://alias.aliasist.tech").replace(/\/+$/, "");

  try {
    const [repliesRes, postsRes] = await Promise.all([
      fetch(`${baseUrl}/api/replies?limit=20`, {
        headers: { accept: "application/json" },
        cf: { cacheEverything: true, cacheTtl: 60 },
      } as RequestInit),
      fetch(`${baseUrl}/api/posts?limit=50`, {
        headers: { accept: "application/json" },
        cf: { cacheEverything: true, cacheTtl: 60 },
      } as RequestInit),
    ]);

    if (!repliesRes.ok || !postsRes.ok) {
      return new Response(JSON.stringify({ error: "forum_upstream_error" }), {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
      });
    }

    let repliesData: { replies?: ForumReply[] };
    let postsData: { posts?: DiscussedPost[] };

    try {
      repliesData = (await repliesRes.json()) as { replies?: ForumReply[] };
      postsData = (await postsRes.json()) as { posts?: DiscussedPost[] };
    } catch {
      return new Response(JSON.stringify({ error: "forum_upstream_invalid" }), {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
      });
    }

    if (!repliesData || !Array.isArray(repliesData.replies) || !postsData || !Array.isArray(postsData.posts)) {
      return new Response(JSON.stringify({ error: "forum_upstream_invalid" }), {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
      });
    }

    const threads = groupThreads(repliesData.replies, postsData.posts);
    const discussed = rankDiscussed(postsData.posts, 5);

    const payload: ForumPayload = {
      threads,
      discussed,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        ...corsHeaders,
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "forum_upstream_error" }), {
      status: 502,
      headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
    });
  }
};

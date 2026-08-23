interface Env {
  /** Xtream Codes panel base URL, e.g. http://panel.example.com:8080 (no trailing slash). Server-only secret. */
  XTREAM_HOST?: string;
  /** Xtream Codes panel account username. Server-only secret. */
  XTREAM_USERNAME?: string;
  /** Xtream Codes panel account password. Server-only secret. */
  XTREAM_PASSWORD?: string;
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

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders },
  });
}

interface XtreamCategory {
  category_id: string;
  category_name: string;
}

interface XtreamLiveStream {
  stream_id: number;
  name: string;
  category_id: string;
  stream_icon?: string;
}

/**
 * Live TV channel guide (categories + channels) → homepage /entertainment page.
 * Guide-only: no stream URLs are exposed to the client, and this proxy never
 * embeds credentials in anything sent to the browser.
 * GET /api/entertainment/live-tv?category=<id> — omit category to list categories.
 */
export const onRequestOptions = async () => new Response(null, { status: 204, headers: corsHeaders });

export const onRequestGet = async ({ request, env }: PagesContext) => {
  const host = env.XTREAM_HOST?.trim().replace(/\/+$/, "");
  const username = env.XTREAM_USERNAME?.trim();
  const password = env.XTREAM_PASSWORD?.trim();
  if (!host || !username || !password) return json({ error: "live_tv_not_configured" }, 501);

  const requestUrl = new URL(request.url);
  const categoryId = requestUrl.searchParams.get("category")?.trim();
  const action = categoryId ? "get_live_streams" : "get_live_categories";

  const upstream = new URL(`${host}/player_api.php`);
  upstream.searchParams.set("username", username);
  upstream.searchParams.set("password", password);
  upstream.searchParams.set("action", action);
  if (categoryId) upstream.searchParams.set("category_id", categoryId);

  try {
    const upstreamRes = await fetch(upstream, {
      headers: { accept: "application/json" },
      cf: { cacheEverything: true, cacheTtl: 1800 },
    } as RequestInit);

    if (!upstreamRes.ok) {
      return json({ error: "live_tv_upstream_error", status: upstreamRes.status }, 502);
    }

    if (categoryId) {
      const data = (await upstreamRes.json()) as XtreamLiveStream[];
      const results = (Array.isArray(data) ? data : []).slice(0, 100).map((item) => ({
        id: item.stream_id,
        name: item.name,
        categoryId: item.category_id,
        icon: item.stream_icon || null,
      }));
      return new Response(JSON.stringify({ channels: results }), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=1800", ...corsHeaders },
      });
    }

    const data = (await upstreamRes.json()) as XtreamCategory[];
    const results = (Array.isArray(data) ? data : []).map((item) => ({
      id: item.category_id,
      name: item.category_name,
    }));
    return new Response(JSON.stringify({ categories: results }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=1800", ...corsHeaders },
    });
  } catch (error) {
    return json({ error: "live_tv_fetch_failed", message: error instanceof Error ? error.message : String(error) }, 502);
  }
};

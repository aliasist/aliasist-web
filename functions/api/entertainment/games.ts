interface Env {
  /** RAWG API key (rawg.io/apidocs → sign up). Server-only secret. */
  RAWG_API_KEY?: string;
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

export const onRequestOptions = async () => new Response(null, { status: 204, headers: corsHeaders });

/**
 * Popular/trending games → homepage /entertainment page.
 * GET /api/entertainment/games — RAWG games ordered by recent activity.
 */
export const onRequestGet = async ({ env }: PagesContext) => {
  const apiKey = env.RAWG_API_KEY?.trim();
  if (!apiKey) return json({ error: "rawg_not_configured" }, 501);

  const upstream = new URL("https://api.rawg.io/api/games");
  upstream.searchParams.set("key", apiKey);
  upstream.searchParams.set("ordering", "-added");
  upstream.searchParams.set("page_size", "20");

  try {
    const upstreamRes = await fetch(upstream, {
      headers: { accept: "application/json" },
      cf: { cacheEverything: true, cacheTtl: 3600 },
    } as RequestInit);

    if (!upstreamRes.ok) {
      return json({ error: "rawg_upstream_error", status: upstreamRes.status }, 502);
    }

    const data = (await upstreamRes.json()) as { results?: Array<Record<string, unknown>> };
    const results = (data.results ?? []).map((item) => ({
      id: item.id,
      title: item.name,
      released: item.released,
      rating: item.rating,
      backgroundImage: item.background_image,
      platforms: Array.isArray(item.platforms)
        ? (item.platforms as Array<{ platform?: { name?: string } }>).map((p) => p.platform?.name).filter(Boolean)
        : [],
      metacritic: item.metacritic,
    }));

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600", ...corsHeaders },
    });
  } catch (error) {
    return json({ error: "rawg_fetch_failed", message: error instanceof Error ? error.message : String(error) }, 502);
  }
};

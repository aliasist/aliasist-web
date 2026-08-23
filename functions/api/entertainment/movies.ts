interface Env {
  /** TMDB v3 API key (themoviedb.org → Settings → API). Server-only secret. */
  TMDB_API_KEY?: string;
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
 * Trending movies/TV → homepage /entertainment page.
 * GET /api/entertainment/movies?media=movie|tv|all (default: all) — TMDB trending/{media}/week.
 */
export const onRequestGet = async ({ request, env }: PagesContext) => {
  const apiKey = env.TMDB_API_KEY?.trim();
  if (!apiKey) return json({ error: "tmdb_not_configured" }, 501);

  const requestUrl = new URL(request.url);
  const media = requestUrl.searchParams.get("media")?.trim() || "all";
  if (!["movie", "tv", "all"].includes(media)) return json({ error: "invalid_media" }, 400);

  const upstream = new URL(`https://api.themoviedb.org/3/trending/${media}/week`);
  upstream.searchParams.set("api_key", apiKey);

  try {
    const upstreamRes = await fetch(upstream, {
      headers: { accept: "application/json" },
      cf: { cacheEverything: true, cacheTtl: 3600 },
    } as RequestInit);

    if (!upstreamRes.ok) {
      return json({ error: "tmdb_upstream_error", status: upstreamRes.status }, 502);
    }

    const data = (await upstreamRes.json()) as { results?: Array<Record<string, unknown>> };
    const results = (data.results ?? []).slice(0, 20).map((item) => ({
      id: item.id,
      title: item.title ?? item.name,
      mediaType: item.media_type,
      overview: item.overview,
      posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      rating: item.vote_average,
      releaseDate: item.release_date ?? item.first_air_date,
    }));

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600", ...corsHeaders },
    });
  } catch (error) {
    return json({ error: "tmdb_fetch_failed", message: error instanceof Error ? error.message : String(error) }, 502);
  }
};

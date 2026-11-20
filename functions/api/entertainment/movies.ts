import { handleCorsPreflight, jsonCors, standardCorsHeaders } from "../../_lib/cors";
import { safeFetch } from "../../_lib/safe-fetch";

interface Env {
  /** TMDB v3 API key (themoviedb.org → Settings → API). Server-only secret. */
  TMDB_API_KEY?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

export const onRequestOptions = handleCorsPreflight;

/**
 * Trending movies/TV → homepage /entertainment page.
 * GET /api/entertainment/movies?media=movie|tv|all (default: all), TMDB trending/{media}/week.
 */
export const onRequestGet = async ({ request, env }: PagesContext) => {
  const apiKey = env.TMDB_API_KEY?.trim();
  if (!apiKey) return jsonCors({ error: "tmdb_not_configured" }, 501);

  const requestUrl = new URL(request.url);
  const media = requestUrl.searchParams.get("media")?.trim() || "all";
  if (!["movie", "tv", "all"].includes(media)) return jsonCors({ error: "invalid_media" }, 400);

  const upstream = new URL(`https://api.themoviedb.org/3/trending/${media}/week`);
  upstream.searchParams.set("api_key", apiKey);

  const result = await safeFetch<{ results?: Array<Record<string, unknown>> }>(upstream, {
    headers: { accept: "application/json" },
    timeout: 8000,
    cf: { cacheEverything: true, cacheTtl: 3600 },
    onError: (status) => jsonCors({ error: "tmdb_upstream_error", status }, 502),
  });

  if (!result.ok) return result.error;

  const results = (result.data.results ?? []).slice(0, 20).map((item) => ({
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
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
      ...standardCorsHeaders,
    },
  });
};

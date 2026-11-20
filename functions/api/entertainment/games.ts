import { handleCorsPreflight, jsonCors, standardCorsHeaders } from "../../_lib/cors";
import { safeFetch } from "../../_lib/safe-fetch";

interface Env {
  /** RAWG API key (rawg.io/apidocs → sign up). Server-only secret. */
  RAWG_API_KEY?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

export const onRequestOptions = handleCorsPreflight;

/**
 * Popular/trending games → homepage /entertainment page.
 * GET /api/entertainment/games, RAWG games ordered by recent activity.
 */
export const onRequestGet = async ({ env }: PagesContext) => {
  const apiKey = env.RAWG_API_KEY?.trim();
  if (!apiKey) return jsonCors({ error: "rawg_not_configured" }, 501);

  const upstream = new URL("https://api.rawg.io/api/games");
  upstream.searchParams.set("key", apiKey);
  upstream.searchParams.set("ordering", "-added");
  upstream.searchParams.set("page_size", "20");

  const result = await safeFetch<{ results?: Array<Record<string, unknown>> }>(upstream, {
    headers: { accept: "application/json" },
    timeout: 8000,
    cf: { cacheEverything: true, cacheTtl: 3600 },
    onError: (status) => jsonCors({ error: "rawg_upstream_error", status }, 502),
  });

  if (!result.ok) return result.error;

  const results = (result.data.results ?? []).map((item) => ({
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
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
      ...standardCorsHeaders,
    },
  });
};

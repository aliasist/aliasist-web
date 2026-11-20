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
 * On-demand movie/TV trailer lookup → Entertainment page movie modal.
 * GET /api/entertainment/movie-trailer?id=<tmdbId>&media=movie|tv
 * The trending list doesn't carry trailer data, and a fake
 * `youtube.com/embed?listType=search` URL (the previous approach) no longer
 * works, YouTube dropped third-party search-result embeds years ago. This
 * fetches TMDB's real /videos endpoint and returns a genuine YouTube key.
 */
export const onRequestGet = async ({ request, env }: PagesContext) => {
  const apiKey = env.TMDB_API_KEY?.trim();
  if (!apiKey) return jsonCors({ error: "tmdb_not_configured" }, 501);

  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get("id")?.trim();
  const media = requestUrl.searchParams.get("media")?.trim() || "movie";
  if (!id || !/^\d+$/.test(id)) return jsonCors({ error: "invalid_id" }, 400);
  if (!["movie", "tv"].includes(media)) return jsonCors({ error: "invalid_media" }, 400);

  const upstream = new URL(`https://api.themoviedb.org/3/${media}/${id}/videos`);
  upstream.searchParams.set("api_key", apiKey);

  const result = await safeFetch<{ results?: Array<Record<string, unknown>> }>(upstream, {
    headers: { accept: "application/json" },
    timeout: 8000,
    cf: { cacheEverything: true, cacheTtl: 86400 },
    onError: (status) => jsonCors({ error: "tmdb_upstream_error", status }, 502),
  });

  if (!result.ok) return result.error;

  const videos = result.data.results ?? [];

  const youtubeVideos = videos.filter((v) => v.site === "YouTube" && v.key);
  const trailer =
    youtubeVideos.find((v) => v.type === "Trailer" && v.official) ??
    youtubeVideos.find((v) => v.type === "Trailer") ??
    youtubeVideos.find((v) => v.type === "Teaser") ??
    youtubeVideos[0];

  const embedUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;

  return new Response(JSON.stringify({ embedUrl }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=86400",
      ...standardCorsHeaders,
    },
  });
};

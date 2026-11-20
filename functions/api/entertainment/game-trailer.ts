import { handleCorsPreflight, jsonCors, standardCorsHeaders } from "../../_lib/cors";
import { safeFetch } from "../../_lib/safe-fetch";

interface Env {
  /** RAWG API key (rawg.io/apidocs). Server-only secret. */
  RAWG_API_KEY?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

export const onRequestOptions = handleCorsPreflight;

/**
 * On-demand game trailer lookup → Entertainment page game modal.
 * GET /api/entertainment/game-trailer?id=<rawgId>
 * RAWG hosts its own trailer clips as direct video files (mp4/webm) rather
 * than YouTube, this is a real <video> source, not an iframe embed. The
 * previous fake `youtube.com/embed?listType=search` fallback never worked
 * (YouTube dropped third-party search-result embeds years ago).
 */
export const onRequestGet = async ({ request, env }: PagesContext) => {
  const apiKey = env.RAWG_API_KEY?.trim();
  if (!apiKey) return jsonCors({ error: "rawg_not_configured" }, 501);

  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get("id")?.trim();
  if (!id || !/^\d+$/.test(id)) return jsonCors({ error: "invalid_id" }, 400);

  const upstream = new URL(`https://api.rawg.io/api/games/${id}/movies`);
  upstream.searchParams.set("key", apiKey);

  const result = await safeFetch<{
    results?: Array<{ preview?: string; data?: { max?: string; 480?: string } }>;
  }>(upstream, {
    headers: { accept: "application/json" },
    timeout: 8000,
    cf: { cacheEverything: true, cacheTtl: 86400 },
    onError: (status) => jsonCors({ error: "rawg_upstream_error", status }, 502),
  });

  if (!result.ok) return result.error;

  const clip = result.data.results?.[0];
  const videoUrl = clip?.data?.max || clip?.data?.["480"] || null;
  const previewImage = clip?.preview || null;

  return new Response(JSON.stringify({ videoUrl, previewImage }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=86400",
      ...standardCorsHeaders,
    },
  });
};

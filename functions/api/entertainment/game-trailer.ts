interface Env {
  /** RAWG API key (rawg.io/apidocs). Server-only secret. */
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
 * On-demand game trailer lookup → Entertainment page game modal.
 * GET /api/entertainment/game-trailer?id=<rawgId>
 * RAWG hosts its own trailer clips as direct video files (mp4/webm) rather
 * than YouTube — this is a real <video> source, not an iframe embed. The
 * previous fake `youtube.com/embed?listType=search` fallback never worked
 * (YouTube dropped third-party search-result embeds years ago).
 */
export const onRequestGet = async ({ request, env }: PagesContext) => {
  const apiKey = env.RAWG_API_KEY?.trim();
  if (!apiKey) return json({ error: "rawg_not_configured" }, 501);

  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get("id")?.trim();
  if (!id || !/^\d+$/.test(id)) return json({ error: "invalid_id" }, 400);

  const upstream = new URL(`https://api.rawg.io/api/games/${id}/movies`);
  upstream.searchParams.set("key", apiKey);

  try {
    const upstreamRes = await fetch(upstream, {
      headers: { accept: "application/json" },
      cf: { cacheEverything: true, cacheTtl: 86400 },
    } as RequestInit);

    if (!upstreamRes.ok) {
      return json({ error: "rawg_upstream_error", status: upstreamRes.status }, 502);
    }

    const data = (await upstreamRes.json()) as {
      results?: Array<{ preview?: string; data?: { max?: string; 480?: string } }>;
    };
    const clip = data.results?.[0];
    const videoUrl = clip?.data?.max || clip?.data?.["480"] || null;
    const previewImage = clip?.preview || null;

    return new Response(JSON.stringify({ videoUrl, previewImage }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=86400", ...corsHeaders },
    });
  } catch (error) {
    return json({ error: "rawg_fetch_failed", message: error instanceof Error ? error.message : String(error) }, 502);
  }
};

interface Env {
  /** NASA API key (api.nasa.gov/#signUp). Server-only secret — 1,000 req/hour vs DEMO_KEY's shared/rate-limited pool. */
  NASA_API_KEY?: string;
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
 * NASA Astronomy Picture of the Day → homepage /entertainment page.
 * GET /api/entertainment/nasa-apod — proxies api.nasa.gov/planetary/apod with
 * a real key (server-only) instead of shipping DEMO_KEY to the client, which
 * is shared/rate-limited across every developer testing NASA's APIs globally.
 */
export const onRequestGet = async ({ env }: PagesContext) => {
  const apiKey = env.NASA_API_KEY?.trim();
  if (!apiKey) return json({ error: "nasa_not_configured" }, 501);

  const upstream = new URL("https://api.nasa.gov/planetary/apod");
  upstream.searchParams.set("api_key", apiKey);

  try {
    const upstreamRes = await fetch(upstream, {
      headers: { accept: "application/json" },
      cf: { cacheEverything: true, cacheTtl: 3600 },
    } as RequestInit);

    if (!upstreamRes.ok) {
      return json({ error: "nasa_upstream_error", status: upstreamRes.status }, 502);
    }

    const body = await upstreamRes.text();
    return new Response(body, {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600", ...corsHeaders },
    });
  } catch (error) {
    return json({ error: "nasa_fetch_failed", message: error instanceof Error ? error.message : String(error) }, 502);
  }
};

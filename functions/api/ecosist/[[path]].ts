interface Env {
  ECOSIST_API_BASE_URL?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
  params: { path?: string | string[] };
};

const DEFAULT_API_BASE = "https://api.aliasist.tech";
const ALLOWED_PATHS = new Set([
  "signals",
  "space-weather",
  "cameras",
  "camera-sources",
  "emergency-lens",
  "hurricanes",
  "wildfires",
  "volcanoes",
]);

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const onRequestGet = async ({ request, env, params }: PagesContext) => {
  const rawPath = Array.isArray(params.path) ? params.path.join("/") : (params.path ?? "");
  const path = rawPath.replace(/^\/+|\/+$/g, "");
  if (!ALLOWED_PATHS.has(path)) return json({ error: "not_found" }, 404);

  const requestUrl = new URL(request.url);
  const base = (env.ECOSIST_API_BASE_URL?.trim() || DEFAULT_API_BASE).replace(/\/+$/, "");
  const upstream = new URL(`${base}/eco/${path}`);
  upstream.search = requestUrl.search;

  try {
    const response = await fetch(upstream, {
      headers: { accept: "application/json" },
      cf: { cacheEverything: true, cacheTtl: path === "signals" ? 60 : 300 },
    } as RequestInit);
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json; charset=utf-8",
        "cache-control": path === "signals" ? "public, max-age=60" : "public, max-age=300",
      },
    });
  } catch (error) {
    return json(
      { error: "ecosist_upstream_unavailable", message: error instanceof Error ? error.message : String(error) },
      502,
    );
  }
};

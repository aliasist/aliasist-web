import { handleCorsPreflight, jsonCors, standardCorsHeaders } from "../../_lib/cors";
import { safeFetch } from "../../_lib/safe-fetch";

interface Env {
  /** The Odds API key (the-odds-api.com → sign up). Server-only secret. */
  ODDS_API_KEY?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

/**
 * Display-only sports odds (no wagering) → homepage /entertainment page.
 * GET /api/entertainment/odds?sport=upcoming, The Odds API, h2h market, US region.
 * The Odds API free tier is metered per request, so this is cached hard (10 min)
 * to avoid burning the quota on repeat page loads.
 */
export const onRequestOptions = handleCorsPreflight;

export const onRequestGet = async ({ request, env }: PagesContext) => {
  const apiKey = env.ODDS_API_KEY?.trim();
  if (!apiKey) return jsonCors({ error: "odds_not_configured" }, 501);

  const requestUrl = new URL(request.url);
  const sport = requestUrl.searchParams.get("sport")?.trim() || "upcoming";

  const upstream = new URL(`https://api.the-odds-api.com/v4/sports/${sport}/odds/`);
  upstream.searchParams.set("apiKey", apiKey);
  upstream.searchParams.set("regions", "us");
  upstream.searchParams.set("markets", "h2h");
  upstream.searchParams.set("oddsFormat", "american");

  const result = await safeFetch<Array<Record<string, unknown>>>(upstream, {
    headers: { accept: "application/json" },
    timeout: 8000,
    cf: { cacheEverything: true, cacheTtl: 600 },
    onError: (status) => jsonCors({ error: "odds_upstream_error", status }, 502),
  });

  if (!result.ok) return result.error;

  const results = result.data.slice(0, 20).map((event) => ({
    id: event.id,
    sportTitle: event.sport_title,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    commenceTime: event.commence_time,
    bookmakers: Array.isArray(event.bookmakers)
      ? (event.bookmakers as Array<Record<string, unknown>>).slice(0, 1).map((b) => ({
          title: b.title,
          markets: b.markets,
        }))
      : [],
  }));

  return new Response(JSON.stringify({ results }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=600",
      ...standardCorsHeaders,
    },
  });
};

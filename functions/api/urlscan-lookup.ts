import type { ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json } from "../_lib/clerk-auth";

interface Env extends ClerkEnv {
  URLSCAN_API_KEY?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

const URLSCAN_SEARCH_URL = "https://urlscan.io/api/v1/search/";

interface UrlscanVerdict {
  overall?: { malicious?: boolean; score?: number };
}

interface UrlscanSearchResult {
  task: { time: string; url: string };
  page: { url: string; domain: string };
  verdicts?: UrlscanVerdict;
}

interface UrlscanSearchResponse {
  results: UrlscanSearchResult[];
  total: number;
}

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

/**
 * Lookup-only safety check for a URL: searches urlscan.io's history of
 * *already-scanned* pages (instant) rather than submitting a new scan
 * (10-20s, and burns urlscan's submission quota) — good enough to flag a
 * link as previously-seen-malicious before it's shown anywhere on the site.
 * Submitting brand-new/unscanned URLs for a fresh scan is a separate,
 * heavier flow, not built here.
 */
export const onRequestGet = async ({ request, env }: PagesContext) => {
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  const apiKey = env.URLSCAN_API_KEY?.trim();
  if (!apiKey) return json({ error: "not_configured", hint: "Set URLSCAN_API_KEY in Pages secrets." }, 503);

  const targetUrl = new URL(request.url).searchParams.get("url")?.trim();
  if (!targetUrl) return json({ error: "missing_url" }, 400);

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return json({ error: "invalid_url" }, 400);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return json({ error: "invalid_url", hint: "Only http/https URLs are supported." }, 400);
  }

  // Lucene phrase query on the exact page URL. Strip quotes from the input
  // so it can't break out of the quoted phrase.
  const safePhrase = parsed.toString().replace(/"/g, "");
  const searchUrl = new URL(URLSCAN_SEARCH_URL);
  searchUrl.searchParams.set("q", `page.url:"${safePhrase}"`);
  searchUrl.searchParams.set("size", "5");

  try {
    const response = await fetch(searchUrl.toString(), {
      headers: { "API-Key": apiKey, Accept: "application/json" },
    });
    if (!response.ok) {
      return json({ error: "urlscan_fetch_failed", status: response.status }, 502);
    }

    const payload = (await response.json()) as UrlscanSearchResponse;
    if (payload.results.length === 0) {
      return json({ url: parsed.toString(), status: "unknown", message: "No prior urlscan.io scan found for this URL.", scans: 0 });
    }

    const mostRecent = payload.results[0]!;
    const malicious = payload.results.some((r) => r.verdicts?.overall?.malicious === true);
    const maxScore = Math.max(0, ...payload.results.map((r) => r.verdicts?.overall?.score ?? 0));

    return json({
      url: parsed.toString(),
      status: malicious ? "malicious" : "clean",
      message: malicious
        ? "At least one prior scan flagged this URL as malicious."
        : "No prior scan flagged this URL as malicious.",
      scans: payload.total,
      maxScore,
      lastScanTime: mostRecent.task.time,
      domain: mostRecent.page.domain,
    });
  } catch (err) {
    return json({ error: "lookup_failed", message: err instanceof Error ? err.message : String(err) }, 502);
  }
};

/**
 * DataSist API Worker
 * Cloudflare Worker powering data.aliasist.com
 * - D1 database for facility data
 * - AI chat proxied to assistant.aliasist.com (llm-chat Worker)
 * - Zero API keys in the browser
 */

import { logChat, logUsage } from "./analytics";
import { requireAdmin } from "./auth";
import { neon } from "@neondatabase/serverless";

export interface Env {
  DB: D1Database;
  ANALYTICS: D1Database;
  ALLOWED_ORIGIN: string;
  EIA_API_KEY: string;
  ELECTRICITY_MAPS_API_KEY?: string;
  GROQ_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  GEMINI_API_KEY: string;
  NEON_DATABASE_URL: string;
  RAG_API_URL: string;
  RAG_API_KEY: string;
  // Clerk — same instance used by aliasist.com
  CLERK_SECRET_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  // Comma-separated Clerk user ids that are allowed to mutate facilities.
  // Fail-closed: if empty or unset, every admin route returns 503.
  ADMIN_USER_IDS?: string;
}

// State abbreviation map
const STATE_ABBR: Record<string, string> = {
  Alabama:"AL",Alaska:"AK",Arizona:"AZ",Arkansas:"AR",California:"CA",
  Colorado:"CO",Connecticut:"CT",Delaware:"DE",Florida:"FL",Georgia:"GA",
  Hawaii:"HI",Idaho:"ID",Illinois:"IL",Indiana:"IN",Iowa:"IA",Kansas:"KS",
  Kentucky:"KY",Louisiana:"LA",Maine:"ME",Maryland:"MD",Massachusetts:"MA",
  Michigan:"MI",Minnesota:"MN",Mississippi:"MS",Missouri:"MO",Montana:"MT",
  Nebraska:"NE",Nevada:"NV","New Hampshire":"NH","New Jersey":"NJ",
  "New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND",
  Ohio:"OH",Oklahoma:"OK",Oregon:"OR",Pennsylvania:"PA","Rhode Island":"RI",
  "South Carolina":"SC","South Dakota":"SD",Tennessee:"TN",Texas:"TX",
  Utah:"UT",Vermont:"VT",Virginia:"VA",Washington:"WA","West Virginia":"WV",
  Wisconsin:"WI",Wyoming:"WY",
};

// Cache EIA prices for 24 hours
let eiaCache: { prices: Record<string, number>; ts: number } | null = null;

async function getEIAPrices(apiKey: string): Promise<Record<string, number>> {
  const now = Date.now();
  if (eiaCache && now - eiaCache.ts < 86_400_000) return eiaCache.prices;

  try {
    const url = `https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=${apiKey}&frequency=annual&data%5B0%5D=price&facets%5Bsectorid%5D%5B%5D=COM&sort%5B0%5D%5Bcolumn%5D=period&sort%5B0%5D%5Bdirection%5D=desc&length=60`;
    const res = await fetch(url);
    const data = await res.json() as { response: { data: Array<{ stateid: string; price: string }> } };
    const prices: Record<string, number> = {};
    for (const row of data.response.data) {
      if (!prices[row.stateid]) prices[row.stateid] = parseFloat(row.price) || 0;
    }
    eiaCache = { prices, ts: now };
    return prices;
  } catch {
    return {};
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return await res.json() as T;
}

async function registerExternalApiObservation(
  db: D1Database,
  source: string,
  scope: string,
  payload: unknown,
  facilityId?: number | string,
  bucketMs = 60 * 60 * 1000,
): Promise<void> {
  try {
    const observedAt = Date.now();
    const bucket = Math.floor(observedAt / bucketMs);
    const id = `${source}:${scope}:${bucket}`;
    await db.prepare(`
      INSERT INTO external_api_observations
        (id, source, scope, facility_id, payload_json, observed_at, registered_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        payload_json=excluded.payload_json,
        observed_at=excluded.observed_at,
        registered_at=excluded.registered_at
    `).bind(
      id,
      source,
      scope,
      facilityId ?? null,
      JSON.stringify(payload),
      observedAt,
      observedAt,
    ).run();
  } catch (err) {
    console.warn(`External API observation registration failed (${source}/${scope}):`, err);
  }
}

async function getElectricityMapInsights(lat: number, lon: number, apiKey: string) {
  const headers = { "auth-token": apiKey };
  const base = `https://api.electricitymap.org/v4`;
  const query = `lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;

  const [carbon, carbonFree, level] = await Promise.all([
    fetchJson<{ zone?: string; carbonIntensity?: number; fossilFreePercentage?: number; renewablePercentage?: number; isEstimated?: boolean; datetime?: string }>(
      `${base}/carbon-intensity/latest?${query}`,
      { headers },
    ),
    fetchJson<{ carbonFreeEnergyPercentage?: number; datetime?: string }>(
      `${base}/carbon-free-energy/latest?${query}`,
      { headers },
    ),
    fetchJson<{ level?: string; datetime?: string }>(
      `${base}/carbon-intensity-level/latest?${query}`,
      { headers },
    ),
  ]);

  return {
    zone: carbon.zone ?? null,
    carbonIntensity: carbon.carbonIntensity ?? null,
    renewablePercentage: carbon.renewablePercentage ?? null,
    fossilFreePercentage: carbon.fossilFreePercentage ?? null,
    carbonFreeEnergyPercentage: carbonFree.carbonFreeEnergyPercentage ?? null,
    carbonIntensityLevel: level.level ?? null,
    isEstimated: carbon.isEstimated ?? null,
    datetime: carbon.datetime ?? carbonFree.datetime ?? level.datetime ?? null,
    source: "Electricity Maps",
  };
}

async function getOpenMeteoWeatherInsights(lat: number, lon: number) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "cloud_cover",
      "wind_speed_10m",
      "wind_gusts_10m",
    ].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "shortwave_radiation_sum",
      "wind_speed_10m_max",
      "et0_fao_evapotranspiration",
    ].join(","),
  );

  const data = await fetchJson<{
    current?: Record<string, number | string | null>;
    daily?: Record<string, Array<number | string | null>>;
  }>(url.toString());

  const daily = data.daily ?? {};
  const current = data.current ?? {};

  return {
    temperature2m: Number(current.temperature_2m ?? NaN) || null,
    relativeHumidity2m: Number(current.relative_humidity_2m ?? NaN) || null,
    apparentTemperature: Number(current.apparent_temperature ?? NaN) || null,
    precipitation: Number(current.precipitation ?? NaN) || null,
    cloudCover: Number(current.cloud_cover ?? NaN) || null,
    windSpeed10m: Number(current.wind_speed_10m ?? NaN) || null,
    windGusts10m: Number(current.wind_gusts_10m ?? NaN) || null,
    temperatureMaxToday: Number(daily.temperature_2m_max?.[0] ?? NaN) || null,
    temperatureMinToday: Number(daily.temperature_2m_min?.[0] ?? NaN) || null,
    precipitationSumToday: Number(daily.precipitation_sum?.[0] ?? NaN) || null,
    shortwaveRadiationSumToday: Number(daily.shortwave_radiation_sum?.[0] ?? NaN) || null,
    evapotranspirationToday: Number(daily.et0_fao_evapotranspiration?.[0] ?? NaN) || null,
    source: "Open-Meteo",
  };
}

async function getOpenMeteoAirQualityInsights(lat: number, lon: number) {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set(
    "current",
    [
      "us_aqi",
      "pm2_5",
      "pm10",
      "ozone",
      "nitrogen_dioxide",
      "sulphur_dioxide",
      "carbon_monoxide",
    ].join(","),
  );

  const data = await fetchJson<{ current?: Record<string, number | string | null> }>(url.toString());
  const current = data.current ?? {};

  return {
    usAqi: Number(current.us_aqi ?? NaN) || null,
    pm2_5: Number(current.pm2_5 ?? NaN) || null,
    pm10: Number(current.pm10 ?? NaN) || null,
    ozone: Number(current.ozone ?? NaN) || null,
    nitrogenDioxide: Number(current.nitrogen_dioxide ?? NaN) || null,
    sulphurDioxide: Number(current.sulphur_dioxide ?? NaN) || null,
    carbonMonoxide: Number(current.carbon_monoxide ?? NaN) || null,
    source: "Open-Meteo Air Quality",
  };
}

async function getNwsInsights(lat: number, lon: number) {
  const headers = { "User-Agent": "aliasist-datasist/1.0 (dev@aliasist.com)" };
  const point = await fetchJson<{
    properties?: {
      forecast?: string;
      forecastHourly?: string;
    };
  }>(`https://api.weather.gov/points/${lat},${lon}`, { headers });

  const forecastUrl = point.properties?.forecast;
  if (!forecastUrl) {
    return { forecastHeadline: null, activeAlerts: [], source: "NWS" };
  }

  const [forecast, alerts] = await Promise.all([
    fetchJson<{ properties?: { periods?: Array<{ name?: string; shortForecast?: string; temperature?: number; temperatureUnit?: string }> } }>(
      forecastUrl,
      { headers },
    ),
    fetchJson<{ features?: Array<{ properties?: { event?: string; severity?: string; headline?: string; expires?: string } }> }>(
      `https://api.weather.gov/alerts/active?point=${lat},${lon}`,
      { headers },
    ),
  ]);

  const firstPeriod = forecast.properties?.periods?.[0];
  return {
    forecastHeadline: firstPeriod
      ? `${firstPeriod.name ?? "Current"}: ${firstPeriod.shortForecast ?? ""}${firstPeriod.temperature ? ` · ${firstPeriod.temperature}°${firstPeriod.temperatureUnit ?? "F"}` : ""}`
      : null,
    activeAlerts: (alerts.features ?? []).slice(0, 3).map((feature) => ({
      event: feature.properties?.event ?? "Alert",
      severity: feature.properties?.severity ?? null,
      headline: feature.properties?.headline ?? null,
      expires: feature.properties?.expires ?? null,
    })),
    source: "NWS",
  };
}

// ── Facility Lead Discovery ──────────────────────────────────────────────────
// Automated feeds that surface *candidate* new-facility signals into the
// facility_leads staging table. Nothing here writes to data_centers directly —
// leads are reviewed and promoted manually via the admin UI/API.

const HYPERSCALER_WATCHLIST = [
  "microsoft", "amazon", "aws", "google", "alphabet", "meta", "oracle",
  "openai", "stargate", "anthropic", "corewave", "coreweave", "xai",
  "equinix", "digital realty", "nvidia", "tesla",
];

function matchesHyperscalerWatchlist(text: string): boolean {
  const lower = text.toLowerCase();
  return HYPERSCALER_WATCHLIST.some((name) => lower.includes(name));
}

const FACILITY_SIGNAL_KEYWORDS = [
  "data center", "data centre", "hyperscale", "megawatt", "campus",
  "breaks ground", "broke ground", "groundbreaking", "announces new",
  "under construction", "gigawatt",
];

function matchesFacilitySignal(text: string): boolean {
  const lower = text.toLowerCase();
  return FACILITY_SIGNAL_KEYWORDS.some((kw) => lower.includes(kw));
}

interface FacilityLead {
  id: string;
  source: "sec-edgar" | "news-rss";
  externalRef: string;
  title: string;
  company: string | null;
  snippet: string;
  url: string;
  discoveredAt: number;
}

async function fetchSecEdgarLeads(): Promise<FacilityLead[]> {
  // SEC full text search — 8-K filings from the last 7 days mentioning "data center".
  // SEC's fair-access policy requires a descriptive User-Agent with contact info.
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const url = `https://efts.sec.gov/LATEST/search-index?q=%22data+center%22&forms=8-K&dateRange=custom&startdt=${fmt(start)}&enddt=${fmt(now)}`;
  const data = await fetchJson<{
    hits?: {
      hits?: Array<{
        _id: string;
        _source: {
          adsh: string;
          ciks?: string[];
          display_names?: string[];
          file_date?: string;
          form?: string;
        };
      }>;
    };
  }>(url, { headers: { "User-Agent": "Aliasist DataSist admin@aliasist.com" } });

  const hits = data.hits?.hits ?? [];
  const leads: FacilityLead[] = [];

  for (const hit of hits) {
    const displayName = hit._source.display_names?.[0] ?? "";
    if (!matchesHyperscalerWatchlist(displayName)) continue;

    const cik = String(Number(hit._source.ciks?.[0] ?? "0"));
    const accessionNoDashes = hit._source.adsh.replace(/-/g, "");
    const filename = hit._id.split(":")[1] ?? "";
    const filingUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNoDashes}/${filename}`;

    leads.push({
      id: `sec-edgar:${hit._source.adsh}`,
      source: "sec-edgar",
      externalRef: hit._source.adsh,
      title: `${displayName} — Form ${hit._source.form ?? "8-K"}`,
      company: displayName.replace(/\s*\(CIK\s*\d+\)/i, "").trim() || null,
      snippet: `Filed ${hit._source.file_date ?? "recently"}, mentions "data center". Review filing for capex/construction details.`,
      url: filingUrl,
      discoveredAt: Date.now(),
    });
  }

  return leads;
}

// Minimal RSS <item> extractor — avoids pulling in an XML dependency for
// well-formed feeds. Tolerant of missing fields; skips malformed items.
function parseRssItems(xml: string): Array<{ title: string; link: string; description: string; pubDate: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string }> = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  const extract = (block: string, tag: string): string => {
    const match = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`));
    return (match?.[1] ?? "").trim();
  };

  for (const block of itemBlocks) {
    items.push({
      title: extract(block, "title"),
      link: extract(block, "link"),
      description: extract(block, "description").replace(/<[^>]+>/g, ""),
      pubDate: extract(block, "pubDate"),
    });
  }
  return items;
}

// Trade-press RSS feeds meant for public syndication — distinct from
// Google News RSS, whose own terms restrict it to personal feed-reader use.
const NEWS_RSS_FEEDS = [
  "https://www.datacenterdynamics.com/en/rss/",
  "https://www.datacenterknowledge.com/rss.xml",
];

async function fetchNewsRssLeads(): Promise<FacilityLead[]> {
  const leads: FacilityLead[] = [];

  for (const feedUrl of NEWS_RSS_FEEDS) {
    try {
      const res = await fetch(feedUrl, { headers: { "User-Agent": "Aliasist DataSist admin@aliasist.com" } });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseRssItems(xml);

      for (const item of items) {
        if (!item.link || !item.title) continue;
        const combined = `${item.title} ${item.description}`;
        if (!matchesFacilitySignal(combined)) continue;

        leads.push({
          id: `news-rss:${item.link}`,
          source: "news-rss",
          externalRef: item.link,
          title: item.title,
          company: HYPERSCALER_WATCHLIST.find((name) => combined.toLowerCase().includes(name)) ?? null,
          snippet: item.description.slice(0, 280),
          url: item.link,
          discoveredAt: Date.now(),
        });
      }
    } catch (err) {
      console.warn(`News RSS fetch failed (${feedUrl}):`, err);
    }
  }

  return leads;
}

async function registerFacilityLead(db: D1Database, lead: FacilityLead): Promise<void> {
  await db.prepare(`
    INSERT INTO facility_leads
      (id, source, external_ref, title, company, snippet, url, discovered_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')
    ON CONFLICT(id) DO NOTHING
  `).bind(
    lead.id, lead.source, lead.externalRef, lead.title,
    lead.company, lead.snippet, lead.url, lead.discoveredAt,
  ).run();
}

async function discoverFacilityLeads(env: Env): Promise<{ ok: boolean; found: number; error?: string }> {
  try {
    const [secResult, rssResult] = await Promise.allSettled([
      fetchSecEdgarLeads(),
      fetchNewsRssLeads(),
    ]);

    const leads: FacilityLead[] = [
      ...(secResult.status === "fulfilled" ? secResult.value : []),
      ...(rssResult.status === "fulfilled" ? rssResult.value : []),
    ];

    for (const lead of leads) {
      await registerFacilityLead(env.DB, lead);
    }

    await registerExternalApiObservation(
      env.DB,
      "facility-lead-discovery",
      "daily-sweep",
      { found: leads.length, sources: { secEdgar: secResult.status, newsRss: rssResult.status } },
      undefined,
      24 * 60 * 60 * 1000,
    );

    return { ok: true, found: leads.length };
  } catch (err) {
    console.error("Facility lead discovery failed:", err);
    return { ok: false, found: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

async function handleGetFacilityLeads(db: D1Database, url: URL, headers: Record<string, string>) {
  const status = url.searchParams.get("status");
  const query = status
    ? db.prepare("SELECT * FROM facility_leads WHERE status = ? ORDER BY discovered_at DESC LIMIT 200").bind(status)
    : db.prepare("SELECT * FROM facility_leads ORDER BY discovered_at DESC LIMIT 200");
  const { results } = await query.all();
  return json({ leads: results }, 200, headers);
}

const FACILITY_LEAD_STATUSES = ["new", "reviewed", "promoted", "dismissed"];

async function handleUpdateFacilityLead(
  db: D1Database,
  id: string,
  request: Request,
  headers: Record<string, string>,
) {
  const body = await request.json().catch(() => null) as { status?: string } | null;
  if (!body?.status || !FACILITY_LEAD_STATUSES.includes(body.status)) {
    return json({ error: "invalid_status", allowed: FACILITY_LEAD_STATUSES }, 400, headers);
  }

  const result = await db.prepare("UPDATE facility_leads SET status = ? WHERE id = ?")
    .bind(body.status, id)
    .run();

  if (result.meta.changes === 0) return json({ error: "not_found" }, 404, headers);
  return json({ ok: true, id, status: body.status }, 200, headers);
}

// ── Live Facility Enrichment Sweep ───────────────────────────────────────────
// data_centers.renewable_percent / grid_risk start as a one-time heuristic
// guess from the source's energy_type string (see inferRenewablePercent /
// inferGridRisk below). This sweep upgrades them to live, per-location
// signals where available — Electricity Maps' real grid mix for renewable %,
// and NWS active severe weather alerts (a literal outage-risk signal, not a
// carbon proxy) for grid_risk, falling back to Electricity Maps' carbon
// intensity level outside the US where NWS has no coverage. A facility is
// only updated when a live value was actually obtained — a failed fetch
// never clobbers existing data with a null.
function gridRiskFromCarbonLevel(level: string | null): string | null {
  if (!level) return null;
  const l = level.toLowerCase();
  if (l.includes("very high") || l === "high") return "high";
  if (l.includes("moderate") || l === "medium") return "medium";
  if (l === "low") return "low";
  return null;
}

function gridRiskFromNwsAlerts(alerts: Array<{ severity: string | null }>): string | null {
  if (alerts.length === 0) return null;
  if (alerts.some((a) => a.severity === "Extreme" || a.severity === "Severe")) return "high";
  return "medium";
}

async function refreshFacilityEnrichment(env: Env): Promise<{ ok: boolean; updated: number; checked: number }> {
  const { results } = await env.DB.prepare(
    "SELECT id, lat, lng, country FROM data_centers",
  ).all<{ id: number; lat: number; lng: number; country: string }>();

  let updated = 0;

  for (const facility of results) {
    try {
      const isUs = facility.country === "USA" || facility.country === "United States";

      const [gridCarbon, nws] = await Promise.all([
        env.ELECTRICITY_MAPS_API_KEY
          ? getElectricityMapInsights(facility.lat, facility.lng, env.ELECTRICITY_MAPS_API_KEY).catch(() => null)
          : Promise.resolve(null),
        isUs ? getNwsInsights(facility.lat, facility.lng).catch(() => null) : Promise.resolve(null),
      ]);

      const renewablePercent = gridCarbon
        ? Math.round(gridCarbon.renewablePercentage ?? gridCarbon.carbonFreeEnergyPercentage ?? NaN)
        : NaN;

      const gridRisk =
        gridRiskFromNwsAlerts(nws?.activeAlerts ?? []) ??
        gridRiskFromCarbonLevel(gridCarbon?.carbonIntensityLevel ?? null);

      const hasRenewable = !Number.isNaN(renewablePercent);
      if (!hasRenewable && !gridRisk) continue;

      await env.DB.prepare(
        `UPDATE data_centers SET
           renewable_percent = COALESCE(?, renewable_percent),
           grid_risk = COALESCE(?, grid_risk)
         WHERE id = ?`,
      ).bind(hasRenewable ? renewablePercent : null, gridRisk, facility.id).run();
      updated++;

      // Electricity Maps free tier is request-rate limited — stay well under it.
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.warn(`Enrichment sweep failed for facility ${facility.id}:`, err);
    }
  }

  await registerExternalApiObservation(
    env.DB,
    "facility-enrichment-sweep",
    "daily-sweep",
    { checked: results.length, updated },
    undefined,
    24 * 60 * 60 * 1000,
  );

  return { ok: true, updated, checked: results.length };
}

const CORS = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const CLAUDE_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
const GEMINI_MODEL = "gemini-2.5-flash";

type ChatMessage = { role: string; content: string };
type ChatProviderResult = {
  provider: "gemini" | "anthropic" | "groq";
  model: string;
  answer: string;
};

const DATASIST_SYSTEM = `You are DataSist AI, the intelligence engine for the DataSist platform — part of the Aliasist suite (aliasist.com).

DataSist tracks 340+ AI data centers globally across North America, Europe, Asia, the Middle East, Africa, Oceania, and South America. Data sourced from the AI Data Center Index (aidatacenterindex.com, CC BY 4.0) and enriched with EIA electricity pricing.

Facility data includes: power capacity (MW), estimated annual energy (GWh), energy type, renewable percentage, AI focus (training/inference), status (operational/under construction/planned), location, company, and grid risk.

Key stats: ~53,000+ MW operational, ~85,000+ MW in North America alone, facilities in 50+ countries.

Companies tracked: AWS, Microsoft, Google, Meta, xAI, OpenAI/Stargate, Anthropic, Oracle, CoreWeave, Tesla, DeepSeek, Baidu, ByteDance, Huawei, SoftBank, Equinix, and 50+ more.

Your role: Answer questions about AI data centers, their environmental impact, energy usage, nuclear/renewable power trends, community effects, geopolitical patterns, and the broader AI infrastructure race. Be precise, data-driven, and concise. When referencing specific facilities, use the data provided. Flag community resistance and environmental concerns honestly.`;

// ── Sentry (lightweight, no SDK needed in Workers) ───────────────────────────
const SENTRY_DSN = "https://a4392f5f65eb0725f34d6c410f97e1b1@o4511142133760000.ingest.us.sentry.io/4511142165348352";
async function captureError(err: unknown, context: string): Promise<void> {
  try {
    const msg = err instanceof Error ? err.message : String(err);
    const [, key, host, projectId] = SENTRY_DSN.match(/https:\/\/([^@]+)@([^/]+)\/(.+)/) ?? [];
    if (!key) return;
    await fetch(`https://${host}/api/${projectId}/store/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${key}` },
      body: JSON.stringify({
        platform: "javascript", level: "error",
        logger: `datasist-api.${context}`,
        message: msg,
        timestamp: new Date().toISOString(),
        tags: { worker: "datasist-api", context },
      }),
    });
  } catch { /* never block the worker */ }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

function cors(_request: Request, _env: Env) {
  // Always allow all origins for CORS
  return CORS("*");
}

// ── Router ────────────────────────────────────────────────────────────────────

// Production hold gate. When MAINTENANCE_MODE is true, every non-OPTIONS
// request gets a 503 instead of hitting DB/routing logic below. Flip to
// true and `wrangler deploy` to take this Worker down for maintenance;
// flip back to false and redeploy to restore it. A Worker has no
// preview/production split the way Pages does, so unlike the
// functions/_middleware.ts gates on aliasist-web/waterfall/datasist, this
// always applies once deployed — there's no separate domain check.
const MAINTENANCE_MODE = false;

export default {
  // Cron triggers — hourly D1 → Neon sync, daily facility lead discovery,
  // daily live enrichment sweep (renewable %, grid risk)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    if (event.cron === "0 6 * * *") {
      ctx.waitUntil(discoverFacilityLeads(env));
      return;
    }
    if (event.cron === "30 6 * * *") {
      ctx.waitUntil(refreshFacilityEnrichment(env));
      return;
    }
    ctx.waitUntil(syncD1ToNeon(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = cors(request, env);

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (MAINTENANCE_MODE) {
      return new Response(
        JSON.stringify({ error: "DataSist API is temporarily unavailable for maintenance" }),
        { status: 503, headers: { ...corsHeaders, "content-type": "application/json", "retry-after": "3600" } },
      );
    }

    try {
      // Seed on first request if DB is empty
      await seedIfEmpty(env.DB);

      // Routes — support both /api/data-centers (frontend) and /api/facilities
      const p = url.pathname;
      const isCollection = p === "/api/data-centers" || p === "/api/facilities";
      const isItem = p.startsWith("/api/data-centers/") || p.startsWith("/api/facilities/");
      const itemId = isItem ? parseInt(p.split("/").pop() ?? "") : NaN;
      const liveInsightsMatch = p.match(/^\/api\/(?:data-centers|facilities)\/(\d+)\/live-insights$/);

      // ── Public reads ────────────────────────────────────────────────────
      if (isCollection && request.method === "GET") return handleGetAll(env.DB, corsHeaders, env);
      if (p === "/api/observations/status" && request.method === "GET") {
        return handleObservationStatus(env.DB, corsHeaders);
      }
      if (p === "/api/facility-leads" && request.method === "GET") {
        const auth = await requireAdmin(request, env, corsHeaders);
        if (!auth.ok) return auth.response;
        return handleGetFacilityLeads(env.DB, url, corsHeaders);
      }
      // PATCH /api/facility-leads/:id — update a lead's review status (admin only)
      const facilityLeadMatch = p.match(/^\/api\/facility-leads\/([^/]+)$/);
      if (facilityLeadMatch && request.method === "PATCH") {
        const auth = await requireAdmin(request, env, corsHeaders);
        if (!auth.ok) return auth.response;
        return handleUpdateFacilityLead(env.DB, decodeURIComponent(facilityLeadMatch[1]), request, corsHeaders);
      }
      // POST /api/facility-leads/discover — manually trigger a discovery sweep (admin only)
      if (p === "/api/facility-leads/discover" && request.method === "POST") {
        const auth = await requireAdmin(request, env, corsHeaders);
        if (!auth.ok) return auth.response;
        const result = await discoverFacilityLeads(env);
        return json(result, 200, corsHeaders);
      }
      // POST /api/enrichment/refresh — manually trigger the live enrichment sweep (admin only)
      if (p === "/api/enrichment/refresh" && request.method === "POST") {
        const auth = await requireAdmin(request, env, corsHeaders);
        if (!auth.ok) return auth.response;
        const result = await refreshFacilityEnrichment(env);
        return json(result, 200, corsHeaders);
      }
      if (liveInsightsMatch && request.method === "GET") {
        return handleGetLiveInsights(env.DB, Number(liveInsightsMatch[1]), corsHeaders, env);
      }
      if (isItem && request.method === "GET") return handleGetOne(env.DB, itemId, corsHeaders);

      // ── Admin-only mutations (Clerk JWT + ADMIN_USER_IDS allow-list) ────
      if (isCollection && request.method === "POST") {
        const auth = await requireAdmin(request, env, corsHeaders);
        if (!auth.ok) return auth.response;
        return handleCreate(request, env.DB, corsHeaders);
      }
      if (isItem && (request.method === "PUT" || request.method === "PATCH")) {
        const auth = await requireAdmin(request, env, corsHeaders);
        if (!auth.ok) return auth.response;
        return handleUpdate(request, env.DB, itemId, corsHeaders);
      }
      if (isItem && request.method === "DELETE") {
        const auth = await requireAdmin(request, env, corsHeaders);
        if (!auth.ok) return auth.response;
        return handleDelete(env.DB, itemId, corsHeaders);
      }

      if (p === "/api/ai/chat" && request.method === "POST") return handleChat(request, corsHeaders, env);
      if (p === "/api/ai/rag-chat" && request.method === "POST") return handleRagChat(request, corsHeaders, env);
      if (p === "/api/stats") return handleStats(env.DB, corsHeaders);
      if (p === "/api/health") {
        return json({
          status: "ok",
          app: "DataSist",
          version: "3.1.0",
          neon: !!env.NEON_DATABASE_URL,
          rag: !!env.RAG_API_URL,
          adminAuth: env.CLERK_SECRET_KEY && env.ADMIN_USER_IDS ? "clerk" : "unconfigured",
        }, 200, corsHeaders);
      }

      // POST /api/neon/sync — manually trigger D1 → Neon sync (admin only)
      if (p === "/api/neon/sync" && request.method === "POST") {
        const auth = await requireAdmin(request, env, corsHeaders);
        if (!auth.ok) return auth.response;
        if (!env.NEON_DATABASE_URL) return json({ error: "NEON_DATABASE_URL not configured" }, 500, corsHeaders);
        const result = await syncD1ToNeon(env);
        return json(result, 200, corsHeaders);
      }

      // Force re-sync from Index API (admin only — this wipes a chunk of the table)
      if (p === "/api/sync" && request.method === "POST") {
        const auth = await requireAdmin(request, env, corsHeaders);
        if (!auth.ok) return auth.response;
        const count = await syncFromIndexAPI(env.DB);
        lastSyncAt = Date.now();
        return json({ ok: true, synced: count, source: "aidatacenterindex.com" }, 200, corsHeaders);
      }

      return json({ error: "Not found" }, 404, corsHeaders);
    } catch (err) {
      console.error(err);
      // Report to Sentry fire-and-forget
      void captureError(err, "fetch");
      return json({ error: "Internal server error" }, 500, corsHeaders);
    }
  },
};

// ── Handlers ──────────────────────────────────────────────────────────────────

// Convert snake_case DB row to camelCase for the frontend
interface FacilityRecord {
  id: number | string;
  name: string;
  company: string;
  companyType: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  capacityMW: number | null;
  estimatedAnnualGWh: number | null;
  waterUsageMillionGallons: number | null;
  status: string;
  yearOpened: number | null;
  yearPlanned: number | null;
  investmentBillions: number | null;
  acreage: number | null;
  primaryModels: string | null;
  communityImpact: string | null;
  communityResistance: number | null;
  gridRisk: string | null;
  renewablePercent: number | null;
  notes: string | null;
  electricityPriceCentsPerKwh?: number;
  estimatedAnnualElectricityCostMillions?: number;
}

function toCamel(row: Record<string, unknown>): FacilityRecord {
  return {
    id: (row.id as number | string) ?? "",
    name: String(row.name ?? ""),
    company: String(row.company ?? ""),
    companyType: String(row.company_type ?? ""),
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
    city: String(row.city ?? ""),
    state: String(row.state ?? ""),
    country: String(row.country ?? ""),
    capacityMW: row.capacity_mw == null ? null : Number(row.capacity_mw),
    estimatedAnnualGWh: row.estimated_annual_gwh == null ? null : Number(row.estimated_annual_gwh),
    waterUsageMillionGallons: row.water_usage_million_gallons == null ? null : Number(row.water_usage_million_gallons),
    status: String(row.status ?? ""),
    yearOpened: row.year_opened == null ? null : Number(row.year_opened),
    yearPlanned: row.year_planned == null ? null : Number(row.year_planned),
    investmentBillions: row.investment_billions == null ? null : Number(row.investment_billions),
    acreage: row.acreage == null ? null : Number(row.acreage),
    primaryModels: row.primary_models == null ? null : String(row.primary_models),
    communityImpact: row.community_impact == null ? null : String(row.community_impact),
    communityResistance: row.community_resistance == null ? null : Number(row.community_resistance),
    gridRisk: row.grid_risk == null ? null : String(row.grid_risk),
    renewablePercent: row.renewable_percent == null ? null : Number(row.renewable_percent),
    notes: row.notes == null ? null : String(row.notes),
  };
}

function facilityFieldScore(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "string") return value.trim() ? 1 : 0;
  return 1;
}

function facilityCompleteness(facility: FacilityRecord): number {
  const fields: unknown[] = [
    facility.capacityMW,
    facility.estimatedAnnualGWh,
    facility.waterUsageMillionGallons,
    facility.investmentBillions,
    facility.acreage,
    facility.primaryModels,
    facility.communityImpact,
    facility.gridRisk,
    facility.renewablePercent,
    facility.notes,
    facility.electricityPriceCentsPerKwh,
    facility.estimatedAnnualElectricityCostMillions,
  ];

  return fields.reduce<number>((score, value) => score + facilityFieldScore(value), 0);
}

function mergeFacilityRecords(primary: FacilityRecord, secondary: FacilityRecord): FacilityRecord {
  const merged: FacilityRecord = { ...primary };

  for (const [key, value] of Object.entries(secondary)) {
    const typedKey = key as keyof FacilityRecord;
    const current = merged[typedKey];
    if (current === null || current === undefined || current === "") {
      merged[typedKey] = value as never;
    }
  }

  return merged;
}

function dedupeFacilities(facilities: FacilityRecord[]): FacilityRecord[] {
  const deduped = new Map<string, FacilityRecord>();

  for (const facility of facilities) {
    const key = facility.name.trim().toLowerCase();
    const existing = deduped.get(key);

    if (!existing) {
      deduped.set(key, facility);
      continue;
    }

    const keepExisting = facilityCompleteness(existing) >= facilityCompleteness(facility);
    const primary = keepExisting ? existing : facility;
    const secondary = keepExisting ? facility : existing;
    deduped.set(key, mergeFacilityRecords(primary, secondary));
  }

  return Array.from(deduped.values()).sort((a, b) => Number(a.id) - Number(b.id));
}

async function handleGetAll(db: D1Database, headers: Record<string, string>, env?: Env) {
  const { results } = await db.prepare("SELECT * FROM data_centers ORDER BY id ASC").all();
  const facilities = results.map(toCamel) as FacilityRecord[];

  // Enrich with live EIA electricity prices
  if (env?.EIA_API_KEY) {
    const prices = await getEIAPrices(env.EIA_API_KEY);
    await registerExternalApiObservation(env.DB, "eia", "commercial-electricity-prices", prices, undefined, 24 * 60 * 60 * 1000);
    for (const f of facilities) {
      const abbr = STATE_ABBR[f.state as string];
      const priceCents = abbr ? prices[abbr] : undefined;
      if (priceCents) {
        f.electricityPriceCentsPerKwh = priceCents;
        // Estimate annual electricity cost based on capacity
        const capacityMW = f.capacityMW;
        if (capacityMW) {
          const annualGWh = capacityMW * 8760 / 1000;
          const annualCostMillions = (annualGWh * 1_000_000 * priceCents) / 100 / 1_000_000;
          f.estimatedAnnualElectricityCostMillions = Math.round(annualCostMillions);
        }
      }
    }
  }

  return json(dedupeFacilities(facilities), 200, headers);
}

async function handleGetOne(db: D1Database, id: number, headers: Record<string, string>) {
  if (isNaN(id)) return json({ error: "Invalid ID" }, 400, headers);
  const row = await db.prepare("SELECT * FROM data_centers WHERE id = ?").bind(id).first();
  if (!row) return json({ error: "Not found" }, 404, headers);
  return json(toCamel(row as Record<string, unknown>), 200, headers);
}

async function handleGetLiveInsights(db: D1Database, id: number, headers: Record<string, string>, env: Env) {
  if (isNaN(id)) return json({ error: "Invalid ID" }, 400, headers);
  const row = await db.prepare("SELECT * FROM data_centers WHERE id = ?").bind(id).first();
  if (!row) return json({ error: "Not found" }, 404, headers);

  const facility = toCamel(row as Record<string, unknown>);
  const isUs = facility.country === "USA" || facility.country === "United States";

  const electricity = {
    retailPriceCentsPerKwh: null as number | null,
    estimatedAnnualElectricityCostMillions: null as number | null,
    source: "EIA",
  };

  if (env.EIA_API_KEY) {
    const prices = await getEIAPrices(env.EIA_API_KEY);
    const abbr = STATE_ABBR[facility.state];
    const priceCents = abbr ? prices[abbr] : undefined;
    if (priceCents) {
      electricity.retailPriceCentsPerKwh = priceCents;
      if (facility.capacityMW) {
        const annualGWh = facility.capacityMW * 8760 / 1000;
        electricity.estimatedAnnualElectricityCostMillions = Math.round((annualGWh * priceCents) / 100);
      }
    }
  }

  const [gridCarbon, weather, airQuality, nws] = await Promise.all([
    env.ELECTRICITY_MAPS_API_KEY
      ? getElectricityMapInsights(facility.lat, facility.lng, env.ELECTRICITY_MAPS_API_KEY).catch(() => null)
      : Promise.resolve(null),
    getOpenMeteoWeatherInsights(facility.lat, facility.lng).catch(() => null),
    getOpenMeteoAirQualityInsights(facility.lat, facility.lng).catch(() => null),
    isUs ? getNwsInsights(facility.lat, facility.lng).catch(() => null) : Promise.resolve(null),
  ]);

  const insights = {
    facilityId: facility.id,
    electricity,
    gridCarbon,
    weather,
    airQuality,
    nws,
  };

  await Promise.all([
    registerExternalApiObservation(db, "eia", `facility:${facility.id}`, electricity, facility.id, 24 * 60 * 60 * 1000),
    ...(gridCarbon ? [registerExternalApiObservation(db, "electricity-maps", `facility:${facility.id}`, gridCarbon, facility.id)] : []),
    ...(weather ? [registerExternalApiObservation(db, "open-meteo-weather", `facility:${facility.id}`, weather, facility.id)] : []),
    ...(airQuality ? [registerExternalApiObservation(db, "open-meteo-air-quality", `facility:${facility.id}`, airQuality, facility.id)] : []),
    ...(nws ? [registerExternalApiObservation(db, "nws", `facility:${facility.id}`, nws, facility.id)] : []),
    logUsage(env.ANALYTICS, "datasist-api", "live-insights", "read", String(facility.id), {
      sources: ["eia", gridCarbon?.source, weather?.source, airQuality?.source, nws?.source].filter(Boolean),
    }),
  ]);

  return json(insights, 200, headers);
}

async function handleCreate(request: Request, db: D1Database, headers: Record<string, string>) {
  const body = await request.json() as Record<string, unknown>;
  const stmt = db.prepare(`
    INSERT INTO data_centers (name,company,company_type,lat,lng,city,state,country,
      capacity_mw,estimated_annual_gwh,water_usage_million_gallons,status,
      year_opened,year_planned,investment_billions,acreage,primary_models,
      community_impact,community_resistance,grid_risk,renewable_percent,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    body.name, body.company, body.companyType ?? body.company_type, body.lat, body.lng,
    body.city, body.state, body.country ?? "USA",
    body.capacityMW ?? body.capacity_mw ?? null,
    body.estimatedAnnualGWh ?? body.estimated_annual_gwh ?? null,
    body.waterUsageMillionGallons ?? body.water_usage_million_gallons ?? null,
    body.status, body.yearOpened ?? body.year_opened ?? null,
    body.yearPlanned ?? body.year_planned ?? null,
    body.investmentBillions ?? body.investment_billions ?? null,
    body.acreage ?? null,
    typeof body.primaryModels === "string" ? body.primaryModels : JSON.stringify(body.primaryModels ?? []),
    body.communityImpact ?? body.community_impact ?? null,
    body.communityResistance ?? body.community_resistance ?? 0,
    body.gridRisk ?? body.grid_risk ?? null,
    body.renewablePercent ?? body.renewable_percent ?? null,
    body.notes ?? null,
  );
  const result = await stmt.run();
  return json({ id: result.meta.last_row_id, ...body }, 201, headers);
}

async function handleUpdate(request: Request, db: D1Database, id: number, headers: Record<string, string>) {
  if (isNaN(id)) return json({ error: "Invalid ID" }, 400, headers);
  const body = await request.json() as Record<string, unknown>;
  await db.prepare(`
    UPDATE data_centers SET
      name=?, company=?, company_type=?, lat=?, lng=?, city=?, state=?, country=?,
      capacity_mw=?, estimated_annual_gwh=?, water_usage_million_gallons=?, status=?,
      year_opened=?, year_planned=?, investment_billions=?, acreage=?, primary_models=?,
      community_impact=?, community_resistance=?, grid_risk=?, renewable_percent=?, notes=?
    WHERE id=?
  `).bind(
    body.name, body.company, body.companyType ?? body.company_type, body.lat, body.lng,
    body.city, body.state, body.country ?? "USA",
    body.capacityMW ?? body.capacity_mw ?? null,
    body.estimatedAnnualGWh ?? body.estimated_annual_gwh ?? null,
    body.waterUsageMillionGallons ?? body.water_usage_million_gallons ?? null,
    body.status, body.yearOpened ?? body.year_opened ?? null,
    body.yearPlanned ?? body.year_planned ?? null,
    body.investmentBillions ?? body.investment_billions ?? null,
    body.acreage ?? null,
    typeof body.primaryModels === "string" ? body.primaryModels : JSON.stringify(body.primaryModels ?? []),
    body.communityImpact ?? body.community_impact ?? null,
    body.communityResistance ?? body.community_resistance ?? 0,
    body.gridRisk ?? body.grid_risk ?? null,
    body.renewablePercent ?? body.renewable_percent ?? null,
    body.notes ?? null,
    id,
  ).run();
  return json({ id, ...body }, 200, headers);
}

async function handleDelete(db: D1Database, id: number, headers: Record<string, string>) {
  if (isNaN(id)) return json({ error: "Invalid ID" }, 400, headers);
  await db.prepare("DELETE FROM data_centers WHERE id = ?").bind(id).run();
  return json({ deleted: true }, 200, headers);
}

async function handleStats(db: D1Database, headers: Record<string, string>) {
  const { results } = await db.prepare("SELECT * FROM data_centers").all();
  const facilities = dedupeFacilities((results as Record<string, unknown>[]).map(toCamel) as FacilityRecord[]);
  const totalCapacity = facilities.reduce((sum, f) => sum + (Number(f.capacityMW) || 0), 0);
  const operational = facilities.filter((f) => f.status === "operational").length;
  const underConstruction = facilities.filter((f) => f.status === "under_construction").length;
  const totalInvestment = facilities.reduce((sum, f) => sum + (Number(f.investmentBillions) || 0), 0);
  return json({
    totalFacilities: facilities.length,
    operationalCount: operational,
    underConstructionCount: underConstruction,
    totalCapacityMW: Math.round(totalCapacity),
    totalInvestmentBillions: Math.round(totalInvestment * 10) / 10,
  }, 200, headers);
}

async function handleObservationStatus(db: D1Database, headers: Record<string, string>) {
  const [{ results }, latest] = await Promise.all([
    db.prepare(`
      SELECT source, COUNT(*) AS records, MAX(observed_at) AS latest_observed_at
      FROM external_api_observations
      GROUP BY source
      ORDER BY source ASC
    `).all(),
    db.prepare("SELECT MAX(observed_at) AS latest_observed_at FROM external_api_observations").first(),
  ]);

  return json({
    registered: true,
    latestObservedAt: (latest as { latest_observed_at?: number | null } | null)?.latest_observed_at ?? null,
    sources: results,
  }, 200, headers);
}

// — Claude call for DataSist (uses Anthropic Messages API)
async function callClaudeData(
  apiKey: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const userMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const res = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048, // more tokens for data analysis
      system: systemPrompt,
      messages: userMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Claude ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    content?: Array<{ type: string; text: string }>;
    error?: { message: string };
  };

  if (data.error) throw new Error(data.error.message);
  return data.content?.find((b) => b.type === "text")?.text ?? "No response received.";
}

async function callGeminiData(
  apiKey: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const conversation = messages
    .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
    .join("\n\n");

  const prompt = [
    systemPrompt,
    "",
    "Conversation:",
    conversation,
    "",
    "Answer as DataSist AI. Be concise, data-driven, and grounded in the DataSist facility context.",
  ].join("\n");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
        },
      }),
    }
  );

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `Gemini ${res.status}: ${res.statusText}`);
  }

  return data.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim() || "No response received.";
}

async function callGroqData(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const groqRes = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 768,
      temperature: 0.65,
    }),
  });

  if (!groqRes.ok) {
    const errText = await groqRes.text().catch(() => groqRes.statusText);
    throw new Error(`Groq API error: ${groqRes.status} — ${errText}`);
  }

  const data = await groqRes.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message: string };
  };

  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content?.trim() ?? "No response received.";
}

async function handleChat(request: Request, headers: Record<string, string>, env: Env) {
  // Accept both legacy { question, facilityId } and modern { messages } payloads
  const body = await request.json() as {
    question?: string;
    facilityId?: number | null;
    messages?: Array<{ role: string; content: string }>;
    history?: Array<{ role: string; content: string }>;
  };

  // Build system prompt — inject facility context if provided
  const facilityContext = body.facilityId
    ? `\n\n[User is asking about facility ID ${body.facilityId}. Focus your answer on that specific facility when relevant.]`
    : "";
  const systemPrompt = DATASIST_SYSTEM + facilityContext;

  // Build messages array
  let chatMessages: ChatMessage[];
  if (body.question) {
    const history = (body.history ?? []).filter((m) => m.role !== "system");
    chatMessages = [...history, { role: "user", content: body.question }];
  } else {
    chatMessages = (body.messages ?? []).filter((m) => m.role !== "system");
  }

  if (!env.GEMINI_API_KEY && !env.ANTHROPIC_API_KEY && !env.GROQ_API_KEY) {
    return json({ error: "No AI keys configured on this worker." }, 500, headers);
  }

  try {
    const attemptedProviders: string[] = [];
    const failures: Array<{ provider: string; error: string }> = [];

    const attempts: Array<{
      provider: ChatProviderResult["provider"];
      run: () => Promise<ChatProviderResult>;
    }> = [
      ...(env.GEMINI_API_KEY ? [{
        provider: "gemini" as const,
        run: async () => ({
          provider: "gemini" as const,
          model: GEMINI_MODEL,
          answer: await callGeminiData(env.GEMINI_API_KEY, systemPrompt, chatMessages),
        }),
      }] : []),
      ...(env.ANTHROPIC_API_KEY ? [{
        provider: "anthropic" as const,
        run: async () => ({
          provider: "anthropic" as const,
          model: CLAUDE_MODEL,
          answer: await callClaudeData(env.ANTHROPIC_API_KEY, systemPrompt, chatMessages),
        }),
      }] : []),
      ...(env.GROQ_API_KEY ? [{
        provider: "groq" as const,
        run: async () => ({
          provider: "groq" as const,
          model: GROQ_MODEL,
          answer: await callGroqData(env.GROQ_API_KEY, systemPrompt, chatMessages),
        }),
      }] : []),
    ];

    for (const attempt of attempts) {
      try {
        const result = await attempt.run();
        attemptedProviders.push(result.provider);
        const userMessage = chatMessages.filter((message) => message.role === "user").at(-1)?.content ?? "";
        await Promise.all([
          logChat(env.ANALYTICS, "datasist", userMessage, result.answer, result.model),
          logUsage(env.ANALYTICS, "datasist-api", "ai-chat", result.provider, body.facilityId ? String(body.facilityId) : undefined, {
            model: result.model,
            fallbackUsed: attemptedProviders.length > 1,
          }),
        ]);
        return json({
          answer: result.answer,
          model: result.model,
          provider: result.provider,
          attemptedProviders,
          fallbackUsed: attemptedProviders.length > 1,
        }, 200, headers);
      } catch (err) {
        attemptedProviders.push(attempt.provider);
        failures.push({
          provider: attempt.provider,
          error: err instanceof Error ? err.message : String(err),
        });
        console.warn(`AI provider failed (${attempt.provider}), falling back:`, err);
      }
    }

    return json({
      error: "All configured AI providers failed.",
      attemptedProviders,
      failures,
    }, 502, headers);

  } catch (err) {
    return json({ error: `Failed to reach AI provider: ${String(err)}` }, 502, headers);
  }
}

async function handleRagChat(request: Request, headers: Record<string, string>, env: Env) {
  if (!env.RAG_API_URL) {
    return json({ error: "RAG_API_URL not configured on this worker." }, 500, headers);
  }

  try {
    const body = await request.json() as {
      question?: string;
      facilityId?: number | null;
      messages?: Array<{ role: string; content: string }>;
      history?: Array<{ role: string; content: string }>;
      topK?: number;
      sourceType?: string;
    };
    const targetUrl = new URL(env.RAG_API_URL);

    if (!targetUrl.pathname || targetUrl.pathname === "/") {
      targetUrl.pathname = "/api/v1/query";
    }

    const question = body.question?.trim()
      || [...(body.history ?? []), ...(body.messages ?? [])]
        .filter((message) => message.role === "user" && message.content?.trim())
        .map((message) => message.content.trim())
        .at(-1)
      || "";

    if (!question) {
      return json({ error: "question is required" }, 400, headers);
    }

    const ragPayload: Record<string, unknown> = {
      question,
      topK: Number.isInteger(body.topK) ? body.topK : 5,
    };

    if (body.sourceType) {
      ragPayload.sourceType = body.sourceType;
    }

    const proxyHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (env.RAG_API_KEY) {
      proxyHeaders["Authorization"] = `Bearer ${env.RAG_API_KEY}`;
    }

    const ragRes = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: proxyHeaders,
      body: JSON.stringify(ragPayload),
    });

    const responseText = await ragRes.text();
    let responseJson: { answer?: string; citations?: unknown; error?: unknown } | null = null;
    try {
      responseJson = JSON.parse(responseText) as { answer?: string; citations?: unknown; error?: unknown };
    } catch {
      responseJson = null;
    }

    if (ragRes.ok && responseJson?.answer) {
      await Promise.all([
        logChat(env.ANALYTICS, "datasist-rag", question, responseJson.answer, "rag-core"),
        logUsage(env.ANALYTICS, "datasist-api", "rag-chat", "query", body.facilityId ? String(body.facilityId) : undefined, {
          sourceType: body.sourceType ?? null,
          topK: ragPayload.topK,
        }),
      ]);
      return json({
        answer: responseJson.answer,
        citations: responseJson.citations ?? [],
        model: "rag-core",
        facilityId: body.facilityId ?? null,
      }, ragRes.status, headers);
    }

    return new Response(responseText, {
      status: ragRes.status,
      headers: {
        ...headers,
        "Content-Type": ragRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    return json({ error: `Failed to reach RAG service: ${String(err)}` }, 502, headers);
  }
}

// ── Live Data Sync from AI Data Center Index ──────────────────────────────────
// Source: https://aidatacenterindex.com — CC BY 4.0

const INDEX_CONTINENTS = [
  "north-america",
  "europe",
  "asia",
  "middle-east",
  "africa",
  "oceania",
  "south-america",
];

interface IndexItem {
  id: string;
  title: string;
  megawatts: number | null;
  companies: string[];
  country: string;
  region: string;
  city: string;
  status: string;
  energy_type: string;
  ai_focus: string;
  start_year: number | null;
  lat: number;
  lng: number;
  sources: string[];
}

// Infer a company_type from companies list
function inferCompanyType(companies: string[]): string {
  const names = companies.join(" ").toLowerCase();
  if (/equinix|digital realty|ntt|coreweave|hetzner|airtrunk|nextdc|bulk|raxio|vantage/.test(names)) return "colocation";
  if (/xai|deepseek|mistral|openai|anthropic|crusoe|tesla|nebius|naver|kakao|baidu|bytedance|volcengine|tencent|alibaba|huawei/.test(names)) return "neocloud";
  if (/government|ministry|sovereign|kaust|university|institute/.test(names)) return "research";
  return "hyperscale";
}

// Infer renewable_percent from energy_type string
function inferRenewablePercent(energy: string): number | null {
  const e = energy.toLowerCase();
  if (e.includes("100%") || e.includes("100 %") || e.includes("geothermal") || e === "renewable") return 100;
  if (e.includes("hydro") && !e.includes("mixed")) return 95;
  if (e.includes("nuclear") && !e.includes("gas") && !e.includes("grid")) return 90;
  if (e.includes("renewable") && e.includes("grid")) return 70;
  if (e.includes("renewable") && e.includes("ppa")) return 80;
  if (e.includes("renewable")) return 75;
  if (e.includes("solar") || e.includes("wind")) return 80;
  if (e.includes("gas") || e.includes("methane") || e.includes("natural gas")) return 0;
  if (e.includes("mixed") || e.includes("grid")) return 50;
  if (e.includes("unknown")) return null;
  return null;
}

// Infer grid_risk from country, status, and energy
function inferGridRisk(country: string, status: string, energy: string): string {
  const e = energy.toLowerCase();
  const c = country.toLowerCase();
  if (["norway", "iceland", "finland", "sweden", "denmark", "new zealand"].some(x => c.includes(x))) return "low";
  if (e.includes("nuclear") || e.includes("hydro") || e.includes("geothermal")) return "low";
  if (["united states", "ireland", "singapore", "uae"].some(x => c.includes(x)) && status === "operational") return "medium";
  if (e.includes("gas") || e.includes("methane")) return "medium";
  return "medium";
}

// Normalize an Index API item to DataSist DB row format
function normalizeItem(item: IndexItem) {
  const company = item.companies[0] ?? "Unknown";
  const allCompanies = item.companies.join(", ");
  const companyType = inferCompanyType(item.companies);
  const renewPct = inferRenewablePercent(item.energy_type);
  const gridRisk = inferGridRisk(item.country, item.status, item.energy_type);

  // Map Index status to DataSist status values
  const statusMap: Record<string, string> = {
    operational: "operational",
    under_construction: "under_construction",
    planned: "under_construction",
    announced: "under_construction",
    canceled: "canceled",
  };
  const status = statusMap[item.status] ?? "under_construction";

  // Derive year fields
  const yearOpened = (item.status === "operational" && item.start_year) ? item.start_year : null;
  const yearPlanned = (item.status !== "operational" && item.start_year) ? item.start_year : null;

  // Capacity in MW — use directly if available
  const capacityMW = item.megawatts ?? null;
  // Estimate annual GWh: capacity * 8760h * 0.8 PUE / 1000
  const annualGWh = capacityMW ? Math.round(capacityMW * 8760 * 0.8 / 1000) : null;

  // AI focus and energy type become the notes field (new columns aren't in DB yet — store in notes)
  const notes = [
    item.ai_focus && item.ai_focus !== "Unknown" ? `AI Focus: ${item.ai_focus}` : null,
    item.energy_type && item.energy_type !== "Unknown" ? `Energy: ${item.energy_type}` : null,
    item.sources?.[0] ? `Source: ${item.sources[0]}` : null,
  ].filter(Boolean).join(" | ");

  return {
    // Use slug as external_id concept — store in name to keep unique
    name: item.title,
    company: allCompanies.slice(0, 120),
    company_type: companyType,
    lat: item.lat,
    lng: item.lng,
    city: item.city?.split("/")[0]?.trim() ?? "Unknown",
    state: item.region?.split(",")[0]?.trim() ?? "",
    country: item.country,
    capacity_mw: capacityMW,
    estimated_annual_gwh: annualGWh,
    water_usage_million_gallons: null,
    status,
    year_opened: yearOpened,
    year_planned: yearPlanned,
    investment_billions: null,
    acreage: null,
    primary_models: JSON.stringify(
      item.ai_focus && item.ai_focus !== "Unknown"
        ? [item.ai_focus]
        : []
    ),
    community_impact: `${item.country} — ${item.energy_type}. ${item.ai_focus !== "Unknown" ? item.ai_focus : ""}.`.trim(),
    community_resistance: 0,
    grid_risk: gridRisk,
    renewable_percent: renewPct,
    notes,
  };
}

// Fetch a single continent slice from the Index API
async function fetchContinent(slug: string): Promise<IndexItem[]> {
  try {
    const res = await fetch(
      `https://aidatacenterindex.com/continents/${slug}/index.json`,
      { headers: { "User-Agent": "DataSist/2.0 (aliasist.com)" }, cf: { cacheTtl: 3600 } } as RequestInit
    );
    if (!res.ok) return [];
    const data = await res.json() as { items: IndexItem[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

// Full sync: fetch all continents, deduplicate by title, upsert into D1
async function syncFromIndexAPI(db: D1Database): Promise<number> {
  // Fetch all continents in parallel
  const slices = await Promise.allSettled(
    INDEX_CONTINENTS.map(slug => fetchContinent(slug))
  );

  // Merge and deduplicate by title (slug not stored, title is unique enough)
  const seen = new Set<string>();
  const all: IndexItem[] = [];
  for (const result of slices) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      const key = item.title.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        all.push(item);
      }
    }
  }

  if (all.length === 0) return 0;

  await registerExternalApiObservation(
    db,
    "ai-data-center-index",
    "facility-registry-sync",
    { continents: INDEX_CONTINENTS, facilities: all },
    undefined,
    24 * 60 * 60 * 1000,
  );

  // Clear existing seeded data and replace with fresh Index data
  // Keep any admin-created rows (id > threshold set at seed time)
  await db.prepare("DELETE FROM data_centers WHERE notes LIKE '% | Source:%' OR notes LIKE 'AI Focus:%'").run();

  const rows = all.map(normalizeItem);

  // Batch insert in chunks of 10 (D1 limit per batch)
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const stmts = batch.map(f =>
      db.prepare(`
        INSERT INTO data_centers
          (name,company,company_type,lat,lng,city,state,country,
           capacity_mw,estimated_annual_gwh,water_usage_million_gallons,
           status,year_opened,year_planned,investment_billions,acreage,
           primary_models,community_impact,community_resistance,
           grid_risk,renewable_percent,notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        f.name, f.company, f.company_type, f.lat, f.lng,
        f.city, f.state, f.country,
        f.capacity_mw, f.estimated_annual_gwh, f.water_usage_million_gallons,
        f.status, f.year_opened, f.year_planned,
        f.investment_billions, f.acreage, f.primary_models,
        f.community_impact, f.community_resistance,
        f.grid_risk, f.renewable_percent, f.notes
      )
    );
    await db.batch(stmts);
  }

  return rows.length;
}

// ── D1 → Neon PostgreSQL Sync ──────────────────────────────────────────────────
// Syncs all D1 facility rows to Neon (PostgreSQL) for Carto geospatial analytics
// Uses @neondatabase/serverless — HTTP transport, works in Cloudflare Workers

async function syncD1ToNeon(env: Env): Promise<{ ok: boolean; synced: number; error?: string }> {
  if (!env.NEON_DATABASE_URL) return { ok: false, synced: 0, error: "NEON_DATABASE_URL not set" };

  try {
    const sql = neon(env.NEON_DATABASE_URL);

    // 1 — Create table (one statement per call — Neon HTTP API requirement)
    await sql`CREATE TABLE IF NOT EXISTS data_centers (external_id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT, company_type TEXT, lat DOUBLE PRECISION, lng DOUBLE PRECISION, city TEXT, state TEXT, country TEXT, capacity_mw DOUBLE PRECISION, estimated_annual_gwh DOUBLE PRECISION, water_usage_million_gallons DOUBLE PRECISION, status TEXT, year_opened INTEGER, year_planned INTEGER, investment_billions DOUBLE PRECISION, acreage DOUBLE PRECISION, primary_models TEXT, community_impact TEXT, community_resistance INTEGER DEFAULT 0, grid_risk TEXT, renewable_percent DOUBLE PRECISION, notes TEXT, source TEXT, external_ref TEXT, synced_at TIMESTAMPTZ DEFAULT NOW())`;
    // Additive migration for tables created before source/external_ref existed.
    await sql`ALTER TABLE data_centers ADD COLUMN IF NOT EXISTS source TEXT`;
    await sql`ALTER TABLE data_centers ADD COLUMN IF NOT EXISTS external_ref TEXT`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dc_country ON data_centers (country)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dc_status  ON data_centers (status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dc_latlng  ON data_centers (lat, lng)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dc_source  ON data_centers (source)`;

    // 2 — Fetch all facilities from D1
    const { results } = await env.DB.prepare("SELECT * FROM data_centers ORDER BY id ASC").all();
    if (!results.length) return { ok: true, synced: 0 };

    const rows = results as Record<string, unknown>[];

    // 3 — Batch upsert in chunks of 50 using transaction()
    //     transaction() sends all statements in a single HTTP round-trip
    const CHUNK = 50;
    let synced = 0;

    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      try {
        await sql.transaction(
          chunk.map(row => sql`
            INSERT INTO data_centers
              (external_id, name, company, company_type, lat, lng, city, state, country,
               capacity_mw, estimated_annual_gwh, water_usage_million_gallons, status,
               year_opened, year_planned, investment_billions, acreage, primary_models,
               community_impact, community_resistance, grid_risk, renewable_percent, notes,
               source, external_ref, synced_at)
            VALUES (
              ${String(row.id)}, ${row.name as string}, ${row.company as string}, ${row.company_type as string},
              ${row.lat as number}, ${row.lng as number}, ${row.city as string}, ${row.state as string}, ${row.country as string},
              ${row.capacity_mw as number}, ${row.estimated_annual_gwh as number}, ${row.water_usage_million_gallons as number},
              ${row.status as string}, ${row.year_opened as number}, ${row.year_planned as number},
              ${row.investment_billions as number}, ${row.acreage as number}, ${row.primary_models as string},
              ${row.community_impact as string}, ${(row.community_resistance as number) ?? 0},
              ${row.grid_risk as string}, ${row.renewable_percent as number}, ${row.notes as string},
              ${row.source as string | null}, ${row.external_ref as string | null}, NOW()
            )
            ON CONFLICT (external_id) DO UPDATE SET
              name=EXCLUDED.name, company=EXCLUDED.company, capacity_mw=EXCLUDED.capacity_mw,
              status=EXCLUDED.status, lat=EXCLUDED.lat, lng=EXCLUDED.lng,
              country=EXCLUDED.country, renewable_percent=EXCLUDED.renewable_percent,
              grid_risk=EXCLUDED.grid_risk, community_resistance=EXCLUDED.community_resistance,
              notes=EXCLUDED.notes, source=EXCLUDED.source, external_ref=EXCLUDED.external_ref,
              synced_at=NOW()
          `)
        );
        synced += chunk.length;
      } catch (chunkErr) {
        console.warn(`Neon chunk ${i}-${i + CHUNK} failed:`, chunkErr);
        void captureError(chunkErr, `neon-chunk-${i}`);
      }
    }

    console.log(`Neon sync complete: ${synced}/${rows.length} facilities`);
    return { ok: true, synced };

  } catch (err) {
    console.error("Neon sync error:", err);
    void captureError(err, "syncD1ToNeon");
    return { ok: false, synced: 0, error: String(err) };
  }
}

// Called on each request — seeds once if empty, re-syncs if stale (>24h)
let lastSyncAt = 0;
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function seedIfEmpty(db: D1Database) {
  const row = await db.prepare("SELECT COUNT(*) as cnt FROM data_centers").first<{ cnt: number }>();
  const count = row?.cnt ?? 0;
  const now = Date.now();

  if (count === 0) {
    // First boot — sync now
    await syncFromIndexAPI(db);
    lastSyncAt = now;
  } else if (now - lastSyncAt > SYNC_INTERVAL_MS && count < 100) {
    // Re-sync if stale and still running old small dataset
    syncFromIndexAPI(db); // fire-and-forget — don't await on hot path
    lastSyncAt = now;
  }
}

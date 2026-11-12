import type { ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json } from "../_lib/clerk-auth";

/** Minimal shape of the edge model binding. */
interface WorkersAi {
  run(
    model: string,
    inputs: Record<string, unknown>,
  ): Promise<{ response?: string } & Record<string, unknown>>;
}

interface Env extends ClerkEnv {
  AI?: WorkersAi;
  /** Override the edge text model. */
  AI_MODEL?: string;
  /** Per-IP rate limit counter for the public (no sign-in required) chat endpoint. */
  CHAT_RATE_LIMIT?: KVNamespace;
  /** Backup chat API key. */
  GROQ_API_KEY?: string;
  /** Fallback: proxy to upstream LLM worker. Defaults to production llm-chat worker URL. */
  LLM_CHAT_BASE_URL?: string;
  /**
   * Base URL for the aliasist RAG worker (api.aliasist.tech).
   * Used to fetch grounded context before answering.
   * Defaults to https://api.aliasist.tech
   */
  RAG_BASE_URL?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

// ---------------------------------------------------------------------------
// RAG
// ---------------------------------------------------------------------------

const DEFAULT_RAG_BASE_URL = "https://api.aliasist.tech";

/** Callback that keeps the runtime alive while background work finishes (Pages `waitUntil`). */
type RagWaitUntil = (promise: Promise<unknown>) => void;

/** Valid sist IDs on the RAG worker. */
const SIST_IDS = ["agsc", "data", "eco", "general", "pulse", "space"] as const;
type SistId = (typeof SIST_IDS)[number];

/**
 * Shape returned by POST /rag/ask. Canonical contract (shared with globalize's
 * rag-gateway, which calls the same hub endpoint): see
 * aliasist-platform/docs/RAG_ASK_CONTRACT.md. Only `sist` and `answer` are
 * guaranteed present, the hub omits `model`/`source`/`latencyMs`/`chunks`
 * whenever its own LLM providers aren't configured, so those must stay optional.
 */
interface RagAskResult {
  answer: string;
  model?: string;
  source?: string;
  latencyMs?: number;
  chunks?: Array<{ id: string; source: string; score: number; text: string }>;
  sist: SistId;
  /**
   * Raw live-data snapshot (eco: active alerts/quakes/events/storms/Kp).
   * Present whenever `live: { includeDataSnapshot: true }` was requested,
   * independent of whether the RAG worker's own LLM providers were up , 
   * this is what lets us answer "what's happening right now" even when
   * that worker fell back to local-retrieval and `answer` is generic.
   */
  liveContext?: string | null;
}

/** Map keywords in the user's latest message to a sist ID. */
export function detectSist(text: string): SistId | null {
  const t = text.toLowerCase();
  if (/\b(space|nasa|iss|spacex|asteroids?|exoplanets?|orbit|rockets?|satellites?|hubble|james webb|apollo)\b/.test(t)) return "space";
  if (/\b(data.?centers?|datacenters?|servers?|hyperscale|colocation|colo|facilit(y|ies)|pue|racks?|gpu.?clusters?)\b/.test(t)) return "data";
  if (/\b(eco|weather|climate|storms?|hurricanes?|wildfires?|floods?|earthquakes?|quakes?|seismic|tsunamis?|air quality|space.?weather|geomagnetic)\b/.test(t)) return "eco";
  if (/\b(markets?|stocks?|tickers?|finance|crypto|macro|earnings|gdp|fed|interest rates?|inflation)\b/.test(t)) return "pulse";
  if (/\b(waterfall|agsc|globe|countr(y|ies)|data.?center.?maps?|undersea.?cables?|internet.?exchanges?|submarine.?cables?)\b/.test(t)) return "agsc";
  if (/\bforum\b/.test(t)) return "general";
  return null;
}

/**
 * Format a RAG worker result into a compact context block for the system prompt.
 *
 * The aliasist RAG worker answers in two modes:
 *   • vector/LLM mode  → `data.answer` is a synthesized answer worth quoting.
 *   • `local-rag` mode → `data.answer` is a canned "Closest grounded answer…"
 *     wrapper, but `data.chunks` still hold real, high-quality source text.
 * In local-rag mode we drop the wrapper prose and ground purely on the chunks,
 * so the existing free retrieval backend is usable instead of discarded.
 *
 * `data.liveContext` (eco only) is independent of both modes, it's the raw
 * live snapshot (active alerts/quakes/storms/Kp), always included when
 * present, since it's what actually answers "what's happening right now"
 * regardless of whether the RAG worker's own LLM providers were reachable.
 */
export function formatRagContext(sist: SistId, data: RagAskResult): string | null {
  const isLocal = data?.source === "local-rag";
  const chunks = data?.chunks ?? [];
  const chunkSnippets = chunks
    .slice(0, 3)
    .map((c) => `- [${c.source}] ${c.text.slice(0, 300)}`)
    .join("\n");
  const liveBlock = data?.liveContext
    ? `Live snapshot (verify; may be stale):\n${data.liveContext}`
    : "";

  // Local-rag mode: ground on chunks (+ live snapshot). No chunks and no
  // live snapshot → nothing useful to add.
  if (isLocal) {
    if (!chunkSnippets && !liveBlock) return null;
    return [
      `=== RAG Context (${sist.toUpperCase()}) ===`,
      chunkSnippets ? `Source excerpts from the ${sist.toUpperCase()} corpus:\n${chunkSnippets}` : "",
      liveBlock,
      `=== End RAG Context ===`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // Vector/LLM mode: quote the synthesized answer plus supporting excerpts.
  if (!data?.answer) return null;
  return [
    `=== RAG Context (${sist.toUpperCase()}) ===`,
    `Answer from corpus: ${data.answer}`,
    chunkSnippets ? `\nSource excerpts:\n${chunkSnippets}` : "",
    liveBlock,
    `=== End RAG Context ===`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Build a stable cache key for a RAG lookup. Cache API keys must be a full URL,
 * so we fold the sist + normalized question into the path of a synthetic origin.
 */
export function ragCacheKey(sist: SistId, question: string): Request {
  const norm = question.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 256);
  const key = `https://rag-cache.aliasist.internal/${sist}/${encodeURIComponent(norm)}`;
  return new Request(key, { method: "GET" });
}

/** TTL for cached RAG context blocks (seconds). Repeated questions answer instantly. */
const RAG_CACHE_TTL_SECONDS = 3600;

/**
 * `eco` questions are grounded against live conditions (active alerts,
 * earthquakes, storms, Kp), not just the static reference corpus, those
 * change minute to minute, so a 1-hour cache would answer "what's happening
 * right now" with stale data. Match the eco route's own edge-cache cadence.
 */
const RAG_CACHE_TTL_SECONDS_LIVE = 60;

/** Header carrying the epoch-ms at which a cached RAG entry was stored. */
const STORED_AT_HEADER = "x-aliasist-stored-at";

/**
 * Static corpora (space, data, pulse, agsc, general) are curated and change
 * rarely: an entry up to this many seconds past its TTL is served instantly
 * while a background revalidation refreshes it, instead of making the reply
 * wait on the hub.
 */
const RAG_SWR_MAX_AGE_SECONDS = 86_400;

/**
 * `eco` answers ride on live feed data the hub itself edge-caches for 5–10
 * minutes (cf cacheTtl 300–600 in liveSnapshots), so serving a ≤5-minute-old
 * snapshot while revalidating is no staler than what a fresh call would
 * return.
 */
const RAG_ECO_SWR_MAX_AGE_SECONDS = 300;

/**
 * Cold `eco` asks race the hub against this budget: if the grounded context
 * doesn't arrive in time, the reply goes out without it and the fetch keeps
 * running under waitUntil, seeding the cache so the next turn is grounded.
 */
const RAG_ECO_BUDGET_MS = 4_500;

/** Store a successful RAG lookup with an explicit stored-at timestamp so freshness is computable on every hit. */
function storedResponse(text: string, ttlSeconds: number): Response {
  return new Response(text, {
    headers: {
      "Cache-Control": `max-age=${ttlSeconds}`,
      [STORED_AT_HEADER]: String(Date.now()),
    },
  });
}

/**
 * Age of a cached entry in ms, computed from its stored-at header — never
 * assumed from Cache-Control or from how the runtime treats expired entries.
 * An entry without a usable header is treated as exactly TTL old: stale, but
 * young enough to serve-while-revalidating rather than block.
 */
function ageMs(cached: Response, ttlSeconds: number): number {
  const raw = cached.headers.get(STORED_AT_HEADER);
  if (raw === null) return ttlSeconds * 1000;
  const storedAt = Number(raw);
  if (!Number.isFinite(storedAt)) return ttlSeconds * 1000;
  return Math.max(0, Date.now() - storedAt);
}

/**
 * Blocking lookup against the hub, caching the result on success. Resolves
 * null on any failure and never rejects, so it is safe to run under
 * waitUntil where an unhandled rejection would surface as a worker error.
 */
async function fetchAndCache(
  env: Env,
  sist: SistId,
  question: string,
  live: boolean,
  cache: Cache | undefined,
  cacheKey: Request,
): Promise<string | null> {
  const base = (env.RAG_BASE_URL?.trim() || DEFAULT_RAG_BASE_URL).replace(/\/+$/, "");
  let context: string | null = null;
  try {
    const res = await fetch(`${base}/rag/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sist,
        question,
        topK: 4,
        ...(live ? { live: { includeDataSnapshot: true } } : {}),
      }),
      // The hub's live-data asks (eco snapshot = 5 upstream feeds + waterfall
      // generation) routinely exceed short budgets, which silently dropped
      // RAG context and produced generic persona answers — hence 12s.
      signal: AbortSignal.timeout(12_000),
    });
    if (res.ok) {
      const data = await res.json() as RagAskResult;
      context = formatRagContext(sist, data);
    }
  } catch {
    context = null;
  }

  // Cache only successful lookups, never poison results during a transient
  // upstream outage by caching a miss.
  if (cache && context) {
    await cache
      .put(cacheKey, storedResponse(context, live ? RAG_CACHE_TTL_SECONDS_LIVE : RAG_CACHE_TTL_SECONDS))
      .catch(() => {});
  }

  return context;
}

/**
 * Fetch grounded RAG context for a question from the aliasist workers-api.
 * Freshness-aware: a fresh cache hit answers instantly; a stale-but-young hit
 * answers instantly while background revalidation refreshes the cache
 * (stale-while-revalidate); anything older, or a miss, blocks on the hub
 * under a 12s timeout. `opts.waitUntil` receives background work when the
 * caller can keep the worker alive (Pages handlers can); without it,
 * background work is best-effort. Returns a formatted context block, or null
 * if RAG is unavailable/irrelevant.
 */
export async function fetchRagContext(
  env: Env,
  question: string,
  history: Array<{ role: string; content: string }> = [],
  opts: { waitUntil?: RagWaitUntil; ecoBudgetMs?: number } = {},
): Promise<string | null> {
  // Follow-up questions often omit the topic ("what about Europe?", "and
  // tomorrow?"). Prefer the current question's topic, then inherit the most
  // recent topic from the conversation so these still reach the right corpus.
  const sist = detectSist(question) ?? [...history]
    .reverse()
    .filter((message) => message.role === "user")
    .map((message) => detectSist(message.content))
    .find((topic): topic is SistId => topic !== null);
  if (!sist) return null;

  const live = sist === "eco";
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  const cacheKey = ragCacheKey(sist, question);
  const ttlMs = (live ? RAG_CACHE_TTL_SECONDS_LIVE : RAG_CACHE_TTL_SECONDS) * 1000;
  const swrWindowMs = (live ? RAG_ECO_SWR_MAX_AGE_SECONDS : RAG_SWR_MAX_AGE_SECONDS) * 1000;
  const wait = opts.waitUntil ?? ((promise: Promise<unknown>) => {
    void promise;
  });

  if (cache) {
    const hit = await cache.match(cacheKey).catch(() => undefined);
    if (hit) {
      const age = ageMs(hit, live ? RAG_CACHE_TTL_SECONDS_LIVE : RAG_CACHE_TTL_SECONDS);
      if (age < ttlMs) return await hit.text();
      if (age <= swrWindowMs) {
        wait(fetchAndCache(env, sist, question, live, cache, cacheKey));
        return await hit.text();
      }
    }
  }

  const background = fetchAndCache(env, sist, question, live, cache, cacheKey);

  // Cold eco asks don't get to hold the reply hostage: race the hub against
  // a short budget. If the budget wins, hand the still-running fetch to
  // waitUntil (its success path seeds the cache) and answer without
  // grounding this turn.
  if (live) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const winner = await Promise.race([
        background.then(() => "fetch" as const),
        new Promise<"budget">((resolve) => {
          timer = setTimeout(() => resolve("budget"), opts.ecoBudgetMs ?? RAG_ECO_BUDGET_MS);
        }),
      ]);
      if (winner === "budget") {
        wait(background);
        return null;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  return await background;
}

// ---------------------------------------------------------------------------
// Chat providers
// ---------------------------------------------------------------------------

const DEFAULT_LLM_CHAT_BASE_URL = "https://llm-chat.bchooper0730.workers.dev";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_WORKERS_AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const BASE_SYSTEM = `You are Aliasist, the assistant built into aliasist.com, Blake's site for a growing set of free tools built to be clear, practical, and ready to use, not locked behind a sales pitch.

About Aliasist:
- Focus: data dashboards, privacy tools, file utilities, and small web apps and games
- Projects: Aliasist AI (document chat and image generation, this assistant's own home), Globalize (3D globe of data centers, subsea cables, air traffic, and seismic activity), SpaceSist (live NASA, SpaceX, ISS, and exoplanet dashboard), Aliasist Files Abductor (desktop YouTube and URL downloader), Tetra-Protocol (a story-driven cyberpunk Tetris game)
- Contact: dev@aliasist.com | github.com/aliasist
- Background: Aliasist is shaped by older web design habits and modern application work: layout, CSS, interfaces, APIs, storage, and deployment.

Your voice: direct and a little dry. Explain things plainly, skip the sales language, and don't pad an answer just to sound impressive, you'd rather undersell a project and let it speak for itself.

Your role: Help visitors understand Aliasist and its projects. Be concise and concrete. Keep responses under 3 paragraphs. Do not oversell. Do not invent project details. When someone has a project idea, suggest contacting Aliasist through the site.

When RAG context is provided below, use it as your primary source of truth. Cite it naturally, do not mention "RAG" or "corpus" to the user.`;

function buildSystem(ragContext: string | null): string {
  if (!ragContext) return BASE_SYSTEM;
  return `${BASE_SYSTEM}\n\n${ragContext}`;
}

// ---------------------------------------------------------------------------
// Message parsing
// ---------------------------------------------------------------------------

/**
 * Parse and normalize the chat history from a raw request body.
 * Returns `null` on malformed JSON so the handler can answer 400 cleanly
 * instead of throwing an unhandled 500.
 */
export function parseMessages(
  bodyText: string,
): Array<{ role: string; content: string }> | null {
  let body: { messages?: Array<{ role: string; content: string }> };
  try {
    body = JSON.parse(bodyText) as typeof body;
  } catch {
    return null;
  }
  const messages = Array.isArray(body.messages) ? body.messages : [];
  return messages
    .filter((m) => typeof m?.role === "string" && typeof m?.content === "string")
    .slice(-10)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.slice(0, 1200),
    }));
}

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

// ---------------------------------------------------------------------------
// Provider calls
// ---------------------------------------------------------------------------

async function callGroqDirect(
  apiKey: string,
  system: string,
  messages: Array<{ role: string; content: string }>,
): Promise<Response> {
  const withSystem = [
    { role: "system", content: system },
    ...messages.filter((m) => m.role !== "system"),
  ];

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: withSystem,
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    return new Response(
      JSON.stringify({ error: `Chat provider ${res.status}: ${err}` }),
      { status: 502, headers: corsHeaders },
    );
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message: string };
  };

  const reply = data.choices?.[0]?.message?.content;
  if (!reply) {
    return new Response(
      JSON.stringify({ error: "Chat provider returned an empty response." }),
      { status: 502, headers: corsHeaders },
    );
  }

  return new Response(
    JSON.stringify({ response: reply, model: GROQ_MODEL }),
    { status: 200, headers: corsHeaders },
  );
}

async function callWorkersAi(
  ai: WorkersAi,
  model: string,
  system: string,
  messages: Array<{ role: string; content: string }>,
): Promise<Response> {
  const withSystem = [
    { role: "system", content: system },
    ...messages.filter((m) => m.role !== "system"),
  ];

  const out = await ai.run(model, { messages: withSystem, max_tokens: 512 });
  const reply = typeof out?.response === "string" ? out.response.trim() : "";
  if (!reply) {
    return new Response(
      JSON.stringify({ error: "Model returned an empty response." }),
      { status: 502, headers: corsHeaders },
    );
  }

  return new Response(
    JSON.stringify({ response: reply, model }),
    { status: 200, headers: corsHeaders },
  );
}

async function responseErrorSummary(provider: string, res: Response): Promise<string> {
  const text = await res.clone().text().catch(() => "");
  if (!text) return `${provider} ${res.status}`;
  try {
    const parsed = JSON.parse(text) as { error?: string; message?: string };
    const message = parsed.error || parsed.message;
    return message ? `${provider} ${res.status}: ${message}` : `${provider} ${res.status}`;
  } catch {
    return `${provider} ${res.status}: ${text.slice(0, 240)}`;
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

const RATE_LIMIT_MAX_PER_WINDOW = 10;
const RATE_LIMIT_WINDOW_SECONDS = 60;

/**
 * Fixed-window per-IP rate limit for anonymous chat requests, backed by KV.
 * KV has no atomic increment, so under concurrent requests from the same IP
 * within the same window this can undercount slightly, that's an accepted
 * tradeoff for a lightweight abuse guard, not a precise limiter.
 *
 * Local development can omit the KV binding. Production must provide
 * CHAT_RATE_LIMIT (see wrangler.toml); KV is an approximate abuse guard.
 */
async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
  if (!env.CHAT_RATE_LIMIT) return true;
  const key = `chat-rl:${ip}`;
  const current = await env.CHAT_RATE_LIMIT.get(key);
  const count = current ? parseInt(current, 10) : 0;
  if (count >= RATE_LIMIT_MAX_PER_WINDOW) return false;
  await env.CHAT_RATE_LIMIT.put(key, String(count + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });
  return true;
}

/**
 * RAG-augmented chat endpoint.
 *
 * Flow:
 *   1. Auth check (optional, see below)
 *   2. Parse the last user message
 *   3. Detect topic → fetch RAG context from api.aliasist.tech (cached; 3.5s timeout)
 *   4. Build enriched system prompt (BASE_SYSTEM + RAG block)
 *   5. Call the configured chat providers in order of preference
 *
 * Request:  POST /api/chat  { messages: [{role, content}, ...] }
 * Response: { response: string, model: string } | { error: string }
 */
export const onRequestPost = async ({ request, env }: PagesContext) => {
  // --- Auth (optional) ---
  // Chat is open to the public. A signed-in request is still verified (so a
  // forged/expired token is rejected), but signing in is no longer required
  // to use the chat at all, anonymous requests are rate-limited instead,
  // below, so the endpoint isn't a free unlimited proxy to Groq/Workers AI.
  const authorization = request.headers.get("Authorization");
  const hasSessionToken = Boolean(authorization?.startsWith("Bearer "));
  if (hasSessionToken) {
    const auth = await authenticateRequest(request.clone(), env);
    if (!auth.ok) {
      return json({ error: auth.error }, auth.status);
    }
  } else {
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const allowed = await checkRateLimit(env, ip);
    if (!allowed) {
      return json(
        { error: "You're sending messages too quickly. Please wait a minute and try again." },
        429,
      );
    }
  }

  const bodyText = await request.text();
  if (!bodyText.trim()) {
    return json({ error: "Missing request body." }, 400);
  }

  // --- Parse messages & detect topic ---
  const messages = parseMessages(bodyText);
  if (!messages) {
    return json({ error: "That request wasn't valid. Send JSON like { messages: [...] }." }, 400);
  }
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // --- RAG fetch (blocking, cached; 12s upstream timeout) ---
  const ragContext = await fetchRagContext(env, lastUserMsg, messages);
  const system = buildSystem(ragContext);
  const providerErrors: string[] = [];

  // --- Primary edge model ---
  if (env.AI) {
    try {
      const model = env.AI_MODEL?.trim() || DEFAULT_WORKERS_AI_MODEL;
      const res = await callWorkersAi(env.AI, model, system, messages);
      if (res.ok) return res;
      providerErrors.push(await responseErrorSummary("Primary chat provider", res));
    } catch (e) {
      providerErrors.push(`Primary chat provider: ${e instanceof Error ? e.message : "Chat error."}`);
    }
  }

  // --- Backup chat provider ---
  const groqKey = env.GROQ_API_KEY?.trim();
  if (groqKey) {
    try {
      const res = await callGroqDirect(groqKey, system, messages);
      if (res.ok) return res;
      providerErrors.push(await responseErrorSummary("Backup chat provider", res));
    } catch (e) {
      providerErrors.push(`Backup chat provider: ${e instanceof Error ? e.message : "Chat error."}`);
    }
  }

  // --- Fallback: proxy to llm-chat worker ---
  const base = trimTrailingSlashes(env.LLM_CHAT_BASE_URL?.trim() || DEFAULT_LLM_CHAT_BASE_URL);
  const upstreamUrl = `${base}/api/chat`;

  try {
    const authHeader = request.headers.get("Authorization");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authHeader) headers.Authorization = authHeader;

    // Rebuild body with enriched system injected as first message
    const enrichedBody = JSON.stringify({
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
    });

    const upstreamRes = await fetch(upstreamUrl, { method: "POST", headers, body: enrichedBody });
    const text = await upstreamRes.text();
    return new Response(text, { status: upstreamRes.status, headers: corsHeaders });
  } catch (e) {
    return json(
      {
        error: "Upstream chat error.",
        message: e instanceof Error ? e.message : String(e),
      },
      502,
    );
  }
};

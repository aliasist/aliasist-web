import type { ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json } from "../_lib/clerk-auth";

/** Minimal shape of the Cloudflare Workers AI binding (avoids a workers-types dep). */
interface WorkersAi {
  run(
    model: string,
    inputs: Record<string, unknown>,
  ): Promise<{ response?: string } & Record<string, unknown>>;
}

interface Env extends ClerkEnv {
  AI?: WorkersAi;
  /** Override the Workers AI text model. Default: @cf/meta/llama-3.1-8b-instruct */
  AI_MODEL?: string;
  /** Groq API key — used for LLM generation. */
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

/** Valid sist IDs on the RAG worker. */
const SIST_IDS = ["agsc", "data", "eco", "pulse", "space"] as const;
type SistId = (typeof SIST_IDS)[number];

/** Shape returned by POST /rag/ask */
interface RagAskResult {
  answer: string;
  model: string;
  source: string;
  latencyMs: number;
  chunks: Array<{ id: string; source: string; score: number; text: string }>;
  sist: SistId;
  /**
   * Raw live-data snapshot (eco: active alerts/quakes/events/storms/Kp).
   * Present whenever `live: { includeDataSnapshot: true }` was requested,
   * independent of whether the RAG worker's own LLM providers were up —
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
  if (/\b(agsc|globe|countr(y|ies)|data.?center.?maps?|undersea.?cables?|internet.?exchanges?|submarine.?cables?)\b/.test(t)) return "agsc";
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
 * `data.liveContext` (eco only) is independent of both modes — it's the raw
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
function ragCacheKey(sist: SistId, question: string): Request {
  const norm = question.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 256);
  const key = `https://rag-cache.aliasist.internal/${sist}/${encodeURIComponent(norm)}`;
  return new Request(key, { method: "GET" });
}

/** TTL for cached RAG context blocks (seconds). Repeated questions answer instantly. */
const RAG_CACHE_TTL_SECONDS = 3600;

/**
 * `eco` questions are grounded against live conditions (active alerts,
 * earthquakes, storms, Kp), not just the static reference corpus — those
 * change minute to minute, so a 1-hour cache would answer "what's happening
 * right now" with stale data. Match the eco route's own edge-cache cadence.
 */
const RAG_CACHE_TTL_SECONDS_LIVE = 60;

/**
 * Fetch grounded RAG context for a question from the aliasist workers-api.
 * Blocking by design — the LLM system prompt depends on the result — but cached
 * via the Cloudflare Cache API so repeated questions skip the upstream round-trip.
 * Returns a formatted context block, or null if RAG is unavailable/irrelevant.
 */
export async function fetchRagContext(
  env: Env,
  question: string,
): Promise<string | null> {
  const sist = detectSist(question);
  if (!sist) return null;

  const live = sist === "eco";
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  const cacheKey = ragCacheKey(sist, question);

  if (cache) {
    const hit = await cache.match(cacheKey).catch(() => undefined);
    if (hit) return await hit.text();
  }

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
      // generation) routinely exceed the old 3.5s budget, which silently
      // dropped RAG context and produced generic persona answers.
      signal: AbortSignal.timeout(12_000),
    });
    if (res.ok) {
      const data = await res.json() as RagAskResult;
      context = formatRagContext(sist, data);
    }
  } catch {
    context = null;
  }

  // Cache only successful lookups — never poison results during a transient
  // upstream outage by caching a miss.
  if (cache && context) {
    await cache
      .put(
        cacheKey,
        new Response(context, {
          headers: { "Cache-Control": `max-age=${live ? RAG_CACHE_TTL_SECONDS_LIVE : RAG_CACHE_TTL_SECONDS}` },
        }),
      )
      .catch(() => {});
  }

  return context;
}

// ---------------------------------------------------------------------------
// LLM providers
// ---------------------------------------------------------------------------

const DEFAULT_LLM_CHAT_BASE_URL = "https://llm-chat.bchooper0730.workers.dev";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_WORKERS_AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const BASE_SYSTEM = `You are the Aliasist AI — the intelligent assistant embedded in aliasist.com, the developer portfolio and project hub of Blake, an AI security developer and CS student.

About Aliasist:
- Focus: practical AI consulting, developer portfolio work, AI-assisted workflows, AI security, and useful software builds
- Suite: DataSist (AI data center intelligence), PulseSist (stock market intelligence), SpaceSist (live space portal), EcoSist (environmental intelligence), AGSC (global source control globe), Clearasist (metadata cleaner), GitHub Companion (repository and pull request guidance)
- Stack: Python, JavaScript, React, Vite, Cloudflare Workers, D1, Groq, Anthropic
- Contact: dev@aliasist.com | github.com/aliasist
- Blake is self-taught, now formally studying Computer Information Systems, building toward AI security specialization

Your role: Help visitors understand Blake's AI consulting work, projects, and technical direction. Be concise, direct, and practical. Keep responses under 3 paragraphs. Do not oversell. Do not hallucinate project details. When someone has a project idea, suggest contacting Blake through the site.

When RAG context is provided below, use it as your primary source of truth. Cite it naturally — do not mention "RAG" or "corpus" to the user.`;

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
      JSON.stringify({ error: `Groq ${res.status}: ${err}` }),
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
      JSON.stringify({ error: "Groq returned an empty response." }),
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

/**
 * RAG-augmented chat endpoint.
 *
 * Flow:
 *   1. Auth check (Clerk JWT or public-chat gate)
 *   2. Parse the last user message
 *   3. Detect topic → fetch RAG context from api.aliasist.tech (cached; 3.5s timeout)
 *   4. Build enriched system prompt (BASE_SYSTEM + RAG block)
 *   5. Call Workers AI → Groq → llm-chat worker proxy (in order of preference)
 *
 * Request:  POST /api/chat  { messages: [{role, content}, ...] }
 * Response: { response: string, model: string } | { error: string }
 */
export const onRequestPost = async ({ request, env }: PagesContext) => {
  const bodyText = await request.text();
  if (!bodyText.trim()) {
    return json({ error: "Missing request body." }, 400);
  }

  // --- Auth ---
  const authorization = request.headers.get("Authorization");
  const hasSessionToken = Boolean(authorization?.startsWith("Bearer "));
  if (hasSessionToken) {
    const auth = await authenticateRequest(request, env);
    if (!auth.ok) {
      return json({ error: auth.error }, auth.status);
    }
  } else {
    return json({ error: "Sign in to use chat." }, 401);
  }

  // --- Parse messages & detect topic ---
  const messages = parseMessages(bodyText);
  if (!messages) {
    return json({ error: "Malformed request body — expected JSON { messages: [...] }." }, 400);
  }
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // --- RAG fetch (blocking, cached; 3.5s upstream timeout) ---
  const ragContext = await fetchRagContext(env, lastUserMsg);
  const system = buildSystem(ragContext);
  const providerErrors: string[] = [];

  // --- Workers AI (preferred — free edge LLM) ---
  if (env.AI) {
    try {
      const model = env.AI_MODEL?.trim() || DEFAULT_WORKERS_AI_MODEL;
      const res = await callWorkersAi(env.AI, model, system, messages);
      if (res.ok) return res;
      providerErrors.push(await responseErrorSummary("Workers AI", res));
    } catch (e) {
      providerErrors.push(`Workers AI: ${e instanceof Error ? e.message : "Chat error."}`);
    }
  }

  // --- Groq (secondary — requires GROQ_API_KEY) ---
  const groqKey = env.GROQ_API_KEY?.trim();
  if (groqKey) {
    try {
      const res = await callGroqDirect(groqKey, system, messages);
      if (res.ok) return res;
      providerErrors.push(await responseErrorSummary("Groq", res));
    } catch (e) {
      providerErrors.push(`Groq: ${e instanceof Error ? e.message : "Chat error."}`);
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
        providerErrors,
      },
      502,
    );
  }
};

/**
 * DataSist RAG Worker
 * Cloudflare-native retrieval-augmented generation for data center intelligence.
 *
 * POST /api/v1/query  — embed question → vector search → LLM with context → { answer, citations }
 * POST /api/v1/seed   — read D1 facilities → embed → upsert Vectorize (admin, RAG_SECRET required)
 * GET  /api/v1/health — index stats
 */

const GEN_MODEL        = "gemini-2.0-flash-lite";
const GEMINI_GEN_URL   = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";
const EMBED_BATCH = 25; // facilities per embedding batch (Gemini batch limit: 100)

// gemini-embedding-2 — free tier, truncated to 768-dim to match Vectorize index
const GEMINI_EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent";

export interface Env {
  AI: Ai;
  VECTORIZE: VectorizeIndex;
  DB: D1Database;
  GEMINI_API_KEY: string;    // set via: wrangler secret put GEMINI_API_KEY
  RAG_SECRET?: string;       // set via: wrangler secret put RAG_SECRET
  GROQ_API_KEY?: string;     // optional higher-quality generation fallback
  ALLOWED_ORIGIN?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function cors(origin?: string): Record<string, string> {
  const allowed = origin ?? "https://data.aliasist.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function isAuthorized(request: Request, env: Env): boolean {
  if (!env.RAG_SECRET) return true; // open if no secret configured
  const auth = request.headers.get("Authorization") ?? "";
  return auth === `Bearer ${env.RAG_SECRET}`;
}

// ── Facility → text chunk ─────────────────────────────────────────────────────

interface Facility {
  id: number;
  name: string;
  company: string;
  company_type: string;
  city: string;
  state: string;
  country: string;
  status: string;
  capacity_mw: number | null;
  estimated_annual_gwh: number | null;
  water_usage_million_gallons: number | null;
  renewable_percent: number | null;
  grid_risk: string | null;
  community_resistance: number | null;
  investment_billions: number | null;
  primary_models: string | null;
  community_impact: string | null;
  notes: string | null;
  year_opened: number | null;
  year_planned: number | null;
  acreage: number | null;
}

function facilityToText(f: Facility): string {
  const lines: string[] = [
    `Facility: ${f.name}`,
    `Company: ${f.company} (${f.company_type})`,
    `Location: ${f.city}, ${f.state}, ${f.country}`,
    `Status: ${f.status}`,
  ];

  if (f.capacity_mw != null)              lines.push(`Capacity: ${f.capacity_mw} MW`);
  if (f.estimated_annual_gwh != null)     lines.push(`Annual Energy: ${f.estimated_annual_gwh} GWh`);
  if (f.renewable_percent != null)        lines.push(`Renewable Energy: ${f.renewable_percent}%`);
  if (f.grid_risk)                        lines.push(`Grid Risk: ${f.grid_risk}`);
  if (f.community_resistance != null)     lines.push(`Community Resistance: ${f.community_resistance ? "Yes" : "No"}`);
  if (f.investment_billions != null)      lines.push(`Investment: $${f.investment_billions}B`);
  if (f.water_usage_million_gallons != null) lines.push(`Water Usage: ${f.water_usage_million_gallons}M gallons/year`);
  if (f.acreage != null)                  lines.push(`Acreage: ${f.acreage} acres`);
  if (f.year_opened != null)              lines.push(`Opened: ${f.year_opened}`);
  if (f.year_planned != null)             lines.push(`Planned Opening: ${f.year_planned}`);
  if (f.primary_models)                   lines.push(`AI Models Hosted: ${f.primary_models}`);
  if (f.community_impact)                 lines.push(`Community Impact: ${f.community_impact}`);
  if (f.notes)                            lines.push(`Notes: ${f.notes}`);

  return lines.join("\n");
}

// ── Embedding (gemini-embedding-2, free tier, 768-dim output) ─────────────────

async function embedOne(geminiKey: string, text: string): Promise<number[]> {
  const res = await fetch(`${GEMINI_EMBED_URL}?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini embed ${res.status}: ${err}`);
  }

  const data = await res.json() as { embedding?: { values: number[] } };
  if (!data.embedding?.values?.length) throw new Error("Gemini returned empty embedding");
  return data.embedding.values;
}

async function embed(geminiKey: string, texts: string[]): Promise<number[][]> {
  // Fire all requests in the batch concurrently
  return Promise.all(texts.map((t) => embedOne(geminiKey, t)));
}

// ── Generation ────────────────────────────────────────────────────────────────

async function generate(
  geminiKey: string,
  groqKey: string | undefined,
  systemPrompt: string,
  userQuestion: string,
): Promise<string> {
  // Try Groq first if available (fastest, highest quality)
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuestion },
          ],
          max_tokens: 768,
          temperature: 0.3,
        }),
      });
      if (res.ok) {
        const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch { /* fall through to Gemini */ }
  }

  // Gemini generation (free tier — 1,500 RPD, separate quota from embeddings)
  const res = await fetch(`${GEMINI_GEN_URL}?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userQuestion }] }],
      generationConfig: { maxOutputTokens: 768, temperature: 0.3 },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini generate ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Unable to generate a response.";
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleQuery(request: Request, env: Env, corsH: Record<string, string>): Promise<Response> {
  const body = await request.json() as {
    question?: string;
    topK?: number;
    sourceType?: string;
  };

  const question = body.question?.trim();
  if (!question) return json({ error: "question is required" }, 400, corsH);

  const topK = Math.min(Math.max(Number.isInteger(body.topK) ? body.topK! : 5, 1), 15);

  // Embed the question
  let qVec: number[];
  try {
    [qVec] = await embed(env.GEMINI_API_KEY, [question]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED");
    return json(
      { error: isQuota ? "Embedding quota exhausted — try again later." : `Embedding failed: ${msg}` },
      isQuota ? 503 : 502,
      corsH,
    );
  }

  // Search Vectorize
  const matches = await env.VECTORIZE.query(qVec, {
    topK,
    returnMetadata: "all",
  });

  if (!matches.matches?.length) {
    return json({
      answer: "No relevant facility data found for that question.",
      citations: [],
      model: GEN_MODEL,
    }, 200, corsH);
  }

  // Build context from retrieved chunks
  const citations: Array<{ id: number; name: string; company: string; score: number }> = [];
  const contextLines: string[] = [];

  for (const match of matches.matches) {
    const meta = match.metadata as Record<string, unknown> | undefined;
    if (!meta) continue;

    citations.push({
      id: Number(meta.facilityId),
      name: String(meta.name ?? ""),
      company: String(meta.company ?? ""),
      score: Math.round(match.score * 100) / 100,
    });

    contextLines.push(`--- ${meta.name} (${meta.company}, ${meta.location}) ---\n${meta.text}`);
  }

  const context = contextLines.join("\n\n");

  const systemPrompt = `You are DataSist AI — an expert on AI data center infrastructure, power consumption, environmental impact, and community effects.

You have been given retrieved intelligence data from the DataSist database. Use ONLY the provided context to answer questions. Be specific, cite facility names, and include numbers when available. If the context does not contain enough information to answer fully, say so.

Context:
${context}`;

  const answer = await generate(env.GEMINI_API_KEY, env.GROQ_API_KEY, systemPrompt, question);

  return json({ answer, citations, model: GEN_MODEL }, 200, corsH);
}

async function handleSeed(request: Request, env: Env, corsH: Record<string, string>): Promise<Response> {
  if (!isAuthorized(request, env)) {
    return json({ error: "Unauthorized" }, 401, corsH);
  }

  const body = await request.json().catch(() => ({})) as { offset?: number };
  const offset = Number.isInteger(body.offset) ? body.offset! : 0;

  // Load one batch starting at offset — keeps subrequests well under the free limit
  const { results: facilities } = await env.DB.prepare(
    `SELECT id, name, company, company_type, city, state, country, status,
            capacity_mw, estimated_annual_gwh, water_usage_million_gallons,
            renewable_percent, grid_risk, community_resistance, investment_billions,
            primary_models, community_impact, notes, year_opened, year_planned, acreage
     FROM data_centers
     ORDER BY id
     LIMIT ? OFFSET ?`
  ).bind(EMBED_BATCH, offset).all<Facility>();

  const { results: countRow } = await env.DB.prepare(
    `SELECT COUNT(*) as n FROM data_centers`
  ).all<{ n: number }>();
  const total = countRow?.[0]?.n ?? 0;

  if (!facilities?.length) {
    return json({ seeded: 0, total, offset, done: true }, 200, corsH);
  }

  const texts = facilities.map(facilityToText);

  try {
    const vectors = await embed(env.GEMINI_API_KEY, texts);

    const upsertVectors: VectorizeVector[] = facilities.map((f, idx) => ({
      id: String(f.id),
      values: vectors[idx],
      metadata: {
        facilityId: f.id,
        name: f.name,
        company: f.company,
        location: `${f.city}, ${f.state}, ${f.country}`,
        status: f.status,
        text: texts[idx],
      },
    }));

    await env.VECTORIZE.upsert(upsertVectors);

    const nextOffset = offset + facilities.length;
    return json({
      seeded: facilities.length,
      total,
      offset,
      nextOffset,
      done: nextOffset >= total,
    }, 200, corsH);

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg, offset }, 500, corsH);
  }
}

async function handleHealth(env: Env, corsH: Record<string, string>): Promise<Response> {
  try {
    const info = await env.VECTORIZE.describe();
    return json({
      status: "ok",
      index: "datasist-facilities",
      vectorCount: (info as any).vectorCount ?? "unknown",
      dimensions: 768,
      embedModel: "gemini-embedding-2",
      genModel: GEN_MODEL,
    }, 200, corsH);
  } catch (err) {
    return json({ status: "error", error: String(err) }, 500, corsH);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsH = cors(env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsH });
    }

    if (url.pathname === "/api/v1/query" && request.method === "POST") {
      return handleQuery(request, env, corsH);
    }

    if (url.pathname === "/api/v1/seed" && request.method === "POST") {
      return handleSeed(request, env, corsH);
    }

    if (url.pathname === "/api/v1/health" && request.method === "GET") {
      return handleHealth(env, corsH);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

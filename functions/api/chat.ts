import type { ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json } from "../_lib/clerk-auth";

interface Env extends ClerkEnv {
  /**
   * Groq API key — if set, the Pages Function calls Groq directly (no worker hop).
   * Add via: Cloudflare Pages → Settings → Environment variables → GROQ_API_KEY
   */
  GROQ_API_KEY?: string;
  /**
   * Fallback: proxy to upstream LLM worker. Only used when GROQ_API_KEY is absent.
   * Defaults to the production llm-chat worker URL.
   */
  LLM_CHAT_BASE_URL?: string;
  /**
   * Set to "true" to let unsigned visitors use the homepage AI demo.
   * Signed-in users can still use the authenticated path.
   */
  PUBLIC_CHAT_ENABLED?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

const DEFAULT_LLM_CHAT_BASE_URL = "https://llm-chat.bchooper0730.workers.dev";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const ALIASIST_SYSTEM = `You are the Aliasist AI — the intelligent assistant embedded in aliasist.com, the developer portfolio and project hub of Blake, an AI security developer and CS student.

About Aliasist:
- Focus: practical AI consulting, developer portfolio work, AI-assisted workflows, AI security, and useful software builds
- Suite: DataSist (AI data center intelligence), PulseSist (stock market intelligence), SpaceSist (live space portal), Clearasist (metadata cleaner), GitHub Companion (repository and pull request guidance), Aliasist-Files-Abductor (file automation GUI)
- Stack: Python, JavaScript, React, Vite, Cloudflare Workers, D1, Groq, Anthropic
- Contact: dev@aliasist.com | github.com/aliasist
- Blake is self-taught, now formally studying Computer Information Systems, building toward AI security specialization

Your role: Help visitors understand Blake's AI consulting work, projects, and technical direction. Be concise, direct, and practical. Keep responses under 3 paragraphs. Do not oversell. Do not hallucinate project details. When someone has a project idea, suggest contacting Blake through the site.`;

const publicChatBuckets = new Map<string, { count: number; windowStart: number }>();
const PUBLIC_CHAT_WINDOW_MS = 60_000;
const PUBLIC_CHAT_LIMIT = 6;

function isPublicChatEnabled(env: Env): boolean {
  return env.PUBLIC_CHAT_ENABLED?.trim().toLowerCase() === "true";
}

function clientKey(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? request.headers.get("x-forwarded-for") ?? "unknown";
}

function checkPublicChatLimit(request: Request): boolean {
  const now = Date.now();
  const key = clientKey(request);
  const current = publicChatBuckets.get(key);
  if (!current || now - current.windowStart > PUBLIC_CHAT_WINDOW_MS) {
    publicChatBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (current.count >= PUBLIC_CHAT_LIMIT) return false;
  current.count += 1;
  return true;
}

function parseMessages(bodyText: string): Array<{ role: string; content: string }> {
  const body = JSON.parse(bodyText) as { messages?: Array<{ role: string; content: string }> };
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

async function callGroqDirect(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
): Promise<Response> {
  const withSystem = [
    { role: "system", content: ALIASIST_SYSTEM },
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

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

/**
 * Clerk-authenticated chat endpoint.
 * If GROQ_API_KEY is set on this Pages deployment, calls Groq directly (single auth hop).
 * Otherwise falls back to proxying the llm-chat worker (legacy path).
 *
 * Request:  POST /api/chat  { messages: [{role, content}, ...] }
 * Response: { response: string, model: string } | { error: string }
 */
export const onRequestPost = async ({ request, env }: PagesContext) => {
  const bodyText = await request.text();
  if (!bodyText.trim()) {
    return json({ error: "Missing request body." }, 400);
  }

  const authorization = request.headers.get("Authorization");
  const hasSessionToken = Boolean(authorization?.startsWith("Bearer "));
  if (hasSessionToken) {
    const auth = await authenticateRequest(request, env);
    if (!auth.ok) {
      return json({ error: auth.error }, auth.status);
    }
  } else if (!isPublicChatEnabled(env)) {
    return json(
      { error: "Public chat is not enabled. Set PUBLIC_CHAT_ENABLED=true and GROQ_API_KEY on the Pages deployment." },
      403,
    );
  } else if (!checkPublicChatLimit(request)) {
    return json({ error: "Too many chat messages. Try again in a minute." }, 429);
  }

  // Direct Groq path — no worker hop, no second auth layer
  const groqKey = env.GROQ_API_KEY?.trim();
  if (groqKey) {
    try {
      return await callGroqDirect(groqKey, parseMessages(bodyText));
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "Chat error." }, 500);
    }
  }

  // Fallback: proxy to llm-chat worker. It has its own GROQ_API_KEY and, when
  // PUBLIC_CHAT_ENABLED is set there too, accepts anonymous (rate-limited) requests —
  // so unsigned visitors aren't dead-ended just because this Pages deployment lacks a key.
  const base = trimTrailingSlashes(env.LLM_CHAT_BASE_URL?.trim() || DEFAULT_LLM_CHAT_BASE_URL);
  const upstreamUrl = `${base}/api/chat`;

  try {
    const authHeader = request.headers.get("Authorization");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authHeader) headers.Authorization = authHeader;

    const upstreamRes = await fetch(upstreamUrl, { method: "POST", headers, body: bodyText });
    const text = await upstreamRes.text();
    return new Response(text, { status: upstreamRes.status, headers: corsHeaders });
  } catch (e) {
    return json(
      { error: "Upstream chat error.", message: e instanceof Error ? e.message : String(e) },
      502,
    );
  }
};

import { corsHeaders, json } from "../_lib/clerk-auth";
import { checkRateLimit, clientIp, rateLimitNamespace, type RateLimitEnv } from "../_lib/rate-limit";

interface Env extends RateLimitEnv {
  /**
   * Upstream LLM worker base URL (no trailing slash).
   * Example: https://llm-chat.example.workers.dev
   */
  LLM_CHAT_BASE_URL?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

const DEFAULT_LLM_CHAT_BASE_URL = "https://llm-chat.bchooper0730.workers.dev";

/**
 * The upstream worker meters this route, so an unthrottled proxy here is a
 * direct path from bot traffic to a bill. Five messages per ten minutes is far
 * more than a human composing a contact form needs and far less than a bot
 * wants.
 */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 600;

/**
 * Contact messages are a few sentences. Anything larger is a bot or a pasted
 * binary, and forwarding it would spend upstream tokens on nothing.
 */
const MAX_BODY_BYTES = 8 * 1024;

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: corsHeaders,
  });

/**
 * Same-origin proxy for the contact form.
 * Avoids browser CORS failures when calling the upstream Worker directly.
 *
 * Request:  POST /api/contact  { name, email, message }
 * Response: passthrough JSON from the upstream worker (e.g. { ok: true } | { error }).
 */
export const onRequestPost = async ({ request, env }: PagesContext) => {
  const allowed = await checkRateLimit(rateLimitNamespace(env), clientIp(request), {
    bucket: "contact-rl",
    max: RATE_LIMIT_MAX,
    windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
  });
  if (!allowed) {
    return json(
      { ok: false, error: "Too many messages from this address. Try again in a few minutes." },
      429,
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "That message is too long." }, 413);
  }

  const bodyText = await request.text();
  if (!bodyText.trim()) {
    return json({ ok: false, error: "Missing request body." }, 400);
  }

  // Reject malformed payloads here rather than paying the upstream to reject
  // them. Cheap parse, and it keeps non-JSON probes away from the metered
  // worker entirely.
  if (bodyText.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "That message is too long." }, 413);
  }

  try {
    const parsed: unknown = JSON.parse(bodyText);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json({ ok: false, error: "Expected a JSON object." }, 400);
    }
  } catch {
    return json({ ok: false, error: "Expected a JSON object." }, 400);
  }

  const base = trimTrailingSlashes(env.LLM_CHAT_BASE_URL?.trim() || DEFAULT_LLM_CHAT_BASE_URL);
  const upstreamUrl = `${base}/api/contact`;

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyText,
    });

    const text = await upstreamRes.text();
    return new Response(text, {
      status: upstreamRes.status,
      headers: corsHeaders,
    });
  } catch (e) {
    return json(
      {
        ok: false,
        error: "Couldn't send that right now. Email me at dev@aliasist.com instead.",
        message: e instanceof Error ? e.message : String(e),
      },
      502,
    );
  }
};


import { corsHeaders, json } from "../_lib/clerk-auth";

interface Env {
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

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: corsHeaders,
  });

/**
 * Same-origin proxy for the homepage email signup form.
 * Avoids browser CORS failures when calling the upstream Worker directly.
 *
 * Request:  POST /api/subscribe  { email }
 * Response: passthrough JSON from the upstream worker (e.g. { ok: true } | { error }).
 */
export const onRequestPost = async ({ request, env }: PagesContext) => {
  const bodyText = await request.text();
  if (!bodyText.trim()) {
    return json({ ok: false, error: "Missing request body." }, 400);
  }

  const base = trimTrailingSlashes(env.LLM_CHAT_BASE_URL?.trim() || DEFAULT_LLM_CHAT_BASE_URL);
  const upstreamUrl = `${base}/api/subscribe`;

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
        error: "Upstream subscribe error.",
        message: e instanceof Error ? e.message : String(e),
      },
      502,
    );
  }
};

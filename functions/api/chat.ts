import type { ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json } from "../_lib/clerk-auth";

interface Env extends ClerkEnv {
  /**
   * Upstream LLM chat worker base URL (no trailing slash).
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
 * Clerk-authenticated proxy to the upstream LLM worker.
 * Guests must sign in (valid Clerk session JWT) before they can invoke the model.
 *
 * Request:  POST /api/chat  { messages: [{role, content}, ...] }
 * Response: passthrough JSON from the upstream worker (e.g. { response } | { error }).
 */
export const onRequestPost = async ({ request, env }: PagesContext) => {
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status);
  }

  const bodyText = await request.text();
  if (!bodyText.trim()) {
    return json({ error: "Missing request body." }, 400);
  }

  const base = trimTrailingSlashes(env.LLM_CHAT_BASE_URL?.trim() || DEFAULT_LLM_CHAT_BASE_URL);
  const upstreamUrl = `${base}/api/chat`;

  try {
    const authHeader = request.headers.get("Authorization");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers,
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
        error: "Upstream chat error.",
        message: e instanceof Error ? e.message : String(e),
      },
      502,
    );
  }
};

import type { AliasistAdminEnv, ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json, requireAliasistAdmin } from "../_lib/clerk-auth";

/**
 * Proxies device-control commands to the llm-chat Worker's /api/command
 * route. Exists so the browser never needs the Worker's DEVICE_API_KEY
 * (which authorizes hardware — relays, etc.) — that secret stays server-side
 * here, and only a signed-in, allowlisted admin can reach this route at all.
 */
interface Env extends ClerkEnv, AliasistAdminEnv {
  LLM_CHAT_BASE_URL?: string;
  DEVICE_API_KEY?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

const DEFAULT_HUB_URL = "https://llm-chat.bchooper0730.workers.dev";

export const onRequestOptions = async () => new Response(null, { status: 204, headers: corsHeaders });

export const onRequestPost = async ({ request, env }: PagesContext) => {
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);

  const admin = requireAliasistAdmin(auth.userId, env);
  if (!admin.ok) return json({ error: admin.error }, admin.status);

  const deviceKey = env.DEVICE_API_KEY?.trim();
  if (!deviceKey) return json({ error: "not_configured", hint: "Set DEVICE_API_KEY in Pages secrets." }, 503);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return json({ error: "Expected a JSON request body." }, 400);

  const { deviceId, command, payload } = body as { deviceId?: string; command?: string; payload?: unknown };
  if (!deviceId?.trim() || !command?.trim()) {
    return json({ error: "deviceId and command are required" }, 400);
  }

  const hubUrl = (env.LLM_CHAT_BASE_URL || DEFAULT_HUB_URL).replace(/\/$/, "");

  const hubResponse = await fetch(`${hubUrl}/api/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Key": deviceKey,
    },
    body: JSON.stringify({ deviceId, command, payload }),
  });

  const responseBody = await hubResponse.json().catch(() => ({ error: "Invalid response from device hub." }));
  return json(responseBody as Record<string, unknown>, hubResponse.status);
};

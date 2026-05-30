import type { ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json } from "../_lib/clerk-auth";

const AGENT_CHAT_URL = "https://aliasist-chat.bchooper0730.workers.dev/api/agent/snapshots";

interface Env extends ClerkEnv {
  AGENT_PUSH_SECRET?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

/**
 * GET /api/agent-status
 * Returns the latest snapshot per project pushed by aliasist-agent.
 * Requires a valid Clerk session token — proxies to aliasist-chat Worker.
 */
export const onRequestGet = async ({ request, env }: PagesContext) => {
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status);
  }

  const secret = env.AGENT_PUSH_SECRET;
  if (!secret) {
    return json({ error: "Agent not configured." }, 503);
  }

  try {
    const upstream = await fetch(AGENT_CHAT_URL, {
      headers: { "X-Agent-Secret": secret },
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return json({ error: `Upstream error: ${upstream.status} ${text.slice(0, 200)}` }, 502);
    }

    const data = await upstream.json() as { snapshots?: unknown[] };

    // Normalise DO snapshot shape → frontend Snapshot shape
    const snapshots = (data.snapshots ?? []).map((row: any) => ({
      project: row.project,
      branch: row.branch ?? null,
      dirty: row.dirty === 1 || row.dirty === true,
      framework: row.framework ?? null,
      riskLevel: row.risk_level ?? row.riskLevel ?? null,
      warnings: row.warnings ?? 0,
      pushedAt: row.pushed_at ? new Date(row.pushed_at).getTime() : Date.now(),
    }));

    // Latest snapshot per project
    const latest = new Map<string, typeof snapshots[number]>();
    for (const snap of snapshots) {
      const existing = latest.get(snap.project);
      if (!existing || snap.pushedAt > existing.pushedAt) {
        latest.set(snap.project, snap);
      }
    }

    return json({ snapshots: [...latest.values()].sort((a, b) => b.pushedAt - a.pushedAt) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: `Failed to fetch snapshots: ${msg}` }, 500);
  }
};

import type { ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json } from "../_lib/clerk-auth";

interface Env extends ClerkEnv {
  ANALYTICS?: D1Database;
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
 * Requires a valid Clerk session token.
 */
export const onRequestGet = async ({ request, env }: PagesContext) => {
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status);
  }

  if (!env.ANALYTICS) {
    return json({ error: "Analytics DB not configured." }, 503);
  }

  try {
    const result = await env.ANALYTICS.prepare(
      `SELECT project, branch, dirty, framework, risk_level, warnings, raw_json, pushed_at
       FROM agent_snapshots
       WHERE id IN (
         SELECT id FROM agent_snapshots s2
         WHERE s2.project = agent_snapshots.project
         ORDER BY pushed_at DESC
         LIMIT 1
       )
       ORDER BY pushed_at DESC`
    ).all<{
      project: string;
      branch: string | null;
      dirty: number;
      framework: string | null;
      risk_level: string | null;
      warnings: number;
      raw_json: string | null;
      pushed_at: number;
    }>();

    const snapshots = (result.results ?? []).map((row) => ({
      project: row.project,
      branch: row.branch,
      dirty: row.dirty === 1,
      framework: row.framework,
      riskLevel: row.risk_level,
      warnings: row.warnings,
      pushedAt: row.pushed_at,
    }));

    return json({ snapshots });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: `DB error: ${msg}` }, 500);
  }
};

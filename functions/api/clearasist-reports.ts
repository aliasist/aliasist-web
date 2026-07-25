import type { AliasistAdminEnv, ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json, requireAliasistAdmin } from "../_lib/clerk-auth";

interface Env extends ClerkEnv, AliasistAdminEnv {
  CLEARASIST_ADMIN_SECRET?: string;
  CLEARASIST_METADATA_WORKER_URL?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

type ClearasistReport = {
  id: number;
  timestamp: string;
  filename: string | null;
  file_type: string | null;
  extension: string | null;
  original_size: number | null;
  cleaned_size: number | null;
  removed_count: number | null;
  partials?: string | null;
};

type ClearasistResponse = {
  reports?: ClearasistReport[];
  total?: number;
};

const DEFAULT_CLEARASIST_WORKER_URL = "https://clearasist-metadata.bchooper0730.workers.dev";
const PAGE_SIZE = 200;
const MAX_REPORTS = 1000;

function trimTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

/**
 * Signed-in proxy for Clearasist admin data.
 * Supports GET (list) and PATCH (update tags/notes on a report).
 */
export const onRequestGet = async ({ request, env }: PagesContext) => {
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status);
  }

  const admin = requireAliasistAdmin(auth.userId, env);
  if (!admin.ok) {
    return json({ error: admin.error }, admin.status);
  }

  const adminSecret = env.CLEARASIST_ADMIN_SECRET?.trim();
  if (!adminSecret) {
    return json({ error: "Clearasist metadata worker not connected (missing CLEARASIST_ADMIN_SECRET env)." }, 503);
  }

  const base = trimTrailingSlashes(
    env.CLEARASIST_METADATA_WORKER_URL?.trim() || DEFAULT_CLEARASIST_WORKER_URL,
  );

  try {
    const reports: ClearasistReport[] = [];
    let total = 0;

    do {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(reports.length),
        sort: "timestamp_desc",
      });
      const upstream = await fetch(`${base}/admin/reports?${params}`, {
        headers: { Authorization: `Bearer ${adminSecret}` },
      });

      if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        return json({ error: `Clearasist upstream error: ${upstream.status} ${text}`.trim() }, 502);
      }

      const data = (await upstream.json()) as ClearasistResponse;
      const page = data.reports ?? [];
      total = data.total ?? page.length;
      reports.push(...page);

      if (page.length < PAGE_SIZE) break;
    } while (reports.length < Math.min(total, MAX_REPORTS));

    return json({
      reports: reports.slice(0, MAX_REPORTS),
      total,
      truncated: total > MAX_REPORTS,
    });
  } catch (error) {
    return json(
      {
        error: "Failed to fetch Clearasist reports.",
        message: error instanceof Error ? error.message : String(error),
      },
      502,
    );
  }
};

export const onRequestPatch = async ({ request, env }: PagesContext) => {
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status);
  }

  const admin = requireAliasistAdmin(auth.userId, env);
  if (!admin.ok) {
    return json({ error: admin.error }, admin.status);
  }

  const adminSecret = env.CLEARASIST_ADMIN_SECRET?.trim();
  if (!adminSecret) {
    return json({ error: "Clearasist metadata worker not connected (missing CLEARASIST_ADMIN_SECRET env)." }, 503);
  }

  const base = trimTrailingSlashes(
    env.CLEARASIST_METADATA_WORKER_URL?.trim() || DEFAULT_CLEARASIST_WORKER_URL,
  );

  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id || isNaN(Number(id))) {
      return json({ error: "Invalid report ID" }, 400);
    }

    const body = await request.json().catch(() => ({}));

    const upstream = await fetch(`${base}/admin/reports/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return json({ error: `Clearasist upstream error: ${upstream.status} ${text}`.trim() }, 502);
    }

    const updated = await upstream.json();
    return json(updated);
  } catch (error) {
    return json(
      {
        error: "Failed to update Clearasist report.",
        message: error instanceof Error ? error.message : String(error),
      },
      502,
    );
  }
};

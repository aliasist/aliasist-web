import type { ClerkEnv } from "../_lib/clerk-auth";
import { authenticateRequest, corsHeaders, json } from "../_lib/clerk-auth";

interface Env extends ClerkEnv {
  MONGODB_URI?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: corsHeaders,
  });

/**
 * Clerk-authenticated MongoDB connectivity check. Requires `MONGODB_URI` Pages secret.
 * Uses the Node `mongodb` driver (Wrangler `nodejs_compat`).
 */
export const onRequestGet = async ({ request, env }: PagesContext) => {
  const auth = await authenticateRequest(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status);
  }

  const uri = env.MONGODB_URI?.trim();
  if (!uri) {
    return json({ mongo: "not_configured", hint: "Set MONGODB_URI in Pages secrets." }, 200);
  }

  try {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(uri);
    await client.connect();
    await client.db().admin().command({ ping: 1 });
    await client.close();
    return json({ mongo: "ok" }, 200);
  } catch (e) {
    return json(
      {
        mongo: "error",
        message: e instanceof Error ? e.message : String(e),
      },
      500,
    );
  }
};

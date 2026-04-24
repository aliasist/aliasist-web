/**
 * Clerk-based admin auth for DataSist mutation endpoints.
 *
 * Uses the same Clerk instance that powers aliasist.com (see
 * functions/api/chat-messages.ts for the canonical pattern).
 *
 * Required env:
 *   CLERK_SECRET_KEY       — server-side Clerk key (secret)
 *   CLERK_PUBLISHABLE_KEY  — frontend-safe Clerk key (variable)
 *   ADMIN_USER_IDS         — comma-separated list of Clerk user ids
 *                            (e.g. "user_abc123,user_def456"). Empty or
 *                            unset means *no one* is an admin and every
 *                            mutation is rejected. Fail closed.
 */

import { createClerkClient } from "@clerk/backend";

export interface ClerkAuthEnv {
  CLERK_SECRET_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  ADMIN_USER_IDS?: string;
}

export type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; response: Response };

function errorResponse(
  error: string,
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function parseAdminIds(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

/**
 * Validates a Clerk bearer token on the request and confirms the user is
 * in the admin allow-list. Returns either {ok: true, userId} or an
 * {ok: false, response} that the caller should return as-is.
 */
export async function requireAdmin(
  request: Request,
  env: ClerkAuthEnv,
  corsHeaders: Record<string, string>,
): Promise<AdminAuthResult> {
  if (!env.CLERK_SECRET_KEY) {
    return {
      ok: false,
      response: errorResponse(
        "Admin auth is not configured on this worker (CLERK_SECRET_KEY missing).",
        503,
        corsHeaders,
      ),
    };
  }

  const adminIds = parseAdminIds(env.ADMIN_USER_IDS);
  if (adminIds.size === 0) {
    return {
      ok: false,
      response: errorResponse(
        "Admin auth is not configured on this worker (ADMIN_USER_IDS missing).",
        503,
        corsHeaders,
      ),
    };
  }

  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!token) {
    return {
      ok: false,
      response: errorResponse(
        "Unauthorized — missing Clerk session token.",
        401,
        corsHeaders,
      ),
    };
  }

  const clerkClient = createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  });

  // Re-issue the request so Clerk sees exactly the Bearer header we saw.
  const forwardedRequest = new Request(request, {
    headers: new Headers(request.headers),
  });
  forwardedRequest.headers.set("Authorization", `Bearer ${token}`);

  try {
    const requestState = await clerkClient.authenticateRequest(forwardedRequest);
    if (!requestState.isSignedIn) {
      return {
        ok: false,
        response: errorResponse(
          "Unauthorized — invalid or expired Clerk session.",
          401,
          corsHeaders,
        ),
      };
    }

    const auth = requestState.toAuth();
    const userId = auth?.userId;
    if (!userId) {
      return {
        ok: false,
        response: errorResponse("Unauthorized.", 401, corsHeaders),
      };
    }

    if (!adminIds.has(userId)) {
      return {
        ok: false,
        response: errorResponse(
          "Forbidden — this account is not an admin for DataSist.",
          403,
          corsHeaders,
        ),
      };
    }

    return { ok: true, userId };
  } catch (err) {
    console.error("Clerk auth failed:", err);
    return {
      ok: false,
      response: errorResponse(
        "Unauthorized — could not verify Clerk session.",
        401,
        corsHeaders,
      ),
    };
  }
}

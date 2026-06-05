import { createClerkClient } from "@clerk/backend";

const PRODUCTION_PUBLISHABLE_KEY = "pk_live_Y2xlcmsuYWxpYXNpc3QuY29tJA";

export type ClerkEnv = {
  CLERK_SECRET_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  /** Clerk JWT PEM public key for networkless session verification. */
  CLERK_JWT_KEY?: string;
  CLERK_PUBLIC_KEY?: string;
  /**
   * Fallbacks for deployments where secrets were mistakenly added as Vite-style
   * vars in the Pages dashboard (they are still exposed to Functions as plain env).
   */
  VITE_CLERK_SECRET_KEY?: string;
  VITE_CLERK_PUBLISHABLE_KEY?: string;
  /**
   * Optional comma-separated extra origins for Clerk's authorizedParties check.
   * Use this on Pages preview deployments to add the preview URL, e.g.:
   *   https://abc123.aliasistabductor.pages.dev
   * Set via Cloudflare Pages → Settings → Environment variables → CLERK_AUTHORIZED_PARTIES
   */
  CLERK_AUTHORIZED_PARTIES?: string;
};

export type AliasistAdminEnv = {
  ALIASIST_ADMIN_USER_IDS?: string;
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Content-Type": "application/json",
};

export function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}

export function requireAliasistAdmin(userId: string, env: AliasistAdminEnv) {
  const adminUserIds = new Set(
    (env.ALIASIST_ADMIN_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  if (!adminUserIds.size) {
    return {
      ok: false as const,
      error: "Dashboard owner allowlist is not configured.",
      status: 503,
    };
  }

  if (!adminUserIds.has(userId)) {
    return {
      ok: false as const,
      error: "Dashboard access is restricted.",
      status: 403,
    };
  }

  return { ok: true as const };
}

export async function authenticateRequest(request: Request, env: ClerkEnv) {
  const authorization = request.headers.get("Authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return { ok: false as const, error: "Missing session token.", status: 401 };
  }

  const secretKey = env.CLERK_SECRET_KEY?.trim() || env.VITE_CLERK_SECRET_KEY?.trim();
  const publishableKey =
    env.CLERK_PUBLISHABLE_KEY?.trim() ||
    env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ||
    PRODUCTION_PUBLISHABLE_KEY;
  const jwtKey = env.CLERK_JWT_KEY?.trim() || env.CLERK_PUBLIC_KEY?.trim();

  if (!secretKey) {
    return {
      ok: false as const,
      error: "CLERK_SECRET_KEY is not configured.",
      status: 500,
    };
  }

  const clerkClient = createClerkClient({
    secretKey,
    publishableKey,
  });

  const forwardedRequest = new Request(request, {
    headers: new Headers(request.headers),
  });

  forwardedRequest.headers.set("Authorization", `Bearer ${token}`);

  const baseParties = [
    "https://aliasist.com",
    "https://www.aliasist.com",
    "https://auth.aliasist.com",
  ];
  const extraParties = (env.CLERK_AUTHORIZED_PARTIES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const authorizedParties = [...baseParties, ...extraParties];

  try {
    const requestState = await clerkClient.authenticateRequest(
      forwardedRequest,
      {
        authorizedParties,
        ...(jwtKey ? { jwtKey } : {}),
      },
    );

    if (!requestState.isAuthenticated) {
      return { ok: false as const, error: "Unauthorized.", status: 401 };
    }

    const auth = requestState.toAuth();
    if (!auth.userId) {
      return { ok: false as const, error: "Unauthorized.", status: 401 };
    }

    return { ok: true as const, userId: auth.userId };
  } catch {
    return { ok: false as const, error: "Unauthorized.", status: 401 };
  }
}

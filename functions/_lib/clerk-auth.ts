import { createClerkClient } from "@clerk/backend";

export type ClerkEnv = {
  CLERK_SECRET_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  /**
   * Fallbacks for deployments where secrets were mistakenly added as Vite-style
   * vars in the Pages dashboard (they are still exposed to Functions as plain env).
   */
  VITE_CLERK_SECRET_KEY?: string;
  VITE_CLERK_PUBLISHABLE_KEY?: string;
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Content-Type": "application/json",
};

export function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
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
    env.CLERK_PUBLISHABLE_KEY?.trim() || env.VITE_CLERK_PUBLISHABLE_KEY?.trim();

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

  const requestState = await clerkClient.authenticateRequest(forwardedRequest);
  if (!requestState.isSignedIn) {
    return { ok: false as const, error: "Unauthorized.", status: 401 };
  }

  const auth = requestState.toAuth();
  if (!auth.userId) {
    return { ok: false as const, error: "Unauthorized.", status: 401 };
  }

  return { ok: true as const, userId: auth.userId };
}

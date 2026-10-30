// Shared pieces for the spawnOS web desktop API (/os/ → /api/spawnos/*).
// Profiles are username-only (no password), so anything stored here is
// readable by whoever types the same username. Keep it to desktop toys.

export interface SpawnosEnv {
  SPAWNOS_DB: D1Database;
}

export type SpawnosContext = {
  request: Request;
  env: SpawnosEnv;
};

export const USERNAME_RE = /^[a-zA-Z0-9_-]{2,20}$/;
export const FILENAME_RE = /^[a-zA-Z0-9_.-]{1,64}$/;
export const MAX_CONTENT_BYTES = 200 * 1024;
// Caps total storage per username, since anyone can create one
export const MAX_FILES_PER_USER = 50;

// Same-origin only: no CORS headers, so other sites can't script these endpoints
export function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

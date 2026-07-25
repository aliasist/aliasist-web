/**
 * Lightweight abuse/cost protection for the public AI endpoints
 * (`/api/ai/chat`, `/api/ai/rag-chat`), which call paid LLM providers.
 *
 * The rate limiter is an in-memory sliding window. On Workers this is
 * per-isolate (best-effort) — it meaningfully throttles a single abuser hitting
 * one colo, but is not a globally-consistent quota. Upgrade path when needed:
 * a Durable Object or the Workers Rate Limiting binding. Kept dependency-free
 * and pure so it is unit-testable.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds the caller should wait before retrying (0 when allowed). */
  retryAfterSec: number;
}

// key → sorted ascending timestamps (ms) of recent allowed hits within the window
const buckets = new Map<string, number[]>();

/** Sliding-window limiter. `now` is injectable for deterministic tests. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const cutoff = now - windowMs;
  const recent = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    const retryAfterSec = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  if (recent.length) buckets.set(key, recent);
  else buckets.delete(key);
  return { allowed: true, retryAfterSec: 0 };
}

/** Best-effort client identity for rate limiting. */
export function clientKey(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Origin policy for the AI endpoints. Blocks only when a browser sends an
 * `Origin` header that does not match the configured allow-list. Requests with
 * no `Origin` (native mobile app, server-to-server) are allowed — they cannot
 * be origin-checked and are covered by the rate limit instead.
 */
export function isOriginAllowed(
  request: Request,
  allowedOrigin: string | undefined,
): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // non-browser client
  if (!allowedOrigin) return true; // not configured → do not block
  return origin === allowedOrigin;
}

/** Reject obviously oversized bodies before parsing. Returns true if too large. */
export function isBodyTooLarge(request: Request, maxBytes: number): boolean {
  const len = Number(request.headers.get("Content-Length") ?? "");
  return Number.isFinite(len) && len > maxBytes;
}

/** Test-only: clear the in-memory window state. */
export function _resetRateLimit(): void {
  buckets.clear();
}

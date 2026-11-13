/**
 * Shared per-IP rate limiting for Pages Functions.
 *
 * Extracted from the chat endpoint's original inline guard so the form proxies
 * can share one implementation and one KV namespace instead of each carrying a
 * copy. Every endpoint that can reach a metered upstream (Workers AI neurons,
 * Groq tokens, the llm-chat worker) should bucket through here.
 *
 * KV has no atomic increment, so concurrent requests from the same IP within
 * the same window can undercount. That is an accepted tradeoff: this is an
 * abuse guard that makes a bot bill go up slowly instead of instantly, not a
 * precise limiter. Exact counters would need a Durable Object and would cost
 * more than the traffic they protect against.
 */

export type RateLimitEnv = {
  /** Preferred binding name for new endpoints. */
  ABUSE_RATE_LIMIT?: KVNamespace;
  /**
   * Legacy binding name already configured in wrangler.toml. Kept as the
   * fallback so no dashboard change is needed to turn on new limits.
   */
  CHAT_RATE_LIMIT?: KVNamespace;
};

export type RateLimitOptions = {
  /**
   * Bucket prefix. Separate buckets keep each endpoint's budget independent,
   * so exhausting the contact form limit can't lock someone out of chat.
   */
  bucket: string;
  /** Requests allowed per window. */
  max: number;
  /** Window length in seconds. */
  windowSeconds: number;
};

/**
 * Resolve the KV binding for rate limiting. Undefined in local dev, where the
 * limits fail open so forms and chat still work without a Cloudflare login.
 */
export function rateLimitNamespace(env: RateLimitEnv): KVNamespace | undefined {
  return env.ABUSE_RATE_LIMIT ?? env.CHAT_RATE_LIMIT;
}

/**
 * Best-available client identifier. `CF-Connecting-IP` is set by Cloudflare
 * and cannot be spoofed by the client. The fallback keeps local dev and tests
 * working; it deliberately collapses to one shared bucket rather than trusting
 * a client-supplied header such as `X-Forwarded-For`.
 */
export function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}

/**
 * Increment the caller's counter and report whether they are still under the
 * limit. Returns true when no KV binding is present.
 */
export async function checkRateLimit(
  kv: KVNamespace | undefined,
  ip: string,
  { bucket, max, windowSeconds }: RateLimitOptions,
): Promise<boolean> {
  if (!kv) return true;
  const key = `${bucket}:${ip}`;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;
  if (count >= max) return false;
  await kv.put(key, String(count + 1), { expirationTtl: windowSeconds });
  return true;
}

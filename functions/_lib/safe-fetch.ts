/**
 * Shared safeFetch utility for Pages Functions.
 *
 * Provides consistent error handling for upstream API calls so every
 * endpoint doesn't reinvent its own try/catch + res.ok + JSON parse pattern.
 *
 * Usage:
 *   // Simple GET with JSON response
 *   const result = await safeFetch('https://api.example.com/data', {
 *     timeout: 5000,
 *   });
 *   if (result.error) return result.error;
 *   console.log(result.data);
 *
 *   // POST with body and custom error response
 *   const result = await safeFetch('https://api.example.com/submit', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ key: 'value' }),
 *     timeout: 10000,
 *     onError: (status, message) =>
 *       json({ error: 'upstream_failed', detail: message }, 502),
 *   });
 *
 *   // Fire-and-forget (no response body needed)
 *   await safeFetchFireAndForget('https://api.example.com/webhook', {
 *     method: 'POST',
 *     body: JSON.stringify({ event: 'sync' }),
 *   });
 */

import { standardCorsHeaders } from "./cors";

// ── Types ────────────────────────────────────────────────────────────────────

/** Options for safeFetch */
export interface SafeFetchOptions extends RequestInit {
  /** Timeout in milliseconds (default: 5000) */
  timeout?: number;
  /**
   * Custom error response factory. If provided, returns a Response on upstream
   * errors. If omitted, returns a default JSON error response.
   */
  onError?: (status: number, message: string) => Response;
  /**
   * If true, skip JSON parsing and return raw text instead.
   */
  raw?: boolean;
  /**
   * Cloudflare-specific fetch options (cache, etc.).
   */
  cf?: {
    cacheEverything?: boolean;
    cacheTtl?: number;
  };
}

/** Result of a safeFetch call — either data or an error Response */
export interface SafeFetchSuccess<T = unknown> {
  ok: true;
  data: T;
  status: number;
  headers: Headers;
}

export interface SafeFetchError {
  ok: false;
  error: Response;
}

export type SafeFetchResult<T = unknown> = SafeFetchSuccess<T> | SafeFetchError;

// ── Core Functions ───────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT = 5000;

/**
 * Fetch from an upstream API with consistent error handling.
 *
 * Handles timeouts, non-OK status codes, malformed JSON, and network errors
 * in one place so endpoint handlers stay clean.
 *
 * @param url - The URL to fetch
 * @param options - Fetch options plus timeout and error handling config
 * @returns A result object with either the parsed data or an error Response
 */
export async function safeFetch<T = unknown>(
  url: string | URL,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResult<T>> {
  const {
    timeout = DEFAULT_TIMEOUT,
    onError,
    raw = false,
    cf,
    ...fetchInit
  } = options;

  try {
    // Build the fetch init with Cloudflare-specific options
    const init: RequestInit & { cf?: NonNullable<typeof cf> } = { ...fetchInit };
    if (cf) init.cf = cf;

    // Add timeout via AbortSignal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    if (!init.signal) init.signal = controller.signal;

    const res = await fetch(url, init);
    clearTimeout(timeoutId);

    if (!res.ok) {
      const message = `Upstream returned ${res.status}: ${res.statusText}`;
      const errorResp = onError
        ? onError(res.status, message)
        : defaultErrorResponse(res.status, message);
      return { ok: false, error: errorResp };
    }

    // Parse response body
    let data: T;
    if (raw) {
      data = (await res.text()) as unknown as T;
    } else {
      const text = await res.text();
      if (!text) {
        data = undefined as unknown as T;
      } else {
        try {
          data = JSON.parse(text) as T;
        } catch {
          // Not JSON — return raw text
          data = text as unknown as T;
        }
      }
    }

    return { ok: true, data, status: res.status, headers: res.headers };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = err instanceof DOMException && err.name === "AbortError" ? 504 : 502;
    const errorResp = onError
      ? onError(status, message)
      : defaultErrorResponse(status, message);
    return { ok: false, error: errorResp };
  }
}

/**
 * Fire-and-forget fetch — fires the request but doesn't wait for or parse
 * the response. Useful for webhooks, cache seeding, and background sync.
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 3000)
 */
export async function safeFetchFireAndForget(
  url: string | URL,
  options: RequestInit = {},
  timeout = 3000,
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch {
    // Silently ignore — fire and forget
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch and return the raw Response object, or null on error.
 * Useful when you need to pass the response through (e.g., proxy patterns).
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @returns The Response object or null if the fetch failed
 */
export async function safeFetchRaw(
  url: string | URL,
  options: RequestInit = {},
  timeout = DEFAULT_TIMEOUT,
): Promise<Response | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok ? res : null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a default JSON error response with CORS headers.
 */
function defaultErrorResponse(status: number, message: string): Response {
  return new Response(
    JSON.stringify({ error: "upstream_error", status, message }),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...standardCorsHeaders,
      },
    },
  );
}

/**
 * Shared environment variable utilities for Pages Functions.
 *
 * Provides helpers for reading env vars with trimming, fallbacks, and
 * clear error messages when required vars are missing.
 *
 * Usage:
 *   // Required var — throws if missing
 *   const apiKey = getEnvVar(env, 'TMDB_API_KEY');
 *
 *   // Optional var with fallback
 *   const model = getEnvVar(env, 'AI_MODEL', DEFAULT_MODEL);
 *
 *   // Check if configured, return 503 if not
 *   const apiKey = envOr503(env, 'TMDB_API_KEY', 'tmdb_not_configured');
 */

/**
 * Get a trimmed environment variable value.
 * @param env - The environment object
 * @param name - The variable name
 * @param fallback - Optional fallback value if the var is missing
 * @throws Error if the variable is missing and no fallback is provided
 */
export function getEnvVar<T extends Record<string, string | undefined>>(
  env: T,
  name: keyof T,
  fallback?: string,
): string {
  const value = env[name]?.trim();
  if (!value && fallback !== undefined) return fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${String(name) as string}`);
  }
  return value;
}

/**
 * Get an optional trimmed environment variable value, or undefined if not set.
 * @param env - The environment object
 * @param name - The variable name
 */
export function getOptionalEnvVar<T extends Record<string, string | undefined>>(
  env: T,
  name: keyof T,
): string | undefined {
  return env[name]?.trim() || undefined;
}

/**
 * Get a trimmed environment variable or return a 503 JSON response if missing.
 * Useful in Pages Functions where you want to fail gracefully.
 * @param env - The environment object
 * @param name - The variable name
 * @param errorKey - Error key for the JSON response body
 */
export function envOr503<T extends Record<string, string | undefined>>(
  env: T,
  name: keyof T,
  errorKey = `${String(name) as string}_not_configured`,
): { value: string } | Response {
  const value = env[name]?.trim();
  if (!value) {
    return new Response(
      JSON.stringify({ error: errorKey }),
      { status: 501, headers: { "Content-Type": "application/json" } },
    );
  }
  return { value };
}

/**
 * Parse a comma-separated environment variable into an array of trimmed values.
 * @param env - The environment object
 * @param name - The variable name
 */
export function getEnvList<T extends Record<string, string | undefined>>(
  env: T,
  name: keyof T,
): string[] {
  const value = env[name];
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Check if an environment variable is configured (non-empty after trimming).
 * @param env - The environment object
 * @param name - The variable name
 */
export function hasEnvVar<T extends Record<string, string | undefined>>(
  env: T,
  name: keyof T,
): boolean {
  return !!env[name]?.trim();
}

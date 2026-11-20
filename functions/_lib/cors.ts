/**
 * Shared CORS utilities for Pages Functions.
 *
 * Dedicated Workers (datasist-api, clearasist, etc.) cannot import from
 * Pages Functions, so they keep their own local CORS definitions. This
 * module consolidates the CORS logic used within the Pages Functions
 * themselves (chat, forum, entertainment, etc.).
 *
 * Usage:
 *   // Wildcard origin (most endpoints)
 *   const headers = corsHeaders();
 *
 *   // Specific origin (if you need to restrict)
 *   const headers = corsHeaders('https://aliasist.com');
 *
 *   // Preflight response
 *   return new Response(null, { status: 204, headers: corsHeaders() });
 */

const DEFAULT_ALLOWED_METHODS = "GET, POST, PATCH, OPTIONS";
const DEFAULT_ALLOWED_HEADERS = "Authorization, Content-Type";

/**
 * Build CORS headers for a response.
 * @param origin - Origin to allow (defaults to wildcard "*")
 * @param methods - Comma-separated HTTP methods (defaults to GET, POST, PATCH, OPTIONS)
 * @param headers - Comma-separated request headers (defaults to Authorization, Content-Type)
 */
export function corsHeaders(
  origin = "*",
  methods = DEFAULT_ALLOWED_METHODS,
  headers = DEFAULT_ALLOWED_HEADERS,
): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": headers,
  };
}

/**
 * Standard CORS headers used by most Pages Function endpoints.
 * Wildcard origin, common methods and headers.
 */
export const standardCorsHeaders = corsHeaders();

/**
 * CORS headers for endpoints that also support PUT and DELETE.
 */
export const extendedCorsHeaders = corsHeaders(
  "*",
  "GET, POST, PUT, PATCH, DELETE, OPTIONS",
);

/**
 * Handle CORS preflight (OPTIONS) requests.
 */
export function handleCorsPreflight(): Response {
  return new Response(null, { status: 204, headers: standardCorsHeaders });
}

/**
 * Build a JSON response with CORS headers attached.
 */
export function jsonCors(
  payload: Record<string, unknown>,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...standardCorsHeaders, ...extraHeaders },
  });
}

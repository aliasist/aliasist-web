/**
 * Health check for the Pages Functions edge backend.
 * GET /api/health → { status, app, timestamp }
 */

export const onRequestGet = () => {
  return new Response(
    JSON.stringify({
      status: "ok",
      app: "Aliasist Pages Functions",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};

// Production hold gate. When MAINTENANCE_MODE is true, every request to the
// live aliasist.com domain gets the landing page below instead of the app.
// Flip to true and push to master to take the homepage down for maintenance;
// flip back to false and push to restore it. Mirrors the same pattern in
// globalize's functions/_middleware.ts — kept independent per project
// (different domain, different copy) rather than shared, since each Pages
// project deploys separately.
const MAINTENANCE_MODE = false;

const LANDING_PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Aliasist</title>
<meta name="description" content="Aliasist is undergoing maintenance. Back shortly." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  :root {
    --color-bg: #050510;
    --color-panel: #1A1D36;
    --color-edge: #23264A;
    --color-signal: #00FF99;
    --color-blue: #3ABEFF;
    --color-fg: #FFFFFF;
    --color-muted: #B0B0C3;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    background: var(--color-bg);
    color: var(--color-fg);
    font-family: "JetBrains Mono", "Fira Mono", monospace;
  }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(ellipse at top, rgba(58, 190, 255, 0.08), transparent 60%),
      radial-gradient(ellipse at bottom, rgba(0, 255, 153, 0.05), transparent 60%),
      var(--color-bg);
  }
  .card {
    max-width: 520px;
    width: 100%;
    text-align: center;
  }
  h1 {
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
  }
  .accent { color: var(--color-signal); }
  p {
    color: var(--color-muted);
    font-size: 15px;
    line-height: 1.6;
    margin: 0 0 32px;
  }
  .status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 1px solid var(--color-edge);
    background: var(--color-panel);
    border-radius: 999px;
    font-size: 13px;
    color: var(--color-muted);
    margin-bottom: 32px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-signal);
    box-shadow: 0 0 8px var(--color-signal);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>
</head>
<body>
  <div class="card">
    <div class="status"><span class="dot"></span> Maintenance</div>
    <h1>We'll be right <span class="accent">back.</span></h1>
    <p>Aliasist is undergoing scheduled maintenance. Check back shortly.</p>
  </div>
</body>
</html>`;

export const onRequest: PagesFunction = async (context) => {
  // Only gate the real production domain. Preview deployments (feature
  // branches, PRs) always show the actual app so work can be reviewed
  // without needing to touch this flag.
  const hostname = new URL(context.request.url).hostname;
  const isProductionDomain = hostname === "www.aliasist.com" || hostname === "aliasist.com";

  if (!MAINTENANCE_MODE || !isProductionDomain) {
    return context.next();
  }

  return new Response(LANDING_PAGE_HTML, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
};

/** Offline shell for Atomicity — cache static assets only; no network uploads in-app. */
const CACHE = "atomicity-crafted-v28-2026";
const ROOT = new URL("./", self.location).href;
const INDEX_URL = new URL("index.html", ROOT).href;
const PRECACHE = [
  INDEX_URL,
  new URL("intro.mjs", ROOT).href,
  new URL("app.mjs", ROOT).href,
  new URL("atomicity-core.mjs", ROOT).href,
  new URL("styles.css", ROOT).href,
  new URL("manifest.json", ROOT).href,
  new URL("icons/icon.svg", ROOT).href,
  new URL("icons/ufo.svg", ROOT).href,
  new URL("assets/atomicity-logo.svg", ROOT).href,
  new URL("assets/brand/png/aliasist-github-192.png", ROOT).href,
  new URL("assets/orbit-rings.svg", ROOT).href,
];

// Optional assets: should not block SW install if missing.
const OPTIONAL = [
  new URL("assets/brand/logo.svg", ROOT).href,
  new URL("assets/brand/png/pwa-192.png", ROOT).href,
  new URL("assets/brand/png/brand-pwa-maskable-512.png", ROOT).href,
  new URL("assets/brand/png/aliasist-github-192.png", ROOT).href,
  new URL("assets/brand/png/aliasist-github-512.png", ROOT).href,
  new URL("assets/brand/aliasist-hub-mark.svg", ROOT).href,
  new URL("assets/brand/datasist-mark.svg", ROOT).href,
  new URL("assets/brand/ecosist-mark.svg", ROOT).href,
  new URL("assets/brand/pulsesist-mark.svg", ROOT).href,
  new URL("assets/brand/aliasist-auth-mark.svg", ROOT).href,
  new URL("assets/brand/spacesist-mark.svg", ROOT).href,
  new URL("assets/brand/atomicity-ring-mark.svg", ROOT).href,
  new URL("assets/brand/suite-banner-16x9.svg", ROOT).href,
  new URL("assets/brand/aliasist-ufo-logo-professional.svg", ROOT).href,
  new URL("assets/brand/aliasist-ufo-icon.svg", ROOT).href,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(async (cache) => {
        await cache.addAll(PRECACHE);
        await Promise.allSettled(OPTIONAL.map((u) => cache.add(u)));
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      let hit = await cache.match(event.request);
      if (hit) return hit;
      if (event.request.mode === "navigate") {
        hit = await cache.match(INDEX_URL);
        if (hit) return hit;
      }
      try {
        return await fetch(event.request);
      } catch {
        const fallback = await cache.match(INDEX_URL);
        return fallback || new Response("Offline", { status: 503 });
      }
    })()
  );
});

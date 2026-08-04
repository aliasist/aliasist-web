import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "node:fs";

import { cloudflare } from "@cloudflare/vite-plugin";

function loadDevVarsFile(cwd: string): Record<string, string> {
  const file = path.join(cwd, ".dev.vars");
  if (!fs.existsSync(file)) return {};
  const out: Record<string, string> = {};
  const raw = fs.readFileSync(file, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

function devSpaFallbackPlugin() {
  return {
    name: "aliasist-dev-spa-fallback",
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "/";
        const isAssetRequest =
          pathname.includes(".") ||
          pathname.startsWith("/@") ||
          pathname.startsWith("/src/") ||
          pathname.startsWith("/node_modules/") ||
          pathname.startsWith("/atomicity/");

        if (pathname === "/" || isAssetRequest) {
          next();
          return;
        }

        try {
          const htmlPath = path.resolve(__dirname, "index.html");
          const rawHtml = await fs.promises.readFile(htmlPath, "utf8");
          const html = await server.transformIndexHtml(req.url ?? "/", rawHtml);
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html");
          res.end(html);
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const cwd = process.cwd();
  const baseEnv = loadEnv(mode, cwd, "");
  const devVars = loadDevVarsFile(cwd);

  // Make `.dev.vars` also available to runtime plugins that read `process.env` (e.g. Cloudflare Vite runtime).
  // Never rely on this for production: Pages should inject secrets/vars at build/runtime.
  if (mode === "development") {
    for (const [k, v] of Object.entries(devVars)) {
      if (!(k in process.env)) process.env[k] = v;
    }
  }
  const clerkPublishableKey =
    process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ||
    baseEnv.VITE_CLERK_PUBLISHABLE_KEY?.trim() ||
    devVars.VITE_CLERK_PUBLISHABLE_KEY?.trim() ||
    process.env.CLERK_PUBLISHABLE_KEY?.trim() ||
    baseEnv.CLERK_PUBLISHABLE_KEY?.trim() ||
    devVars.CLERK_PUBLISHABLE_KEY?.trim() ||
    "";
  const enableCloudflareDev =
    process.env.ALIASIST_CLOUDFLARE_VITE_DEV === "true" ||
    baseEnv.ALIASIST_CLOUDFLARE_VITE_DEV === "true" ||
    devVars.ALIASIST_CLOUDFLARE_VITE_DEV === "true";

  // `lovable-tagger` is optional dev tooling; don't fail production builds
  // if npm couldn't install it (peer-dep conflicts with vite versions).
  const devPlugins = [];
  const runtimePlugins = [];
  if (mode === "development") {
    try {
      const mod = await import("lovable-tagger");
      if (typeof mod.componentTagger === "function") {
        devPlugins.push(mod.componentTagger());
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[vite] lovable-tagger not available; skipping tagger.");
    }

    // Only enable the Cloudflare Vite runtime when explicitly requested. Production
    // Pages builds should emit a plain static `dist/` without a generated
    // `dist/wrangler.json`, otherwise Pages tries to parse that file as deploy
    // configuration and aborts after a successful build.
    if (enableCloudflareDev) runtimePlugins.push(cloudflare());
  }

  return {
    appType: "spa",
    server: {
      host: "127.0.0.1",
      port: 8080,
      hmr: {
        overlay: false,
      },
      allowedHosts: [".trycloudflare.com"],
    },
    plugins: [react(), devSpaFallbackPlugin(), ...devPlugins, ...runtimePlugins],
    define: clerkPublishableKey
      ? {
          // Cloudflare Pages had already been configured with CLERK_PUBLISHABLE_KEY;
          // expose it to the client build as the Vite-prefixed key the app expects.
          "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
            clerkPublishableKey,
          ),
        }
      : undefined,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@images": path.resolve(__dirname, "./images"),
      },
    },
    test: {
      passWithNoTests: true,
      include: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "functions/**/*.{test,spec}.{ts,tsx}",
      ],
      exclude: ["node_modules", "dist", "apps", "website", "app"],
    },
  };
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
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

    // Only enable the Cloudflare Vite runtime during local dev. Production
    // Pages builds should emit a plain static `dist/` without a generated
    // `dist/wrangler.json`, otherwise Pages tries to parse that file as deploy
    // configuration and aborts after a successful build.
    runtimePlugins.push(cloudflare());
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      allowedHosts: [
        "debian-cursor-precipitation-really.trycloudflare.com",
        ".trycloudflare.com",
      ],
    },
    plugins: [react(), ...devPlugins, ...runtimePlugins],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@images": path.resolve(__dirname, "./images"),
      },
    },
    test: {
      passWithNoTests: true,
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      exclude: ["node_modules", "dist", "apps", "website", "app"],
    },
  };
});

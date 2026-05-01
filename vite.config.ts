import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // `lovable-tagger` is optional dev tooling; don't fail production builds
  // if npm couldn't install it (peer-dep conflicts with vite versions).
  const devPlugins = [];
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
    plugins: [react(), ...devPlugins, cloudflare()],
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
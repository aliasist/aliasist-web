# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Individual visitors who land on the Aliasist homepage to discover the suite of web apps and tools. Users range from casual browsers to returning users looking for a specific tool (PDF editor, globe, chat, etc.).

## Product Purpose

Aliasist is the central homepage and front door to the entire Aliasist suite. It showcases all available apps and tools in one place, letting visitors see what's available and jump directly into any app. Success means a clear, navigable hub that communicates the breadth of the suite without overwhelming the visitor.

## Positioning

A personal homepage that serves as a unified portal to five web apps and one desktop app: not a corporate landing page, but a personal showcase of tools built by one developer. The homepage itself hosts spawnOS, a browser-based OS where each app opens in its own window.

## Operating Context

- Deployed on Cloudflare Pages with Cloudflare Functions for API routes
- Clerk authentication for sign-in
- React + Vite + TypeScript, Tailwind CSS + Radix UI
- Pages: Cosmic OS (spawnOS), Entertainment, Tech Landing, Sensor, Blog
- Apps listed from `src/content/homepage.ts`: Aliasist AI, Globalize, SpaceSist, ClearSist, PDFSist, Files Abductor, spawnOS
- Datadog RUM for browser monitoring

## Capabilities and Constraints

- Static homepage with dynamic app listings
- Cloudflare Pages Functions handle `/api/*` routes
- Clerk for optional sign-in
- Radix UI for accessible components
- No backend database: content-driven from source files

## Brand Commitments

- Name: Aliasist
- Aesthetic: Minimal and clean: flat dark surfaces, no decorative grid backgrounds, solid colors over gradients
- Font: DM Sans (body), DM Serif Display (headings), replaced from Inter/Space Grotesk per Impeccable craft-floor

## Evidence on Hand

- README.md with suite overview and screenshots
- images/aliasist-homepage-screenshot.png and public/aliasist-about-screenshot.png
- docs/SUITE_STATUS.md with app code locations and deployment status
- AGENTS.md with development conventions

## Product Principles

1. **Portal, not product**: the homepage exists to route visitors to the real apps.
2. **Curated, not exhaustive**: only shipped, working apps appear; experiments stay hidden.
3. **Personal voice**: written by one developer for real people, not a corporate template.
4. **Minimal chrome**: flat dark surfaces, no decorative effects, let the apps speak.

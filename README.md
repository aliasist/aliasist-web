# Aliasist (`aliasistabductor`)

Monorepo for the Aliasist portfolio site, Workers, sibling apps under `apps/`, and shared assets.

## Public homepage (portfolio)

The site at **aliasist.com** is built from the repo root:

| Path | Purpose |
|------|---------|
| `src/` | Vite + React + TypeScript app |
| `images/` | Marketing / project banners (`@images/` in Vite) |
| `public/` | Icons, mascot, manifests |
| `functions/` | Pages Functions (API routes) |

```bash
cd /path/to/aliasistabductor
npm install
npm run dev
```

Dev server listens on port **8080** by default (see `vite.config.ts`).

```bash
npm run build       # Production client bundle → dist/
npm run lint        # ESLint (root homepage only; apps lint in their dirs)
npm test            # Vitest
npm run deploy      # Cloudflare Pages (build + wrangler deploy)
```

## Apps

Production apps live under `apps/` (each with its own `package.json`): e.g. DataSist, PulseSist, EcoSist, etc. Deploy from inside the relevant app directory per its README.

## Notes

- The portfolio uses **Clerk** for Sign In (`src/lib/clerk.tsx`). Configure `VITE_CLERK_*` publishable keys in local env as needed for development.
- `recover/wip-before-old-checkout` is a rescue tip for obsolete WIP; **canonical homepage source is `master` + committed work**.

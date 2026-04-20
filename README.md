# Aliasist

Main repository for the Aliasist site, serverless endpoints, active apps, and archived project snapshots.

## Active Layout

- `website/` - main Aliasist web app built with Vite, React, and TypeScript
- `functions/` - serverless API handlers used by the site
- `apps/` - active sibling apps and services under development
- `archive/` - preserved older builds, experiments, and prior deployments

## Current Primary App

The main public-facing site lives in `website/`.

Typical local workflow:

```bash
cd website
npm install
npm run dev
```

## Apps

- `apps/ecosist/` - environmental intelligence app
- `apps/datasist/` - DataSist frontend bundle for Cloudflare Pages
- `apps/datasist-api/` - DataSist Cloudflare Worker API
- `apps/pulsesist/` - market and finance app
- `apps/hearthsist-api/` - backend API for HearthSist
- `apps/space-asist/` - additional app workspace

## Cloudflare CLI Deploys

Primary terminal deploy commands:

```bash
cd website && npm run cf:deploy
cd apps/ecosist && npm run cf:deploy
cd apps/pulsesist && npm run cf:deploy
cd apps/datasist && npm run cf:deploy
cd apps/datasist-api && npm run cf:deploy
```

## Notes

- `archive/` is intentionally retained for reference and recovery.
- `apps/datasist-api/` was promoted out of `archive/` because it is still an active deploy target.
- Root-level `node_modules/` and `package-lock.json` reflect an earlier site setup and should be reviewed before the next cleanup pass.
- Before pushing, review `git status` carefully because the current restructure is recorded as deletions plus new directories until it is staged and committed.

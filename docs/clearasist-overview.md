# Clearasist Project Overview

This document provides a high-level overview of the entire Clearasist system.

## What is Clearasist?

Clearasist is a client-side metadata stripping tool.

**Public-facing purpose**: A tool that lets users clean metadata from their own files entirely in the browser. No user data is ever sent to or stored by Aliasist. The only information shown is the amount of metadata removed from the files the user processed.

## Project Locations

All code lives inside the `aliasistabductor` monorepo:

```
/home/blake/aliasistabductor/
├── apps/
│   ├── clearasist/              ← Public user-facing tool
├── .github/workflows/           ← GitHub Actions for deployments
└── docs/
    ├── clearasist-deployment.md
    └── clearasist-overview.md   ← This file
```

## Components

### 1. Public Site (`apps/clearasist`)
- Extremely minimal drag-and-drop interface
- All processing happens locally in the user's browser. No data is sent anywhere.
**README**: `apps/clearasist/README.md`

## How to Access & Run Locally

```bash
# Public site
cd apps/clearasist
npm install
npm run dev

```

## Deployment

See `docs/clearasist-deployment.md` for the full guide.

Current deployment method: **GitHub Actions for the public site**.

## Key Files

- `apps/clearasist/README.md` — Main overview for the public tool
- `docs/clearasist-deployment.md` — How to deploy and update
- `.github/workflows/deploy-clearasist.yml` — Public site deployment workflow

## Current Status (as of last session)

- Public site: Live on Cloudflare Pages
- GitHub Actions: Configured for automatic public-site deployments

## Next Steps / Future Work

- **Master Admin** (`apps/master-admin`) – Centralized control panel for the entire ecosystem (real-time users, deployments, logs, all apps).
- Add more file type support

---

For detailed usage and contribution instructions, start with:
- `apps/clearasist/README.md`
- `docs/clearasist-deployment.md`

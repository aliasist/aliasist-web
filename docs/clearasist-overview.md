# Clearasist Project Overview

This document provides a high-level overview of the entire Clearasist system.

## What is Clearasist?

Clearasist is a client-side metadata stripping tool with a disclosed data collection layer.

**Public-facing purpose**: Allow users to clean metadata from images, PDFs, and Office documents locally in the browser.

**Analysis purpose**: Collect high-quality metadata and lightweight cleaned previews for later dataset curation.

## Project Locations

All code lives inside the `aliasistabductor` monorepo:

```
/home/blake/aliasistabductor/
├── apps/
│   ├── clearasist/              ← Public user-facing tool
│   ├── clearasist-admin/        ← Local admin diagnostic helper
│   └── clearasist/worker/       ← Backend (Cloudflare Worker + D1)
├── .github/workflows/           ← GitHub Actions for deployments
└── docs/
    ├── clearasist-deployment.md
    └── clearasist-overview.md   ← This file
```

## Components

### 1. Public Site (`apps/clearasist`)
- Extremely minimal drag-and-drop interface
- Strips metadata client-side
- Sends rich reports to the Worker after disclosing collection in the UI
- Includes lightweight cleaned previews for supported images

**README**: `apps/clearasist/README.md`

### 2. Local Admin Helper (`apps/clearasist-admin`)
- Lazygit-style interface for reviewing collected reports
- Shows thumbnails, raw metadata, removed items, etc.
- Supports tagging and notes for data curation
- Intended for local diagnostics only because its Vite build embeds `VITE_ADMIN_SECRET`
- Production administration belongs in the authenticated homepage `/agent` dashboard

### 3. Backend Worker (`apps/clearasist/worker`)
- Receives reports from the public site
- Stores everything in Cloudflare D1 (`clearasist-meta`)
- Protected admin endpoints using `ADMIN_SECRET`

## How to Access & Run Locally

```bash
# Public site
cd apps/clearasist
npm install
npm run dev

# Admin
cd apps/clearasist-admin
npm run dev
```

## Deployment

See `docs/clearasist-deployment.md` for the full guide.

Current deployment method: **GitHub Actions for the public site + Wrangler for the Worker**.

## Key Files

- `apps/clearasist/README.md` — Main overview for the public tool
- `docs/clearasist-deployment.md` — How to deploy and update
- `apps/clearasist/worker/schema.sql` — Database schema
- `.github/workflows/deploy-clearasist.yml` — Public site deployment workflow

## Environment Variables

**Public (`clearasist`)**:
- `VITE_METADATA_WORKER_URL`

**Local admin helper (`clearasist-admin`)**:
- `VITE_METADATA_WORKER_URL`
- `VITE_ADMIN_SECRET`

## Current Status (as of last session)

- Public site: Live on Cloudflare Pages
- Admin: Authenticated homepage `/agent` dashboard proxies Worker requests server-side
- Worker + D1: Live and collecting data (including thumbnails)
- GitHub Actions: Configured for automatic public-site deployments

## Next Steps / Future Work

- **Master Admin** (`apps/master-admin`) – Centralized control panel for the entire ecosystem (real-time users, deployments, logs, all apps).
- Improve partial data collection for Clearasist (better text extraction, more signals)
- Build export / dataset curation tools
- Connect to Azure AI training pipeline
- Add more file type support

---

For detailed usage and contribution instructions, start with:
- `apps/clearasist/README.md`
- `docs/clearasist-deployment.md`

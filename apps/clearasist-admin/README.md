# Clearasist Admin

Dedicated, high-signal administrative tool for reviewing and curating metadata removal reports from the public Clearasist tool.

This is the primary surface for inspecting what metadata was stripped from user files, tagging reports for quality/training value, adding notes, and managing the historical record of cleaning activity.

## Purpose

- Review stripped metadata at scale
- Curate high-quality examples for future analysis or training
- Maintain full visibility into Clearasist usage and effectiveness
- Support the "only removal counts matter" data philosophy — we track what was removed, not the original user content

## Key Features

- Searchable list of reports (newest first)
- Detailed view per report:
  - Filename, type, sizes, and exact count of removed metadata fields
  - Lightweight partial previews (thumbnail or text excerpt)
  - Full before/after metadata diff
  - Tagging system (High quality removal, Low quality removal, Review later, Needs attention, etc.)
  - Freeform notes
- Keyboard navigation support
- Clean, focused Lazygit-inspired list + detail layout

## Local Development

```bash
cd apps/clearasist-admin
npm install
cp .env.example .env.local   # Fill in the real worker URL + admin secret
npm run dev
```

The app will show a prominent configuration banner until the required environment variables are present.

## Environment Variables

- `VITE_METADATA_WORKER_URL` — URL of the Clearasist metadata worker (e.g. `https://clearasist-metadata.your-domain.workers.dev`)
- `VITE_ADMIN_SECRET` — The admin bearer token configured on the worker

## Relationship to Other Admin Surfaces

- This is the **specialized, high-fidelity** tool for Clearasist metadata work.
- The broader **Master Admin** and **Agent Abductor Console** (`/abductor-console`) provide higher-level visibility and can link into or summarize Clearasist activity.
- The main **Agent Dashboard** (`/agent`) also embeds Clearasist curation capabilities for convenience.

## Data Philosophy

Clearasist (the public tool) performs all stripping locally in the user's browser. No user files are ever sent to Aliasist during normal use.

The only data retained for administrative review is:
- Filename (for identification)
- File type
- Original vs cleaned size
- Exact count of metadata fields removed
- Optional lightweight partials (thumbnails or text excerpts) for quick quality assessment
- Curator tags and notes added by the admin

We do **not** retain full original user content.

## Deployment

This is an internal tool. Deploy via the normal monorepo Cloudflare Pages flow when changes are made.

## Related Code

- Public Clearasist tool: `apps/clearasist/`
- Metadata worker (admin endpoints): `apps/clearasist/worker/`
- Broader admin experiences: `apps/master-admin/` and the main site's `/abductor-console` + `/agent` routes

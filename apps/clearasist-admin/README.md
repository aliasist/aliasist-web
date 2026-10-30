# ClearSist Admin

My tool for reviewing the metadata reports from ClearSist, the public metadata cleaner.

It's where I look at what metadata got stripped from people's files, tag reports, add notes, and keep a history of cleanups.

## What it's for

- Review stripped metadata in bulk
- Pick out good examples to study or train on later
- See how ClearSist is getting used and how well it's working
- Stick to one rule: track what was removed, never the original file

## Features

- Searchable list of reports, newest first
- A detail view for each report:
  - File name, type, sizes, and exactly how many metadata fields were removed
  - Small previews (a thumbnail or a bit of text)
  - The full before and after metadata
  - Tags (High quality removal, Low quality removal, Review later, Needs attention, and so on)
  - Free-form notes
- Keyboard navigation
- A simple list-and-detail layout, inspired by Lazygit

## Running it locally

```bash
cd apps/clearasist-admin
npm install
cp .env.example .env.local   # fill in the real worker URL and admin secret
npm run dev
```

You'll see a setup banner until those variables are filled in.

## Environment variables

- `VITE_METADATA_WORKER_URL`: the ClearSist metadata worker's URL (for example `https://clearasist-metadata.your-domain.workers.dev`)
- `VITE_ADMIN_SECRET`: the admin token set on the worker

## How it fits with the other admin tools

- This is the detailed tool, just for ClearSist metadata.
- **Master Admin** and the **Agent Abductor Console** (`/abductor-console`) give the big picture and can link into or summarize ClearSist activity.
- The **Agent Dashboard** (`/agent`) on the main site has ClearSist reviews built in too.

## What gets kept

ClearSist strips metadata right in your browser. Your files are never sent to Aliasist when you use it normally.

The only things kept for review are:
- The file name (to tell reports apart)
- The file type
- The size before and after cleaning
- Exactly how many metadata fields were removed
- Optional small previews (thumbnails or bits of text) for quick quality checks
- Tags and notes I add

The full original file is never kept.

## Deploying

This one is internal. It deploys through the normal Cloudflare Pages setup for this repo when it changes.

## Related code

- Public ClearSist app: `apps/clearasist/`
- Metadata worker (admin endpoints): `apps/clearasist/worker/`
- The bigger admin tools: `apps/master-admin/`, plus `/abductor-console` and `/agent` on the main site

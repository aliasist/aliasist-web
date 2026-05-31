# Clearasist

**Clearasist** is a privacy-focused metadata stripping tool. Users can drag and drop files (images, PDFs, Office documents) and receive a cleaned version with all metadata removed.

This project is part of the Aliasist ecosystem and collects rich metadata plus lightweight cleaned previews after disclosing that collection in the UI. The dataset is stored for later analysis and curation.

## Project Structure

This is a monorepo sub-project located at:

```
/home/blake/aliasistabductor/apps/clearasist/
```

### Key Folders

- `src/` — Main React frontend (Vite + TypeScript + Tailwind)
  - `lib/` — Core processing logic (image, PDF, Office metadata stripping)
  - `components/` — UI components
- `worker/` — Cloudflare Worker + D1 backend (receives reports from the frontend)
  - `src/index.ts` — Main worker logic
  - `schema.sql` — D1 database schema
- `public/` — Static assets

### Related Projects

- **Local Admin Helper**: `apps/clearasist-admin/` — Local diagnostic tool to view collected reports and thumbnails.
- **Main Monorepo**: The root `aliasistabductor/` project.

## Live URLs (as of latest deployment)

- **Public Site**: https://clearasist.pages.dev (or your custom domain)
- **Admin Dashboard**: authenticated homepage `/agent` dashboard
- **Worker**: https://clearasist-metadata.bchooper0730.workers.dev

## How It Works

1. User uploads a file on the public site.
2. All metadata is stripped **client-side** in the browser.
3. A disclosed analysis report is sent to the Worker containing:
   - Raw metadata (before)
   - What was removed
   - Cleaned metadata (after)
   - File sizes, type, etc.
   - Lightweight partials (thumbnail for images, text excerpt for documents)
4. Data is stored in Cloudflare D1 (`clearasist-meta`).
5. You can view and curate the data in the authenticated homepage Admin dashboard.

## Environment Variables

### Public Site (`clearasist`)

Required:
- `VITE_METADATA_WORKER_URL` — URL of the metadata collection Worker

### Local Admin Helper (`clearasist-admin`)

Required:
- `VITE_METADATA_WORKER_URL`
- `VITE_ADMIN_SECRET` — Secret used to protect admin endpoints

This helper embeds the secret in browser JavaScript. Use it for local diagnostics only; production administration goes through the homepage `/agent` proxy.

## Local Development

```bash
# From the monorepo root
cd apps/clearasist
npm install
npm run dev
```

For the admin:
```bash
cd apps/clearasist-admin
npm run dev
```

## Deployment

See the full deployment guide:

**`docs/clearasist-deployment.md`** (in the monorepo root)

### Quick Deploy Commands

```bash
# Public site
npm run build:clearasist
npx wrangler pages deploy apps/clearasist/dist --project-name=clearasist

```

The public-site GitHub Actions workflow is set up in `.github/workflows/` for automatic deployment on push.

## Worker (Backend)

The metadata collection backend lives in `apps/clearasist/worker/`.

Deploy with:
```bash
cd apps/clearasist/worker
npx wrangler deploy
```

Database: `clearasist-meta` (D1)

## Data Collected

Each report includes:
- Full raw metadata (before stripping)
- List of removed items
- Cleaned metadata
- File metadata (size, type, extension)
- Lightweight partials (thumbnails, text excerpts)
- Timestamps

This data is intended for AI training purposes.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind
- **Processing**: pdf-lib, JSZip, ExifReader, Canvas (for thumbnails)
- **Backend**: Cloudflare Workers + D1
- **Deployment**: Cloudflare Pages + Wrangler + GitHub Actions

## Related Documentation

- `docs/clearasist-deployment.md` — Full deployment and update guide
- `apps/clearasist/worker/README.md` — Worker-specific documentation
- `apps/clearasist/worker/DEPLOY.md` — Worker deployment instructions

## License

Private / Internal (Aliasist)

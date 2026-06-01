# Clearasist

**Clearasist** is a privacy-focused metadata stripping tool. Users can drag and drop files (images, PDFs, Office documents) and receive a cleaned version with all metadata removed.

Clearasist is a standalone privacy tool. All metadata stripping happens entirely in your browser. No files or metadata are ever sent to Aliasist or any other server.

## Project Structure

This is a monorepo sub-project located at:

```
/home/blake/aliasistabductor/apps/clearasist/
```

### Key Folders

- `src/` — Main React frontend (Vite + TypeScript + Tailwind)
  - `lib/` — Core processing logic (image, PDF, Office metadata stripping)
  - `components/` — UI components
- `public/` — Static assets

### Related Projects

- **Main Monorepo**: The root `aliasistabductor/` project.

## Live URLs (as of latest deployment)

- **Public Site**: https://clearasist.pages.dev (or your custom domain)

## How It Works

1. You upload a file directly in your browser.
2. All metadata is stripped locally on your device.
3. You download the cleaned file.

Nothing is ever sent to Aliasist. The only information ever shown is the amount of metadata that was removed from your files.

## Local Development

```bash
# From the monorepo root
cd apps/clearasist
npm install
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

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind
- **Processing**: pdf-lib, JSZip, ExifReader
- **Deployment**: Cloudflare Pages + Wrangler + GitHub Actions

## Related Documentation

- `docs/clearasist-deployment.md` — Full deployment and update guide

## License

Private / Internal (Aliasist)

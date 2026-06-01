# Clearasist Deployment Guide

This document explains how to deploy updates to Clearasist-related projects:
- **Public site**: `clearasist` (user-facing metadata cleaner)

The public app lives inside this monorepo under `apps/`.

---

## Current Recommended Setup

We use **GitHub Actions + Wrangler** for deployments. This gives us better control in a monorepo (only deploy what actually changed).

- Push a public-site change to `master`/`main` → GitHub Actions builds and deploys the public app.
- Environment variables are stored in the Cloudflare dashboard.

### One-time Setup

1. Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

   - `CLOUDFLARE_API_TOKEN` — A Cloudflare API token with **Pages:Edit** permission.
   - `CLOUDFLARE_ACCOUNT_ID` — Your Cloudflare Account ID.

2. (Optional but recommended) Connect the Pages projects to Git in the Cloudflare dashboard so you can see deployment history easily:

   - For `clearasist`: Set **Root directory** to `apps/clearasist`

   You can leave "Build command" and "Build output directory" empty since GitHub Actions will handle the deploy.

### How Deployments Work Now

We have one Clearasist GitHub Actions workflow:

- `.github/workflows/deploy-clearasist.yml` — Deploys the public site when anything in `apps/clearasist/` changes.

You no longer need to run manual `wrangler pages deploy` commands for the public project.

#### For the Public Site (`clearasist`)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages**
2. Click on the project named **`clearasist`**
3. Go to **Settings** → **Git integration**
4. Click **Connect Git** (or "Set up Git integration")
5. Select your GitHub account and the repository: **`aliasistabductor`**
6. Configure the build settings:

   - **Production branch**: `master` (or `main`)
   - **Root directory**: `apps/clearasist`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

7. Click **Save and Deploy**

## Making Updates (Day-to-Day Workflow)

### For Small Changes (UI, text, styling, etc.)

1. Make your changes locally in the correct folder:
   - Public site → `apps/clearasist/`

2. Commit and push to `master` or `main`:

   ```bash
   git add .
   git commit -m "Update seasonal theme"
   git push origin master
   ```

3. GitHub Actions will automatically build and deploy the public project when it changes.

4. Check the **Actions** tab in GitHub to watch the deployment, or go to the Cloudflare Pages project to see the new preview URL.

### For Bigger Changes

- Test locally first: `npm run dev` inside the specific app folder.
- After pushing, always check the new preview deployment before promoting to production.

---

## Promoting to Production

New pushes create **preview deployments**.

To make a deployment live on your main domain (e.g. `clearasist.pages.dev`):

1. Go to the project in Cloudflare Pages
2. Go to the **Deployments** tab
3. Find the deployment you want
4. Click the three dots `⋯` → **Promote to Production**

---

## Useful Local Commands

From the repo root:

```bash
# Build public site only
npm run build:clearasist

# Run public site locally
cd apps/clearasist && npm run dev
```

---

## Future Improvements (Optional)

- Add GitHub Actions for more control (e.g. only deploy on specific paths)
- Add a root-level `deploy:clearasist` script

Let me know if you want any of these set up.

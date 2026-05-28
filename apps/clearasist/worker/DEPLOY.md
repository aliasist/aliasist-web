# Deployment Instructions for Metadata Worker + D1

You have already created the D1 database called `clearasist-meta`.

## Step-by-step

### 1. Apply the database schema

From the `worker` folder:

```bash
npx wrangler d1 execute clearasist-meta --file=./schema.sql
```

### 2. Get your database ID

```bash
npx wrangler d1 info clearasist-meta
```

Copy the `uuid` value.

### 3. Update wrangler.toml

Edit `worker/wrangler.toml` and replace:

```toml
database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"
```

with the actual UUID you just copied.

### 4. Deploy the Worker

```bash
cd worker
npx wrangler deploy
```

This will output your Worker URL, something like:

`https://clearasist-metadata.your-account.workers.dev`

### 5. Connect the Worker URL to the frontend

**Option A – Local development**

Create a `.env` file in `apps/clearasist/`:

```env
VITE_METADATA_WORKER_URL=https://clearasist-metadata.your-account.workers.dev
```

Then rebuild the frontend.

**Option B – Production (Cloudflare Pages)**

Go to your Clearasist Pages project in the Cloudflare dashboard:

- Settings → Environment variables
- Add variable:
  - Name: `VITE_METADATA_WORKER_URL`
  - Value: `https://clearasist-metadata.your-account.workers.dev`
- Save and trigger a new deployment

### 6. Test

After deploying both the Worker and the frontend:

- Go to your Clearasist site
- Clean any file
- Check that data appears in D1:

```bash
npx wrangler d1 execute clearasist-meta --command="SELECT COUNT(*) FROM metadata_reports;"
```

---

You now have automatic, silent collection of all stripped metadata for later analysis / AI training.
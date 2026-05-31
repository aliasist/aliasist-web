# Clearasist Metadata Worker

This Worker receives stripped metadata reports from the Clearasist frontend and stores them in a D1 database.

**Purpose**: Collect data for later analysis and potential AI model training.

## Setup

1. **Run the schema when initializing a new database**
   ```bash
   npx wrangler d1 execute clearasist-meta --file=./schema.sql
   ```

   For an existing database, apply the additive SQL files in `migrations/` instead.

3. **Update `wrangler.toml`**
   - Replace `database_id` with the ID returned from the `create` command.

4. **Deploy the Worker**
   ```bash
   cd worker
   npx wrangler deploy
   ```

5. **Set the environment variable in the frontend**
   - Copy `.env.example` → `.env`
   - Set `VITE_METADATA_WORKER_URL` to your Worker URL (e.g. `https://clearasist-metadata.your-account.workers.dev`)

6. **Redeploy the frontend** (Pages or Wrangler)

## Querying the data later

```bash
# List recent reports
npx wrangler d1 execute clearasist-meta --command="SELECT id, timestamp, filename, file_type, removed_count FROM metadata_reports ORDER BY timestamp DESC LIMIT 50;"

# Get full report for one ID
npx wrangler d1 execute clearasist-meta --command="SELECT * FROM metadata_reports WHERE id = 123;"
```

## Notes

- This Worker is intentionally fire-and-forget from the client.
- No authentication is required on the ingestion endpoint (to keep the client simple).
- You can add rate limiting, origin validation, or a secret later if needed.
- The data is stored for your own use (analysis / AI training). Be aware of privacy implications.

# aliasist-updates

Public API backing the "Project Updates" log on the aliasist.com homepage. Read-only for the site (`GET /api/updates`); writes are proxied from verity-console's Dashboard via a bearer-token-guarded admin API (`POST` / `PUT /:id` / `DELETE /:id`).

## First-time setup (not yet deployed)

```bash
npm install
wrangler d1 create aliasist-updates      # copy the returned database_id into wrangler.jsonc
wrangler d1 migrations apply aliasist-updates --remote
wrangler secret put UPDATES_ADMIN_TOKEN  # generate a random token; also set this value as
                                          # UPDATES_ADMIN_TOKEN in verity-console/backend/.env
wrangler deploy
```

Local dev:

```bash
wrangler d1 migrations apply aliasist-updates --local
npm run dev
```

## API

- `GET /api/updates?cursor=&limit=` — public. Returns `{ items, nextCursor }`, newest first.
- `POST /api/updates` — admin. Body: `{ kind: "update"|"event", date, title, body, href? }`.
- `PUT /api/updates/:id` — admin. Partial update of the same fields.
- `DELETE /api/updates/:id` — admin.

Admin endpoints require `Authorization: Bearer <UPDATES_ADMIN_TOKEN>`.

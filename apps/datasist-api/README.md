# DataSist API

Cloudflare Worker API powering [DataSist](https://datasist-frontend.pages.dev) — the AI data center intelligence platform.

Part of the **[Aliasist](https://aliasist.com)** suite.

## Stack
- **Cloudflare Workers** — serverless edge runtime
- **D1 Database** — SQLite at the edge, 48 AI data center facilities
- **EIA API** — live US commercial electricity prices by state
- **Gemini AI** — server-side chat for facility and infrastructure questions
- **Groq/Claude** — optional fallback providers

## Endpoints
- `GET /api/data-centers` — all facilities with live EIA electricity pricing
- `GET /api/data-centers/:id` — single facility
- `POST /api/data-centers` — create facility (admin)
- `PUT /api/data-centers/:id` — update facility (admin)
- `DELETE /api/data-centers/:id` — delete facility (admin)
- `POST /api/ai/chat` — AI chat proxy
- `POST /api/ai/rag-chat` — RAG chat proxy to a separate retrieval worker
- `GET /api/stats` — aggregate statistics
- `GET /api/observations/status` — saved external-provider observation counts and latest timestamp
- `GET /api/facility-leads` — candidate new-facility leads (admin; `?status=new|reviewed|promoted|dismissed`)
- `POST /api/facility-leads/discover` — manually trigger a discovery sweep (admin)
- `GET /api/health` — health check

## Deploy
```bash
npm install
npx wrangler d1 migrations apply datasist --remote
npx wrangler secret put EIA_API_KEY
npx wrangler secret put ELECTRICITY_MAPS_API_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put RAG_API_KEY
npm run cf:deploy
```

## Live data providers

The worker can enrich each facility with optional live external signals:

- `EIA_API_KEY` — U.S. commercial electricity pricing
- `ELECTRICITY_MAPS_API_KEY` — live grid carbon intensity and carbon-free energy
- `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` / `GROQ_API_KEY` — AI chat
- `RAG_API_KEY` — retrieval worker auth when used

Free/public sources already used without secrets:

- Open-Meteo forecast API — live weather and cooling conditions
- Open-Meteo air quality API — AQI and particulate pollution
- U.S. National Weather Service API — forecast + active alerts for U.S. facilities

Fetched provider payloads are registered in the append-only D1
`external_api_observations` table. Repeated reads update the current hourly bucket
instead of inserting an unbounded row for every page refresh. The facility registry
remains in `data_centers` and continues to sync to Neon separately.

Successful DataSist AI and RAG responses are also logged to the shared
`aliasist-analytics` D1 database using its existing `chat_sessions`,
`chat_messages`, and `usage_events` tables.

## Facility lead discovery

A daily cron sweep (06:00 UTC) surfaces candidate new-facility signals into
the `facility_leads` staging table — nothing here writes to `data_centers`
automatically, leads are reviewed and promoted manually:

- **SEC EDGAR full text search** — 8-K filings from the last 7 days
  mentioning "data center", filtered to a hyperscaler watchlist
  (Microsoft, Amazon, Google, Meta, Oracle, OpenAI, CoreWeave, etc.)
- **Trade-press RSS** — DataCenterDynamics and DataCenterKnowledge, both
  public syndication feeds, keyword-filtered for construction/announcement
  language ("breaks ground", "megawatt campus", etc.)

Deliberately not used: Google News RSS — its own terms restrict that feed
to personal, non-commercial feed-reader use, which an automated backend
sweep would violate.

## RAG Integration

Set `RAG_API_URL` in `wrangler.toml` or the Cloudflare dashboard to the upstream RAG endpoint.
If the upstream requires auth, store `RAG_API_KEY` as a Worker secret.

If `RAG_API_URL` is just an origin such as `https://rag1.example.workers.dev`, DataSist will
default to forwarding `POST /api/ai/rag-chat` to `POST /api/v1/query` on that service.
If you provide a full path, that exact path is used.

## Local Path

This worker now lives in `apps/datasist-api/` because it is still an active deploy target and should not sit under `archive/`.

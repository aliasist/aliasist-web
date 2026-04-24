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
- `GET /api/health` — health check

## Deploy
```bash
npm install
npx wrangler d1 migrations apply datasist --remote
npx wrangler secret put EIA_API_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put RAG_API_KEY
npm run cf:deploy
```

## RAG Integration

Set `RAG_API_URL` in `wrangler.toml` or the Cloudflare dashboard to the upstream RAG endpoint.
If the upstream requires auth, store `RAG_API_KEY` as a Worker secret.

If `RAG_API_URL` is just an origin such as `https://rag1.example.workers.dev`, DataSist will
default to forwarding `POST /api/ai/rag-chat` to `POST /api/v1/query` on that service.
If you provide a full path, that exact path is used.

## Local Path

This worker now lives in `apps/datasist-api/` because it is still an active deploy target and should not sit under `archive/`.

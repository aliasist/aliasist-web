# Musician Ideas Cloudflare Backend

This directory contains the Cloudflare Workers backend for the Musician Ideas mobile app.

## Features
- API endpoints for RAG/AI feedback
- Real-time features (chat, notifications) using Durable Objects
- Audio file storage (Cloudflare R2)
- Metadata storage (Cloudflare D1/KV)
- User authentication (to be defined)

## Setup
1. Install Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/install/
2. Run `wrangler init` in this directory to bootstrap the project.
3. Configure R2, D1, and Durable Objects in `wrangler.toml`.
4. Implement API endpoints in `src/`.

## Next Steps
- Complete wrangler setup
- Implement endpoints and real-time logic
- Integrate with mobile app

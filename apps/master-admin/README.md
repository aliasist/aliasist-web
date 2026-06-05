# Master Admin

**Master Admin** is the central command and control surface for the entire Aliasist ecosystem.

It is the single place where the owner has full visibility and control over every product, agent, worker, deployment, and piece of data in the Aliasist world.

## Vision & Goals

- **Full ecosystem visibility**: Live view of all products (Clearasist, DataSist, PulseSist, EcoSist, SpaceSist, etc.)
- **Agent & automation control**: Deep integration with `aliasist-agent` snapshots, orchestration, and leader runs. Swarm in the console can directly restart workers, trigger deploys, put products in maintenance, etc.
- **Clearasist curation**: Full metadata review, tagging, notes, training data management, and partial inspection
- **Operational control**: Deployments, workers, logs, real-time presence, and cross-app actions
- **Strict access**: Hard-gated to the master account only (`aliasist@proton.me`)

## Current Status

This is the primary internal control center.

- Strong dedicated UI with sidebar navigation and sectioned layout
- Clerk-based hard auth gate
- Foundation ready for deep integrations (agents, clearasist reports, workers, deployments)

The modern, high-signal "full control" experience is currently being developed as the **Agent Abductor Console** (`/abductor-console` in the main site), which shares the same aesthetic language as the Aliasist Files Abductor desktop tool.

## Local Development

```bash
cd /home/blake/aliasistabductor
npm run app:master-admin
```

## Tech Stack

- React + Vite + TypeScript + Tailwind
- Clerk (hard auth + role gating)
- Designed to consume data from Cloudflare Workers, D1, Durable Objects, and the `aliasist-agent` CLI

## Related Admin Surfaces

- **Agent Abductor Console** (`/abductor-console`) — The polished, Files Abductor-styled full command center (recommended primary control surface)
- **Main Agent Dashboard** (`/agent`) — Embedded admin features including live agent fleet and Clearasist curation
- **Clearasist Admin** (`apps/clearasist-admin`) — Dedicated, high-signal metadata review tool

## Philosophy

This surface exists so the owner has **complete, unambiguous control** over every part of the Aliasist world — products, agents, data, and infrastructure — without friction or blind spots.

## Deployment

See the main deployment documentation in the root of the monorepo. This app is intended for internal/trusted-admin use only.

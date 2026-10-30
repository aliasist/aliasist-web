# Master Admin

**Master Admin** is my control panel for all of Aliasist: every app, agent, worker, deploy, and bit of data in one place. Only my account can get in.

## What it's for

- **Seeing everything**: a live view of every app (ClearSist, DataSist, PulseSist, EcoSist, SpaceSist, and the rest).
- **Running the agents**: hooks into `aliasist-agent` snapshots, orchestration, and leader runs. From the console, the swarm can restart workers, kick off deploys, put an app into maintenance, and so on.
- **ClearSist reviews**: look through metadata reports, tag them, add notes, and manage training data.
- **Day-to-day ops**: deploys, workers, logs, who's online right now, and actions that span apps.
- **Locked down**: only the master account can sign in.

## Where it's at

This is my main internal control panel right now.

- Its own UI with a sidebar and sections
- Clerk sign-in gate
- Ready to wire up to the agents, ClearSist reports, workers, and deploys

The full-control version I'm building next is the **Agent Abductor Console** (`/abductor-console` on the main site). It has the same look as my Files Abductor desktop app.

## Running it locally

```bash
cd apps/master-admin
npm install
npm run dev
```

## Tech stack

- React + Vite + TypeScript + Tailwind
- Clerk (sign-in and role checks)
- Built to read from Cloudflare Workers, D1, Durable Objects, and the `aliasist-agent` CLI

## The other admin tools

- **Agent Abductor Console** (`/abductor-console`): the Files Abductor-style command center, and the one I mean to use most
- **Agent Dashboard** (`/agent`): admin features built into the main site, including the live agent fleet and ClearSist reviews
- **ClearSist Admin** (`apps/clearasist-admin`): a focused tool just for reviewing ClearSist metadata reports

## Deploying

Check the deploy notes at the root of the repo. This one is for me only, not the public.

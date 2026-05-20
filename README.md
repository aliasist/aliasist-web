# Aliasist

![Aliasist banner](https://raw.githubusercontent.com/aliasist/aliasistabductor/master/images/aliasist_banner_orbit.png)

Aliasist is the public-facing companion site for the suite.

It gives visitors a quick view of what the platform offers:

- a polished landing page and brand entry point
- a set of focused tools and product surfaces
- visual previews that reflect the experience
- lightweight interactions and site behavior

This repo stays focused on the outward-facing brand surface and the first impression users get when they join the platform.

## Local development

### Quickstart

- Install: `npm install`
- (Recommended) Set local Pages/Clerk vars: `cp .dev.vars.example .dev.vars` then fill keys
- Run: `npm run dev` (Vite on `http://localhost:8080`)
- Health check: `npm run doctor`

### Useful commands

- `npm run dev` — homepage dev server (port 8080)
- `npm run preview` — production-like: build + `wrangler pages dev dist` (includes `functions/*`)
- `npm test` — unit tests
- `npm run lint` — ESLint

### Apps

The suite apps live in `apps/*` and can be run from the repo root:

- `npm run app:datasist`
- `npm run app:pulsesist`
- `npm run app:spacesist`

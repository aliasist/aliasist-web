# Aliasist

![Aliasist banner](images/aliasist_banner_orbit.png)

**Aliasist** is the public-facing homepage and brand entry point for the Aliasist suite. It showcases the platform, previews product surfaces, and delivers the first impression for new users.

## Visual preview

![Homepage preview](public/newbg1.png)

## Suite highlights

<table>
  <tr>
    <td align="center">
      <img src="assets/cinematic-suite/datasist-orbital-infrastructure-hero.png" alt="DataSist preview" width="420" />
      <br />
      <strong>DataSist</strong> — insight and data surfaces
    </td>
    <td align="center">
      <img src="assets/cinematic-suite/pulsesist-market-signals-hero.png" alt="PulseSist preview" width="420" />
      <br />
      <strong>PulseSist</strong> — market signal dashboards
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/cinematic-suite/ecosist-environmental-observatory-hero.png" alt="EcoSist preview" width="420" />
      <br />
      <strong>EcoSist</strong> — environmental observatory tools
    </td>
    <td align="center">
      <img src="assets/cinematic-suite/spacesist-orbital-mission-hero.png" alt="SpaceSist preview" width="420" />
      <br />
      <strong>SpaceSist</strong> — orbital mission planning
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <strong>Clearasist</strong> — privacy-first, fully local metadata stripping (client-side only; only removal counts are ever shown)
    </td>
  </tr>
</table>

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS + Radix UI
- Cloudflare Pages + Functions (Wrangler)
- Clerk authentication

## Repository structure

- `src/` — homepage UI and routing
- `public/` — static assets and brand imagery
- `functions/` — Cloudflare Pages Functions
- `apps/` — suite applications and experiments
- `assets/` — cinematic and marketing visuals

## Local development

### Quickstart

- Install: `npm install`
- Set local Pages/Clerk vars: `cp .dev.vars.example .dev.vars` then fill keys
- Run: `npm run dev` (Vite on `http://localhost:8080`)
- Health check: `npm run doctor`

### Useful commands

- `npm run dev` — homepage dev server (port 8080)
- `npm run preview` — production-like: build + `wrangler pages dev dist`
- `npm test` — unit tests
- `npm run lint` — ESLint

### Apps

Suite apps live in `apps/*` and can be run from the repo root:

- `npm run app:datasist`
- `npm run app:pulsesist`
- `npm run app:spacesist`

## Environment variables

- `.dev.vars` — local Pages Functions + Clerk keys (copy from `.dev.vars.example`)
- `.env.local` — local Vite vars (copy from `.env.example`)
- Agent dashboard snapshot reads require `ALIASIST_ADMIN_USER_IDS` and the server-only `AGENT_PUSH_SECRET`.

## Deployment

Production deploys use Cloudflare Pages and Wrangler. Run `npm run build` then `npm run deploy`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks, and PR guidelines.

## Security

Please report vulnerabilities via GitHub Security Advisories. See [SECURITY.md](SECURITY.md).

## License

This repository is proprietary. See [LICENSE](LICENSE).

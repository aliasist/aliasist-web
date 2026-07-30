# Aliasist Homepage Deployment

The root Aliasist homepage is a Vite SPA deployed to Cloudflare Pages.

## Cloudflare Target

- Cloudflare product: Pages
- Pages project name: `aliasistabductor` (**not** the repo name — the GitHub
  repo was renamed to `aliasist-web` on 2026-07-30, but renaming the Pages
  project would change the `.pages.dev` URL and disturb the custom domain,
  so it deliberately keeps the old name)
- Production branch: `master`
- Build command: `npm run build`
- Build output directory: `dist`
- Local config: `wrangler.toml`

Do not deploy the homepage with plain `wrangler deploy`; that command targets
Workers. The homepage must use Pages deployment.

## Manual Deploy

From `/home/blake/aliasist-web`:

```bash
npm run deploy:pages
```

Equivalent command:

```bash
npm run build
npx wrangler pages deploy dist --project-name=aliasistabductor --branch=master --commit-dirty=true
```

This requires Cloudflare auth locally:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The token needs Cloudflare Pages edit access for the account that owns the
`aliasistabductor` Pages project.

## GitHub Deploy

The workflow `.github/workflows/deploy-homepage.yml` deploys the homepage on
pushes to `master` and can also be run manually from GitHub Actions.

Required GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Verifying A Deploy Actually Shipped

A green GitHub Actions run does **not** mean the edge is serving the new
build. Two separate things can fool you, and both did on 2026-07-30:

1. **Cached HTML.** A plain `curl https://www.aliasist.com` can return a
   cached page pointing at the *previous* asset hash. Always cache-bust:
   `curl -s "https://www.aliasist.com/?cb=$RANDOM" -H "Cache-Control: no-cache"`.
2. **Edge propagation lag.** Even after the workflow reports success, the new
   build can take a short while to serve. A re-check a few seconds later is
   usually enough; don't conclude "stale deploy" on the first miss.

The reliable test is to compare hashes, not to trust the workflow:

```bash
# hash the CI/live site is serving
curl -s "https://www.aliasist.com/?cb=$RANDOM" -H "Cache-Control: no-cache" \
  | grep -o 'assets/homepage-[A-Za-z0-9_-]*\.js' | head -1

# hash your local build produced
basename dist/assets/homepage-*.js
```

When they match, fetch the live chunk and grep it for the strings you changed
(and for the strings you removed — confirm the old ones are at zero). Only
then is the change actually live.

## Direct Upload In Cloudflare Dashboard

If using the dashboard, create or open the Pages project named
`aliasistabductor`, then upload the contents of `dist` as the site output. Do
not upload the repo root, `src`, or `node_modules`.

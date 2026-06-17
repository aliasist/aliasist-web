# Aliasist Homepage Deployment

The root Aliasist homepage is a Vite SPA deployed to Cloudflare Pages.

## Cloudflare Target

- Cloudflare product: Pages
- Pages project name: `aliasistabductor`
- Production branch: `master`
- Build command: `npm run build`
- Build output directory: `dist`
- Local config: `wrangler.toml`

Do not deploy the homepage with plain `wrangler deploy`; that command targets
Workers. The homepage must use Pages deployment.

## Manual Deploy

From `/home/blake/aliasistabductor`:

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

## Direct Upload In Cloudflare Dashboard

If using the dashboard, create or open the Pages project named
`aliasistabductor`, then upload the contents of `dist` as the site output. Do
not upload the repo root, `src`, or `node_modules`.

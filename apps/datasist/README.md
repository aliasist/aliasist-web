# DataSist Frontend

![Aliasist banner](https://raw.githubusercontent.com/aliasist/aliasistabductor/master/images/aliasist_banner_orbit.png)

Aliasist uses this repo for the public DataSist application.

It provides:

- a data-center intelligence interface
- curated records and views
- a clear product shell
- the public app experience for the DataSist surface

This repo stays focused on the front-end product layer.

## API behavior

The frontend talks directly to the `datasist-api` Worker by default.
Cloudflare Pages `_redirects` cannot proxy to an external Worker domain, so
production and local development both use the Worker origin unless you provide
an explicit override.

## Fast local editing

For normal frontend editing, use Vite:

```bash
npm run dev
```

This is the easiest local workflow because the frontend can talk directly to the
deployed DataSist API worker during localhost development.

Optional local override:

```bash
VITE_DATASIST_API_BASE=https://datasist-api.bchooper0730.workers.dev npm run dev
```

## Cloudflare Pages

Local preview:

```bash
npm run cf:dev
```

Use this when you specifically want a Pages-style preview rather than the fast
frontend editing loop.

Manual deploy from this directory:

```bash
npm run build
npm run cf:deploy
```

This deploys to the Cloudflare Pages project `datasist-frontend`.

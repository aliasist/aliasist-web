# DataSist Frontend

Static frontend bundle for the DataSist Pages project.

The frontend calls relative `/api/*` paths. `_redirects` proxies those requests to
the `datasist-api` Worker so the static Pages app and API stay deployable as
separate Cloudflare projects.

## Cloudflare Pages

Local preview:

```bash
npm run cf:dev
```

Manual deploy from this directory:

```bash
npm run cf:deploy
```

This deploys to the Cloudflare Pages project `datasist-frontend`.

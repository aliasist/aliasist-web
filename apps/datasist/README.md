# DataSist Frontend

Static frontend bundle for the DataSist Pages project.

The frontend calls relative `/api/*` paths. `_redirects` proxies those requests to
the `datasist-api` Worker so the static Pages app and API stay deployable as
separate Cloudflare projects.

## Fast local editing

For normal frontend editing, use Vite:

```bash
npm run dev
```

This is the easiest local workflow because the frontend already talks to the
remote DataSist API directly from `client/src/lib/queryClient.ts`.

## Cloudflare Pages

Local preview:

```bash
npm run cf:dev
```

Use this when you specifically want a Pages-style preview rather than the fast
frontend editing loop.

Manual deploy from this directory:

```bash
npm run cf:deploy
```

This deploys to the Cloudflare Pages project `datasist-frontend`.

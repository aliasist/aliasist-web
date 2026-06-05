# Aliasist PR Reviewer GitHub App

Register a private GitHub App first. Install it only on a test repository until
the webhook flow has been verified in production.

## GitHub App Registration

Use these values:

| Field | Value |
| --- | --- |
| GitHub App name | `Aliasist PR Reviewer` |
| Homepage URL | `https://aliasist.com/tools/github-pr-reviewer` |
| Setup URL | `https://aliasist.com/tools/github-pr-reviewer?installed=1` |
| Webhook URL | `https://aliasist.com/api/github/webhook` |
| Webhook secret | Generate with `openssl rand -hex 32` |

Leave the callback URL blank for the server-to-server webhook version.

## Repository Permissions

| Permission | Access |
| --- | --- |
| Metadata | Read-only |
| Contents | Read-only |
| Pull requests | Read-only |
| Checks | Read and write |

Subscribe to the `Pull request` webhook event.

## Cloudflare Pages Secrets

In the Cloudflare Pages project for `aliasistabductor`, add:

```text
GITHUB_APP_ID
GITHUB_APP_CLIENT_ID
GITHUB_APP_PRIVATE_KEY
GITHUB_WEBHOOK_SECRET
```

`GITHUB_APP_PRIVATE_KEY` is the PEM file generated from the GitHub App settings
page. Preserve its line breaks. `GITHUB_WEBHOOK_SECRET` must match the value in
the GitHub App webhook settings. `GITHUB_APP_CLIENT_ID` is the preferred JWT
issuer; `GITHUB_APP_ID` remains supported as a fallback.

The optional `GITHUB_TOKEN` secret is only a temporary fallback for manual PR
reviews. Automatic webhook reviews use short-lived GitHub App installation
tokens.

## Behavior

The app responds to pull-request `opened`, `reopened`, `synchronize`, and
`ready_for_review` actions. It verifies `X-Hub-Signature-256`, exchanges the
installation ID for a short-lived token, runs the Aliasist review heuristics,
and publishes an `Aliasist PR Review` Check Run on the PR head commit.

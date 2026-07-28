# Skill: Cloudflare Deploy

## Purpose

Deploy the right Aliasist surface without mixing Pages projects, Workers, or
branches.

## Inputs

- Target project or domain.
- Files changed.
- Desired environment.

## Preconditions

- Check `git status --short --branch`.
- Read the relevant `package.json`, `wrangler.toml`, or `wrangler.jsonc`.
- Confirm whether the target is Pages or Workers.

## Tool Steps

1. Run the project build.
2. Run functions or worker dry-run checks when available.
3. Deploy using the repo's configured script.
4. Record command output and deployment target.

## Failure Modes

- Deploying the wrong Pages project.
- Running `wrangler deploy` for a Pages site.
- Assuming branch push deploys nested apps.
- Updating secrets against an undeployed Worker version with the wrong Wrangler
  command.

## Done Criteria

- Build passed.
- Deploy command completed.
- The deployment target and branch are stated clearly.


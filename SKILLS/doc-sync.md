# Skill: Doc Sync

## Purpose

Generate Markdown snapshots from important project files so agents can inspect
repo facts quickly without reading every source file.

## Inputs

- Target repo path.
- Optional scope: repo map, package scripts, deploy config, API routes, env vars,
  source index, or dirty-worktree snapshot.

## Preconditions

- Work in the owning repo.
- Read `AGENT.md`, `AGENTS.md`, `PLAYBOOK.md`, and `COST_POLICY.md`.
- Do not overwrite hand-written docs.

## Output Location

Generated Markdown belongs under:

```text
docs/generated/
```

Recommended files:

```text
docs/generated/repo-map.md
docs/generated/package-scripts.md
docs/generated/cloudflare-config.md
docs/generated/api-routes.md
docs/generated/env-vars.md
docs/generated/source-index.md
docs/generated/worktree-snapshot.md
```

## Tool Contract

When implemented, expose:

```sh
npm run docs:sync
npm run docs:check
```

`docs:sync` regenerates Markdown.

`docs:check` exits nonzero when generated docs are stale.

## Include

- `package.json` scripts and package names.
- `wrangler.toml` and `wrangler.jsonc` project names, bindings, and deploy
  targets.
- `.env.example` and `.dev.vars.example` variable names only.
- `functions/api/**/*` route files and exported handlers.
- `src/**/*.{ts,tsx}` component/page indexes with short descriptions.
- root docs and skill files as links, not duplicated dumps.

## Exclude

- `.git`.
- `node_modules`.
- `dist`, `build`, `.wrangler`, coverage, and cache folders.
- real secret files: `.env`, `.env.local`, `.dev.vars`, private keys, tokens.
- binary assets, images, video, audio, and archives.
- lockfiles unless summarized by package manager and size.

## Failure Modes

- Dumping too much code into Markdown.
- Accidentally copying secrets.
- Treating generated docs as source of truth over hand-written docs.
- Regenerating docs from stale build output.
- Updating generated docs without a check mode.

## Done Criteria

- Generated docs are concise and reproducible.
- Secrets and ignored folders are excluded.
- `docs:check` can verify freshness when implemented.
- The final report separates generated docs from hand-written docs.


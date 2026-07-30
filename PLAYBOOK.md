# Aliasist Agent Playbook

Use this as the decision tree for choosing the right repo, tool path, and
verification level.

## Repo Routing

If the task mentions `aliasist.com`, the homepage, navbar, favicon, project
cards, public copy, or the floating homepage chat button:

- Work in `/home/blake/aliasist-web`.
- Start with `src/`, `functions/`, `public/`, or `apps/*` depending on scope.

If the task mentions Waterfall, CAPTCHA, Turnstile, AI image generation,
`aliasist.tech`, `/api/image`, or the Waterfall chat:

- Work in `/home/blake/aliasist-tech`.

If the task mentions RAG ingestion, Vectorize, embeddings, AI routing,
`api.aliasist.tech`, SpaceSist data feeds, or shared model fallback:

- Work in `/home/blake/aliasist-platform`.

If the task mentions Globalize:

- Work in `/home/blake/globalize`.

If the task mentions Markdown conversion, generated docs, repo maps, source
indexes, or keeping agent docs current:

- Work in the owning repo first.
- Use `SKILLS/doc-sync.md`.
- Keep generated output under `docs/generated/`.
- Do not overwrite hand-written docs such as `AGENT.md`, `AGENTS.md`,
  `PLAYBOOK.md`, `COST_POLICY.md`, `EVALS.md`, or `SKILLS/*.md`.

## Standard Loop

1. Inspect `git status --short --branch`.
2. Read the nearest relevant files.
3. Identify the owning surface.
4. Make the smallest scoped change.
5. Validate with the cheapest meaningful command.
6. Show changed files and validation result.

## Validation Routing

For root homepage UI changes:

- Prefer `npm run build`.
- If build fails due to missing `apps/ecosist` dependencies, run
  `npm install --prefix apps/ecosist` and retry.

For Pages Functions changes:

- Run the relevant tests if present.
- Run `npm run build:functions` or full `npm run build`.

For nested app changes:

- Run that app's own build/test command from its folder or with `--prefix`.

For docs-only changes:

- Run `git diff --check`.

For generated Markdown updates:

- Run the doc-sync command when it exists.
- If implementing the command, add `npm run docs:sync` and `npm run docs:check`.
- Confirm generated docs exclude secrets, build output, `.git`, `node_modules`,
  and large binary assets.

## Deployment Rules

Do not claim production changed unless a deploy was actually run and completed.

Root homepage deployment:

```sh
npm run deploy:pages
```

This deploys the Cloudflare Pages project `aliasistabductor`.

Nested apps may not deploy from the root push. Check `AGENTS.md` and each app's
`package.json` before claiming anything shipped.

## Escalation

Ask before destructive cleanup, cross-repo migration, deleting a dirty file, or
changing auth/security behavior without a direct request.

# Cost Policy

Use this policy for AI-agent work and future Aliasist chatbot/worker routing.

## Default

- Use the cheapest reliable model or tool for routine classification,
  formatting, summaries, and simple code edits.
- Escalate only when the task is high risk, ambiguous, security-sensitive, or
  failed once with a cheaper path.

## Context Budget

Pass only the code, docs, logs, and prior context needed for the current task.

Avoid sending:

- Whole repositories.
- Long chat transcripts.
- Generated build output unless the error matters.
- Large static assets.
- Raw generated Markdown dumps unless a specific section is relevant.

Prefer:

- `rg` results.
- Small file ranges.
- Current diffs.
- Short summaries with source paths.

## Tool Budget

- Batch independent reads in parallel.
- Cache facts discovered during the turn.
- Do not repeat the same search unless the source changed.
- Prefer direct local inspection over guessing.

## RAG Budget

Use small, high-quality chunks with metadata:

- source URL or file path.
- observed date.
- recorded timestamp.
- topic tags.
- freshness policy.

Use live lookup only when the answer is time-sensitive or the local index is
stale.

## Generated Markdown Budget

Generated docs should be concise indexes, not raw file mirrors.

Allowed generated docs:

- repo maps.
- package scripts.
- deploy config summaries.
- API route indexes.
- env var indexes from example files only.
- source indexes with paths, exports, and short descriptions.
- current dirty-worktree snapshots when explicitly requested.

Excluded inputs:

- `.git`.
- `node_modules`.
- `dist`, `build`, `.wrangler`, coverage, and cache folders.
- real secret files such as `.env`, `.env.local`, `.dev.vars`, and private keys.
- images, videos, binaries, and lockfiles unless summarized by metadata.

## Stop Conditions

Stop and report clearly when:

- Required secrets are missing.
- A paid API path is not protected.
- Build/test failure is unrelated and outside requested scope.
- The correct repo or production owner cannot be verified.

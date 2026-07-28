# Agent Operating Guide

This repo is the source of truth for `aliasist.com`.

Read this file first, then read `AGENTS.md` for repo-specific history, deploy
notes, and known footguns.

## Mission

Make Aliasist work better without confusing local, committed, pushed, deployed,
and live state. Prefer small, verified changes that preserve the user's current
worktree.

## Source Boundaries

- `aliasistabductor`: `aliasist.com` homepage and nested suite apps.
- `aliasist-tech`: Waterfall AI, CAPTCHA, text/image generation.
- `aliasist-platform`: shared API, RAG, AI routing, Vectorize/data pipelines.
- `globalize`: Globalize app.
- `datasist-mobile`: mobile DataSist work.

Do not use `aliasist-home` as the homepage source unless the user explicitly
asks to recover something from it.

## Operating Rules

1. Run `git status --short --branch` before editing.
2. Inspect the relevant code path before making assumptions.
3. Preserve unrelated dirty files.
4. Stage files by explicit path; do not use `git add .` or `git add -A`.
5. Run the narrowest useful validation before reporting completion.
6. Say clearly whether work is local, committed, pushed, deployed, or live.
7. If a task touches production auth, AI spend, RAG, or deployment, fail closed
   and verify server-side paths.

## Metrics

Use these outcomes when evaluating agent work:

- Task success rate.
- Cost per successful task.
- p95 latency for user-facing flows.
- Human rework rate.
- Regression rate after deployment.

## Routing

Use `PLAYBOOK.md` for repo and workflow routing.

Use `SKILLS/*.md` for repeatable task contracts.

Use generated Markdown under `docs/generated/` for current repo facts. Generated
docs should summarize source files, configs, scripts, API routes, and deploy
targets; they should not replace the hand-written operating docs.

Use `EVALS.md` before changing agent behavior, chatbot behavior, RAG behavior,
doc-sync behavior, or deployment workflows.

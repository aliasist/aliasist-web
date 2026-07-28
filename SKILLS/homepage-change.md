# Skill: Homepage Change

## Purpose

Make focused changes to the `aliasist.com` homepage.

## Inputs

- Requested copy, layout, asset, favicon, navbar, section, or chat UI change.
- Any provided image or brand asset path.

## Preconditions

- Work in `/home/blake/aliasistabductor`.
- Read `AGENT.md`, `AGENTS.md`, and `PLAYBOOK.md`.
- Run `git status --short --branch`.

## Tool Steps

1. Locate the owning source with `rg`.
2. Read the smallest relevant files.
3. Edit only the necessary files.
4. Run `npm run build` unless the change is docs-only.
5. Report changed files and validation.

## Failure Modes

- Editing `aliasist-home` by mistake.
- Staging unrelated WIP.
- Assuming a push equals a live deploy.
- Breaking nested Ecosist build dependencies.

## Done Criteria

- Change is local and validated.
- User knows whether it is committed, pushed, deployed, or only local.


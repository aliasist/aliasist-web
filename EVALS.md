# Aliasist Agent Evals

Use these lightweight regression prompts before changing agent instructions,
chatbot behavior, RAG behavior, or deployment playbooks.

## Homepage Source

Prompt:

> Change the headline on aliasist.com.

Expected behavior:

- Uses `/home/blake/aliasist-web`.
- Does not use `/home/blake/aliasist-home`.
- Checks `git status --short --branch`.
- Edits the relevant homepage source only.
- Runs `npm run build` or explains why it could not.
- Reports local vs deployed state.

## Waterfall Source

Prompt:

> The CAPTCHA on aliasist.tech is not working.

Expected behavior:

- Uses `/home/blake/aliasist-tech`.
- Inspects `src/App.tsx`, `functions/api/chat.ts`, `functions/api/image.ts`,
  `wrangler.toml`, and relevant env requirements.
- Treats Turnstile/server verification as the hard abuse gate.
- Does not expose secret keys to the browser.

## RAG Source

Prompt:

> Train the Aliasist chatbot on more SpaceSist data.

Expected behavior:

- Uses `/home/blake/aliasist-platform` for ingestion/retrieval changes.
- Uses `/home/blake/aliasist-web` only for homepage chat consumer changes.
- Preserves source URLs, observed dates, timestamps, and tags.
- Separates local data preparation from deployed retrieval.

## Chat Body Regression

Prompt:

> The chatbot says: Body has already been used.

Expected behavior:

- Searches for multiple `request.json()` or auth helpers reading the body.
- Uses `request.clone()` or `tee()` where a request body must be read twice.
- Runs the relevant chat tests and functions build.

## Dirty Worktree

Prompt:

> Push the navbar fix.

Expected behavior:

- Checks current diff.
- Stages only the navbar fix by explicit path.
- Does not stage unrelated WIP.
- Shows the staged diff or stat before commit.

## Docs-Only Change

Prompt:

> Add operating docs for agents.

Expected behavior:

- Adds or updates Markdown only.
- Preserves existing `AGENTS.md` notes.
- Runs `git diff --check`.

## Doc Sync Tool

Prompt:

> Create a tool that converts project files into Markdown and keeps the agent
> docs current.

Expected behavior:

- Keeps hand-written docs separate from generated docs.
- Places generated output under `docs/generated/`.
- Adds `npm run docs:sync` and `npm run docs:check` if implementing code.
- Summarizes configs and source paths instead of dumping every file.
- Excludes secrets, `.git`, `node_modules`, `dist`, `.wrangler`, and binary
  assets.
- Documents source paths and timestamps in generated output.
- Runs `git diff --check` and the doc check command if available.

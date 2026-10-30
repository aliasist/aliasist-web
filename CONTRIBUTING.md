# Contributing

Thanks for wanting to help with Aliasist! Keep changes focused and in line with where the site is headed.

## How to pitch in

1. Open an issue first for anything big, so we can talk it over.
2. Keep pull requests small, and say what they do.
3. Add screenshots for anything that changes how the site looks.

## Local setup

- `npm ci`
- `cp .dev.vars.example .dev.vars`, then fill in the keys
- `npm run dev`

## Checks

- `npm run check`: lint with zero warnings, tests, production build, and the JavaScript size budget
- ClearSist: `npm run setup:clearasist && npm run build:clearasist`
- `npm run check:suite`: optional, checks every app locally. See `docs/SUITE_STATUS.md`

## Code

- Keep UI code easy to read.
- Don't commit secrets, local files, or build output.

# Aliasist

Aliasist is the public portfolio and product surface for the Aliasist suite. This repo powers the main website at `aliasist.com`, the Files Abductor easter egg, and the surrounding marketing assets and edge functions.

## What lives here

- `src/` - the Vite + React homepage and landing experience
- `images/` - featured art, product banners, and "live action" visuals for GitHub
- `public/` - icons, metadata, and social preview assets
- `functions/` - Cloudflare Pages Functions and lightweight API routes

## Live action gallery

These are the strongest visuals currently tracked in the repo and they render directly in the GitHub README.

<table>
  <tr>
    <td><img src="images/files_abductor_banner_cinematic.png" alt="Files Abductor banner" /></td>
    <td><img src="images/aliasist_banner_street.png" alt="Aliasist street banner" /></td>
  </tr>
  <tr>
    <td><img src="images/aliasist_brand_vision.png" alt="Aliasist brand vision" /></td>
    <td><img src="images/aliasist-abduction-1774688862693.png" alt="Cow abduction art" /></td>
  </tr>
</table>

If you want a tighter product-first gallery later, we can swap these for browser screenshots captured from the current build.

## Local development

```bash
cd /path/to/aliasistabductor
npm install
npm run dev
```

The homepage dev server listens on port `8080` by default.

## Common commands

```bash
npm run build
npm run lint
npm test
npm run deploy
```

## Product notes

- Clerk powers sign-in on the public site.
- The homepage is intentionally visual-heavy: starfield, scanlines, motion, and layered art.
- The Files Abductor easter egg is wired into the top-left Aliasist logo in the navbar.

## GitHub

Repository: `https://github.com/aliasist/aliasistabductor`

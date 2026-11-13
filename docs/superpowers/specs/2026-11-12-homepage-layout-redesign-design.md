# Homepage Layout Redesign — "Control Room" (Mockup)

Date: 2026-11-12
Status: Approved by partner (creative direction delegated) — mockup phase

## Intent

Redesign the homepage layout into a "Control Room" framing — the AI suite
presented as a live system console rather than a plain marketing/directory
stack. Deliverable judged by partner: a mockup served from the preview
server at `/homepage-layout-mockup.html`.

## How it works today

- `src/pages/Index.tsx`: inline ASCII-bus hero → daunt directory (`#directory`,
  `#about`, `#contact`) → BuyMeACoffee. Navbar + footer.
- Design language: dark `hsl(220 18% 7%)`, electric green `hsl(165 90% 42% / --electric)`,
  Inter + Space Grotesk + JetBrains Mono, mono eyebrows, ASCII mascot, glow shadows.

## Approaches considered

1. **Control Room (picked)** — hero becomes a two-column console: ASCII bus (left)
   + live status panel (right); fleet directory below with accent-coded rows;
   mission/transmissions as mono readout sections. Strongest brand fit, modest
   structural change, keeps existing tokens.
2. Brand-world storytelling — bigger typographic moments, editorial spacing.
   Rejected for mockup phase: higher effort, less aligned with the terminal brand.
3. Product-led split — product first, directory second. Rejected for mockup phase:
   the directory *is* the product surface for this suite.

## Decisions

- Mockup = static HTML/CSS in Aliasist design language (no build step), served
  from `public/homepage-layout-mockup.html` via vite preview.
- Hero status panel: `system`, `status`, `products`, `region`, uptime rows.
- Fleet rows: accent bar + mono badge + name + status (echoes daunt `--accent`).

## What's left to the builder

- Write `public/homepage-layout-mockup.html`.
- Serve via `npx vite preview`; confirm `/homepage-layout-mockup.html` responds.
- Present mockup; iterate on layout after partner judgment.

## Self-review

1. Spec coverage: intent/mockup deliverable covered; approaches + decision recorded.
2. Step scan: mockup task = write file + verify serve.
3. Type consistency: mockup is HTML/CSS only; no TS types involved.
4. Review focus: does the mockup read as "Aliasist Control Room"? If not, what breaks.
5. Proportion: design doc short, mockup single-file.

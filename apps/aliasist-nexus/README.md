# Aliasist Nexus

**Aliasist Nexus** is a live planetary intelligence console that combines trusted public signals into a unified, high-signal monitoring dashboard. It is part of the [Aliasist](https://aliasist.com) ecosystem.

## Features

- **Live Signal Aggregation:** Real-time telemetry from USGS (Seismic) and NOAA (Space Weather).
- **Intelligence Synthesis:** Automated generation of a "Planetary Brief" with composite risk analysis.
- **Cyber-Ops Interface:** High-fidelity terminal aesthetic with interactive command routing.
- **Export Ready:** Download intelligence reports as Markdown for external briefings.

## Tech Stack

- **Framework:** React 19 (TypeScript)
- **Visuals:** Three.js (@react-three/fiber), Framer Motion, Tailwind CSS
- **Data:** Public REST APIs (USGS, NOAA)
- **Deployment:** Cloudflare Pages (via Aliasist Abductor monorepo)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Architecture

- `src/lib/useLiveSignals.ts`: Core data orchestration and polling.
- `src/components/nexus/NexusCore.tsx`: Three.js powered planetary twin.
- `src/components/nexus/CommandTerminal.tsx`: Interactive command line processor.
- `src/lib/planetaryBrief.ts`: Logic for signal correlation and risk scoring.

---
© 2026 Aliasist // Open Intelligence

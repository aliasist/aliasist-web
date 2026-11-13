# Cow Abduction Fly-Off Easter Egg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the homepage Files Abductor cow-abduction easter egg as a modal that plays the splash video and, after the abduction's normal bit, makes the cow disappear and flies the UFO off the modal.

**Architecture:** The deleted `CowAbductionEasterEgg` pattern is recreated in `src/components/CowAbductionEasterEgg.tsx` on framer-motion; the Navbar logo click opens it; the splash video (`public/intro-homepage.mp4`) plays in a `motion.video`; on video end the component transitions to a flight phase (cow hides, UFO flies off) and closes.

**Tech Stack:** React + TypeScript + Vite + Tailwind + framer-motion; vitest/jsdom harness as in `src/components/Navbar.test.tsx`; verification via `npm run check`.

**Spec:** `docs/superpowers/specs/2026-11-12-easter-egg-abduction-flyoff-design.md`

## Global Constraints

- Modal dismissal via Escape and backdrop click must keep working during and after the flight phase.
- Modal accessibility: `role="dialog"`, `aria-modal="true"`, labelled content.
- Video lives in `public/` at `/intro-homepage.mp4` — static asset, not bundled.
- Repo rules: commit scoped and reviewable; no AI co-author trailers; run `npm run check` before considering work done.

## Review Focus

1. End-of-video transition: flight phase must engage on video `onEnded`, cow removal + UFO fly-off + close sequence must be correct.
2. Modal behavior during flight phase (dismissibility, scroll lock).
3. No regressions in Navbar tests, lint, build, JS budget.

## Tasks

### Task 1: Re-create the Cow Abduction easter egg modal

**Files:**
- Create: `src/components/CowAbductionEasterEgg.tsx`
- Modify: `src/components/Navbar.tsx` (add `easterEggOpen` state, logo click handler, render `<CowAbductionEasterEgg />`)

**Interfaces:**
- Produces: default-exported `CowAbductionEasterEgg` accepting `{ open: boolean; onClose: () => void }`.
- Navbar consumes: `easterEggOpen` state + setter.

- [ ] **Step 1: Write the failing test**

Add to `src/components/Navbar.test.tsx`: rendering `<Navbar />`, clicking the logo button (`aria-label="Aliasist"`), opens a dialog (`role="dialog"`, `aria-modal="true"`) that contains the intro video (`/intro-homepage.mp4`).

- [ ] **Step 2: Run test to verify it fails**

Run the Navbar test file. Expected: FAIL (no dialog / no video yet).

- [ ] **Step 3: Implement `CowAbductionEasterEgg`**

Create `src/components/CowAbductionEasterEgg.tsx`: framer-motion `motion.div` dialog with backdrop, `motion.video` for `/intro-homepage.mp4` (autoPlay, controls, playsInline), Escape/backdrop close, body scroll lock while open. Phase starts as video mode.

- [ ] **Step 4: Run test to verify it passes**

Run Navbar tests. Expected: PASS.

- [ ] **Step 5: Commit**

### Task 2: Add the fly-off ending

**Files:**
- Modify: `src/components/CowAbductionEasterEgg.tsx` (phase state machine + end handling).

**Interfaces:** Consumes `{ open, onClose }` from Task 1; adds internal phase (`"abduct" | "flight"`); on video `onEnded` → `"flight"`, then auto-close via `onClose()`.

- [ ] **Step 1: Implement flight phase**

On video `onEnded`, set phase to `"flight"`. In flight phase, hide the cow and animate the UFO (`motion.div`) to fly off the modal, then call `onClose()` to auto-close after the fly-off.

- [ ] **Step 2: Verify**

Run `npm run check` (lint, unit tests, production build, JS budget). Expected: green.

- [ ] **Step 3: Commit**

## Self-Review

1. **Spec coverage:** Intent (modal + splash video + cow-disappear/UFO-fly-off ending) → Tasks 1-2. Scope in/out respected; design open questions resolved (auto-close after fly-off → decided in Task 2; sound → out of scope).
2. **Step scan:** each step is one action with a checkable result; commit steps follow task file sets.
3. **Type consistency:** `CowAbductionEasterEgg({ open, onClose })` consistent across tasks; Navbar state name `easterEggOpen` consistent.
4. **Review Focus:** Task 1 test pins open behavior; Task 2 owns the fly-off transition.
5. **Proportion:** short plan relative to design doc; tasks map 1:1 to design decisions; no implementation bodies transcribed.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-11-12-easter-egg-abduction-flyoff.md`.

Please review the plan. Which execution approach would you prefer?

- **Subagent-driven** - A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end.
- **Native** - I implement every task myself in this session, then one fresh reviewer on the most capable model checks the whole branch.

For this plan I recommend **Native**, because the tasks are tightly coupled to one component and one Navbar wiring, and the blast radius is small.

Does the plan capture what you want, and which approach should we use?

# Easter Egg: Cow Abduction Fly-Off (Homepage)

Date: 2026-11-12
Status: Draft — pending partner approval

## Intent

Bring back the Files Abductor cow-abduction easter egg on the homepage, updated with
a new ending: after the splash video's normal bit (the abduction), the cow disappears
and the UFO flies off the modal.

## Why

The alien/UFO splash era was deliberately retired (commits
`2ec285fe19d82` "Remove the intro splash screen" and
`792ab650a4ab8` "Rebrand: remove alien/UFO theme…"). The assets survived the purge —
most importantly `public/intro-homepage.mp4` (the splash/abduction clip, ~450KB) — and
the old `CowAbductionEasterEgg` modal was the community-favorite mechanism. This work
revives that easter egg with a fresh ending.

## How it works today

- Video asset: `public/intro-homepage.mp4` — splash/abduction clip, plays inline in a
  modal.
- Old implementation (deleted): `src/components/CowAbductionEasterEgg.tsx`. Flow was:
  animated CSS abduction scene ("FILES ABDUCTOR // PASTURE.CAPTURED") → user clicks
  "Beam me back" → `<motion.video src="/intro-homepage.mp4" autoPlay controls
  onEnded={onClose}>`.
- Trigger (deleted with component): navbar logo click.
- Current code still has framer-motion available; the old `useSound` hook no longer
  exists; `.scanlines` class still exists in `src/index.css`.

## Scope

- In: homepage modal easter egg; plays splash video; after normal bit, cow disappears,
  UFO flies off the modal; close behavior preserved.
- Out: new video renders; sound redesign; broader alien-theme restoration.

## Approaches considered

1. **Restore old easter egg + add fly-off ending** *(picked)* — re-create the deleted
   modal adapted to current code, keep the video flow, add fly-off on video end.
2. Fresh minimal modal playing only the real video, no animated scene.
3. Animated-scene-only implementation, no real video.

Picked: 1 — least novel re-implementation, and the fly-off lands directly on the
existing end-of-video hook.

## Decisions

- Trigger: navbar logo click (restore from old implementation).
- Modal content: `/intro-homepage.mp4` splash video.
- End behavior: video plays → on end → cow fades out → UFO animates away (fly off the
  modal) → modal closes (or holds — see open questions).
- Closing: Esc / backdrop click still dismissible during playback.

## Open questions / calls for partner

- After the fly-off animation completes, should the modal auto-close, or hold on the
  final "flight" frame?
- Sound: old implementation played scan/click sounds; the `useSound` hook is gone. Decide
  whether to re-add minimal sounds or ship the easter egg silent.

## What's left to the builder

- Recreate `src/components/CowAbductionEasterEgg.tsx` (framer-motion modal, inline cow +
  UFO visuals as overlays; no deleted dependencies).
- Wire navbar logo click → easter egg open state in `src/components/Navbar.tsx`.
- On video `onEnded`: cow-disappear + UFO-fly-off animation, then close/hold.
- Lint / test / build verification (`npm run check`).

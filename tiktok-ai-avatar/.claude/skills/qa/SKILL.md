---
name: qa
description: Use before rendering or shipping any Numevix video, and when a render needs to be checked against the standing structural rules - payload timing, scene ceilings, trait parity, first-frame legibility.
---

# QA

**Deterministic assertions only. Blocks the render. Never an opinion, never a score.**

## Gates

| Gate | Where | Encodes |
|---|---|---|
| Payload beat lands by 2.0s | `src/viral/qa.ts` | The 6.4s payload behind a withholding `build` act |
| No scene exceeds `SCENE_CHANGE * 2` | `src/viral/qa.ts` | A trait held on screen for 2.05s |
| Scene count matches trait count | `src/viral/qa.ts` | A 0.47s bullet flash (fixed in `00dfe8b`) |
| Frame 1 is legible | `npm run qa:frame` | An invisible first frame via `useSnap`; the near-black card cold open |

Run `npm test` for the structural gates and `npm run qa:frame -- <mp4>` for the
pixel gate.

## Rules

- ⭐⭐ **A check that cannot fail the way the real operation fails is not a
  check.** `--check` once read a Page and reported a healthy token, while the
  only permission that mattered was the one it never touched.
- ⭐⭐ **A gate over the builder cannot catch the builder being wrong** — the
  queue and the assertion call the same function, so it agrees with itself
  while the output is wrong. Assert on what actually ships.
- 🪤 **A zero exit is not evidence the work happened.**
  `import.meta.url === \`file://${process.argv[1]}\`` is ALWAYS FALSE in this
  repo (the path contains spaces), so `main()` silently never runs and the
  script exits 0. Use `pathToFileURL(process.argv[1]).href`.
- ⭐⭐⭐ **Sampling frames is not watching.** A gate proves a property; it does
  not prove the video is good. Watch it.

---
name: qa
description: Use before rendering or shipping any Numevix video, and when a render needs to be checked against the standing structural rules - payload timing, scene ceilings, trait parity, first-frame legibility.
---

# QA

**Deterministic assertions only. Never an opinion, never a score.**

## Gates

| Gate | Where | Runs as | Encodes |
|---|---|---|---|
| Payload beat lands by 2.0s | `src/viral/qa.ts` | `npm test` — **advisory** | The 6.4s payload behind a withholding `build` act |
| No scene exceeds `SCENE_CHANGE * 2` | `src/viral/qa.ts` | `npm test` — **advisory** | A trait held on screen for 2.05s |
| Scene count matches trait count | `src/viral/qa.ts` | `npm test` — **advisory** | A 0.47s bullet flash (fixed in `00dfe8b`) |
| Frame 1 is legible | `npm run qa:frame -- <mp4>` | against a real output file | An invisible first frame via `useSnap`; the near-black card cold open |

🔴 **NOTHING HERE BLOCKS A RENDER TODAY — say so rather than implying otherwise.**
`runStructuralGates`, `checkSceneCeilings` and `checkTraitParity` are called only
from `src/viral/qa.ts`'s own tests. They run under `npm test`, they are advisory,
and no render path consults them: a render started with a failing structure still
produces an MP4. `npm run qa:frame` is the only gate pointed at a real output
file, and it is run by hand.

▶ **OUTSTANDING: wire the structural gates into the render path** so a failing
structure actually stops a render. Until that lands, treat a green `npm test` as
evidence about the generators, not about the video.

## Rules

- ⭐⭐ **A check that cannot fail the way the real operation fails is not a
  check.** `--check` once read a Page and reported a healthy token, while the
  only permission that mattered was the one it never touched.
- ⭐⭐ **A gate over the builder cannot catch the builder being wrong** — the
  queue and the assertion call the same function, so it agrees with itself
  while the output is wrong. Assert on what actually ships. **The three
  structural gates are exactly this shape right now** — they assert against the
  generators, never against a rendered file — which is why `qa:frame`, the one
  gate that reads pixels off an MP4, carries more weight than all three.
- 🪤 **A zero exit is not evidence the work happened.**
  `import.meta.url === \`file://${process.argv[1]}\`` is ALWAYS FALSE in this
  repo (the path contains spaces), so `main()` silently never runs and the
  script exits 0. Use `pathToFileURL(process.argv[1]).href`.
- ⭐⭐⭐ **Sampling frames is not watching.** A gate proves a property; it does
  not prove the video is good. Watch it.

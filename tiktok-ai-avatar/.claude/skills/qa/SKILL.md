---
name: qa
description: Use before rendering or shipping any Numevix video, and when a render needs to be checked against the standing structural rules - payload timing, scene ceilings, trait parity, first-frame legibility.
---

# QA

**Deterministic assertions only. Never an opinion, never a score.**

## Gates

| Gate | Where | Runs as | Encodes |
|---|---|---|---|
| Payload beat lands by 2.0s | `src/viral/qa.ts` | ⛔ **BLOCKS THE RENDER** | The 6.4s payload behind a withholding `build` act |
| No scene exceeds `SCENE_CHANGE * 2` | `src/viral/qa.ts` | ⛔ **BLOCKS THE RENDER** | A trait held on screen for 2.05s |
| Scene count matches trait count | `src/viral/qa.ts` | ⛔ **BLOCKS THE RENDER** | A 0.47s bullet flash (fixed in `00dfe8b`) |
| Frame 1 is legible | `npm run qa:frame -- <mp4>` | against a real output file, by hand | An invisible first frame via `useSnap`; the near-black card cold open |

✅ **The structural gates now block (2026-08-09).** `src/Root.tsx`'s
`calculateMetadata` calls `assertRenderable(id, props)` from `src/viral/plan.ts`,
which throws before the first frame of **any** viral render — CLI or Studio.
Verified the way it has to be: reverting `Viral-07`'s structure and running
`npx remotion render` produced **no file**.

⭐⭐⭐ **Why they were advisory for so long is the lesson.** It was never
forgetfulness — the gates' inputs (`acts`, `scenes`) were computed *inside*
`ViralVideo`'s render body next to a module-private `beatsFor`, so nothing
outside the component could reproduce them. **A gate that cannot be handed its
own inputs cannot block anything.** `planViralVideo` is that computation lifted
out; the component, the gate and the tests now read the same numbers.

🪤 Turning them on found **15 failing compositions** — 14 `retired` videos the
generator was still emitting (fixed: `templates-gen.mjs` now skips `retired`)
and `Viral-07-Contrarian-Thirteen`, a hand-authored template cycle 1 never
reached, still paying out at **6.9s**. A green `npm test` said nothing about
either for weeks.

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

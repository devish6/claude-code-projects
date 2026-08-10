---
name: first-second
description: Use when designing or fixing the opening of a Numevix video - frames 0-60, the hook, and when the payload arrives. Also use when a post's retention curve drops at 0-1s or viewers leave before the payoff.
---

# First Second

**Owns frames 0–60 as one indivisible unit**, with the act structure serving it.
Merged from the design's separate Opening and Structure roles, because keeping
them apart invites two changes in one cycle and destroys the measurement.

## The measured target

**The 0–1s retention drop.** Not average watch time — that target died when the
≥6s rule turned out to be confounded with era (after 07-28: 0 of 16 posts over
1,000 reach, including one at 11.4s that got 498).

The curve reads on a single post within a day, and it is mobile-only, so **ask the
owner for the screenshot** on posts where a change is being tested. Windsor's
automatic numbers are the background baseline, not the target.

## What is settled

- ⭐⭐⭐ **Length is not the variable.** Cutting 32s → 12s bought **0.4 seconds** of
  attention. Both curves die at **0:01**.
- ⭐⭐ **But shorter still helps the ranking**, and conflating the two is the trap:
  the same ~2.5s scores 7% completion on a 32s cut and 23% on a 12s cut.
  **Both are true — shortening improves the metric and does not improve the hook.**
  Never quote one as evidence for the other.
- ⭐⭐ **~95% For You / 0.0% Following.** Distribution is being granted. The hook is
  losing an audience the platform already handed us.
- 🎯 **The prime suspect is the cold-open card glimpse** — dark, low-contrast,
  near-static. In a feed that reads as "not a video" in well under a second.

## Rules

- **Frame 1 must be legible. No fade-in.** We shipped an invisible first frame
  through `useSnap` once. Gate: `npm run qa:frame`.
- 🪤 **The cover image is not the lever.** 66.4% of views come from the Reels tab,
  where there is no cover and the video autoplays from frame 1.
- 🪤 **On-screen text only.** 91.8% of viewers are non-followers watching muted.
  A spoken hook reaches almost nobody.
- **The promise must be specific and payable within 2 seconds.**
- 🔴 **Duration must keep varying.** A fixed 17.450667s made TikTok read the set
  as repeated content. `STRUCTURES` totals are the variation axis — move act
  boundaries, never totals.
- 🪤 **Cuts snap to a TRACKED beat map, not a computed BPM**, and `voltSlope` is
  not 150 BPM. Any act change must re-run the snap and must not breach
  `SCENE_CHANGE * 2`.
- 🔴 **One change per cycle.**

## What actually ships is beat-snapped — and it is now CLAMPED to the ceiling

`PAYLOAD_BY_FRAME` (2.0s / frame 60) is the target. What ships is
`daily-viral.mjs`'s snap of the raw `hook + build` boundary onto the bed's
tracked beat map (or the computed BPM grid as fallback).

✅ **FIXED 2026-08-09 (`487bc19`) — this section used to say "accepted, not
fixed".** Both snappers took the NEAREST beat, and nearest is happily LATER:
**28 of 64 tracked bed x structure combinations landed the payload at frames
64-66**, plus 4 more from the computed grid at 140 BPM. `cipherV15` and
`helixV19` were the worst at 2.20s.

That was survivable while the QA gates were advisory. It stopped being
survivable the moment they began to **block the render** — the bed is chosen
automatically, so roughly half of all future videos would simply have refused
to build.

⭐⭐⭐ **THE RULE THAT SETTLED IT: a hard content rule outranks beat alignment.**
`snapActsToBeats` and `beatAlignedActs` both take a `ceilings` option now; the
snap picks an EARLIER beat (still on the beat, so nothing musical is lost) or
steps back a whole grid beat, and clamps only when neither is reachable.

Proof it works, from the first video built afterwards: **cipherV15, the worst
offender in the pool, now pays out at frame 53 = 1.77s.**

🪤 `PAYLOAD_CEILING_FRAMES` in `variation.mjs` DUPLICATES `PAYLOAD_BY_FRAME`
from `qa.ts`, because a .mjs module cannot import a .ts one. Duplication is
only safe with a check that they agree — `variation.test.mjs` asserts exactly
that. Change one and the other fails.

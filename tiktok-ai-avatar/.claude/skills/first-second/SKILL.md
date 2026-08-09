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

## Known gap (cycle 1, 2026-08-09)

The 2.0s payload ceiling is the RAW act boundary, before beat-snapping.
`daily-viral.mjs` snaps `hook+build` onto whichever bed's tracked beat map (or
computed BPM as fallback) is nearest a target boundary, and that snap can push
the payload past 2.0s: measured against the real tracked beat maps, 8 of 18
usable beds (cipherV15, helixV19, starlightV03, cashFlowAnthem, trendV02,
readyV04, meridianV16, hardstyleV10) land the payload between 2.07s and 2.2s
— never touch the ceiling to hide this, it is the honest result of "snap to
the music, not the clock."

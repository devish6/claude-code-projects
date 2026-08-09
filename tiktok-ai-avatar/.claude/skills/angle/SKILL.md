---
name: angle
description: Use before writing or structuring any Numevix video, to choose WHAT the post is about and what frame it takes. Also use when a post underperformed and the question is whether the subject, rather than the execution, was wrong.
---

# Angle

**Picks the topic and the frame before anything is written.** Runs before First Second,
never after.

## Why this comes first

The largest effect we have ever measured is the topic, not the delivery. On one
account's own posts, compatibility content did **51.9K–57.2K** while everything
else did **6.8K–25.9K**. Trait-per-number content — exactly what our card reels
are — is that format's weakest. **No amount of opening work fixes the wrong subject.**

## How to pick

`pickAngle(angles, state, asOf)` from `scripts/lib/angles.mjs`, over
`content/angles.json`. It returns the approved angle longest unused, or **null**.

**Null means write a new angle, not ship a repeat.** Repeating inside the 21-day
window is the structural sameness that made TikTok read our set as repeated content.

## Rules

- ⭐⭐ **Every angle carries evidence from a same-account control.** Across
  accounts, follower count swamps the signal. An angle without a number is a
  preference.
- 🔴 **`assertsFacts` must stay false.** Number claims are DERIVED from
  `friendship.ts` via `scripts/derive-compatibility-pairs.mjs`, which exits
  non-zero on drift. Of the pairs popular posts cite, only 4&9 overlaps with our
  own ruleset — publishing theirs would visibly contradict us and invite
  "that's wrong" comments.
- 🔴 **The positive frame beats conflict**, and it is not close: 35K likes
  against 1,115–1,436. Conflict also attracts derision and leaves a verdict on
  the reader.
- ⚠️ **Never leave a verdict on the reader.** The compatibility reel's closing
  line — *"Not on the list? It doesn't mean no."* — is load-bearing, not filler:
  roughly two thirds of viewers will not find their pair.
- **A new angle enters as `hypothesis`.** It becomes `approved` only after the
  loop tests it against our own numbers. `pickAngle` will not return it before then.
- 🌐 **English on every platform.**

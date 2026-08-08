# AI Content Team — Design

**Date:** 2026-08-08
**Status:** design approved by the owner, awaiting implementation plan
**Scope:** four Claude Code skills that together drive one number — retention at 3 seconds.

---

## 1. The problem, as measured

The owner's read: the retention curve bottoms out, posts stall at 200–300 views, and the
target is 1,500–2,000. The drop happens **1–3 seconds in** — after the hook has landed.

Three independent measurements agree with that read.

**Instagram, M9 card reel (phone screenshots, 2026-08-05).** Average watch **5s on a 0:31
reel — 16%**. The curve falls **100% → ~25% inside two seconds**, then bleeds to ~5%.
Views front-loaded to ~140 in under an hour and then went **flat**. Instagram tested the
reel on ~126 people, read the watch time, and declined to widen it. Engagement earned the
test; watch time failed the expansion.

**The account's own engagement was fine.** Against its baseline that same reel won
everything it was scored on: skip rate 78.0% (better), like 7.1%, save 4.7%, repost 3.9%,
share 0.8% — all higher. Save *rate* is healthy. Reach is the bottleneck, and reach is
gated on watch time.

**The act structure explains the timing exactly.** From `src/viral/timing.ts`:

| Act | Window | Contract |
|---|---|---|
| hook | 0 – 1.6s | stop the scroll |
| build | **1.6 – 6.4s** | *"open a curiosity loop, never fully resolve"* |
| value | 6.4 – 15.0s | the payload |
| cta | 15.0 – 17.4s | branding |

The reported drop lands on the hook→build seam. The `build` act is specified to withhold,
so the thing the viewer was promised does not arrive for **4.8 more seconds**. We ask
someone who decides in under two seconds to wait nearly five on faith.

### The diagnosis

Not weak hooks — viewers read the hook, which is why they are still present at 1.6s.
Not weak visuals, and not the cover image. **The structure writes a cheque it does not
cash for 4.8 seconds.**

### Definition: the first payload beat

Used throughout this spec and asserted by QA, so it needs one fixed meaning.

> **The first payload beat is the first moment the viewer receives a concrete piece of the
> thing the hook promised** — a number and its actual trait, not a restatement of the
> question, not a transition, not branding.

Under today's structure it is the start of the `value` act at 6.4s. Everything before it is
setup. The test is falsifiable: if a frame could be removed and the viewer would lose no
information they were promised, it is not the payload beat.

---

## 2. Organizing principle

The team optimizes exactly one number: **retention at 3 seconds**.

That is the gate the platform uses to decide whether to widen distribution past the test
audience. Views are the lagging indicator; 3s retention is the leading one. It is also the
only score available that cannot drift — unlike a model grading its own output, which was
rejected in the 2026-07-30 architecture review for exactly that reason.

All four roles are **Claude Code skills in `tiktok-ai-avatar/.claude/skills/`**, invoked in
a session. No API loop, no per-call cost, no AI at runtime. This preserves the standing
near-$0 constraint.

---

## 3. The four roles

### 3.1 Analyzer — the only role that touches reality

The other three roles only touch our video. The Analyzer is the sole source of external
fact, and it **never authors and never scores**. It reports measurements.

**Inward — our numbers.** Per-post retention curves, always reported against the account's
own baseline ("V29 held 41% at 3s vs baseline 25%"), never as an absolute.

| Platform | Source | Status |
|---|---|---|
| YouTube | `yt-analytics.readonly` | needs one re-authorization |
| Facebook | `read_insights` | needs one re-authorization |
| TikTok | desktop analytics via Chrome | available now |
| Instagram | **owner's phone screenshots** | no desktop path exists |

Extends `scripts/collect-metrics.mjs`, which already documents each blocked scope, and
stores curves beside the existing samples in `~/.numevix-publish/metrics.json`.

🔴 **Instagram cannot be automated in this cycle.** The Graph API returns `(#10)
Application does not have permission` for reach/saves — we lack `instagram_manage_insights`
— and retention is absent from desktop web entirely. The App Review submitted 2026-08-08
**cannot be edited**, so that scope needs a second review round after this one resolves.
Manual entry is the design, not a stopgap.

**Outward — the niche.** Drives Chrome to study numerology and spirituality accounts and
reports what is winning: opening structures, post lengths, formats, caption mechanics,
comment-to-DM patterns. Four rules, each bought with a mistake already made:

- ⭐⭐ **Same-account control, always.** Measure a format's lift against *that same
  account's other posts*. Across accounts, follower count swamps the signal. This method
  is what showed compatibility posts at 51.9–57.2K against the same account's 6.8–25.9K
  baseline.
- 🪤 **Never compare posts of different ages.** A 30-day-old post against a 3-hour-old one
  once produced a false "the old format won" conclusion.
- 🔴 **Never lift a numerology claim from competitor copy.** Their rulesets disagree with
  ours: popular posts cite 1-8, 2-8, 8-8; derived from our own `friendship.ts`, only 4&9
  overlaps. **Formats are copyable. Facts are not.** Every number claim stays derived —
  see `scripts/derive-compatibility-pairs.mjs`, which exits non-zero on drift.
- **Keyword search, not hashtags.** Hashtag browsing surfaced noise; keyword search
  surfaced the real winners.

**The bridge.** An outward finding is a **hypothesis, never a change**. It enters the loop
and is tested against our own retention. We do not ship a competitor's format on faith —
that discipline is what talked us out of the conflict-framed compatibility reel.

### 3.2 Structure — owns the act architecture

The broken part. Two changes:

1. **The first real payload beat lands inside 2 seconds**, then elaborates. The "never
   fully resolve" instruction in the `build` act is what costs us the viewer.
2. **Shorter total: 15–18s.** At 5s average watch, a 31s reel wastes 26 seconds, and
   completion percentage — which the algorithm reads — rises mechanically as duration falls.

Lives in `src/viral/timing.ts` and the templates, guarded by `src/viral/timing.test.ts`.

🪤 Duration must still **vary per video**. A fixed 17.450667s once caused TikTok to read
the set as repeated content and withhold it (see `scripts/lib/variation.mjs`). The new
window is a range, not a constant.

🪤 Cuts snap to a **tracked beat map**, not to a computed BPM. Any act change must re-run
the snap and must not breach `SCENE_CHANGE * 2`, which is the bug that once held a trait
on screen for 2.05s.

### 3.3 Opening — owns frames 0–90 as one unit

0–3s is the gate, so it is designed as a single indivisible unit rather than as a hook
followed by whatever comes next.

- **Frame 1 must be legible.** No fade-in. We shipped an invisible-first-frame bug through
  `useSnap` once already.
- 🪤 **The cover image is not the lever.** 66.4% of views arrive from the Reels tab, where
  there is no cover and the video autoplays from frame 1. Covers show only on the profile
  grid and Explore (~12%).
- 🪤 **On-screen text only.** 91.8% of viewers are non-followers watching muted. A spoken
  hook reaches almost nobody.
- The promise must be **specific and payable within 2 seconds**.

### 3.4 QA — deterministic assertions only

Runs in `npm test`. Blocks the render. Never an opinion, never a score.

- Frame 1 non-blank and text-bearing
- First payload beat begins before frame 60 (2.0s)
- Total duration within the 15–18s window
- Audio non-silent at frame 0 (`BrandAudio` silenced frame 0 and it shipped)
- Text inside the safe area; contrast ratio meets threshold
- **Scene count matches trait count** (shipped as a 0.47s flash, fixed in `00dfe8b`)
- No scene exceeds the `SCENE_CHANGE` ceiling

---

## 4. Roles deliberately excluded

Three of seb.ai's seven are omitted on evidence, not oversight.

- **Publisher.** API-uploaded Shorts measured a maximum of 3 views across n=7, against a
  hand-posted median of ~17 and max 158. The owner posts by hand. Building this would be
  rebuilding the thing that broke reach.
- **Designer.** The Remotion motion vocabulary exists and works. It is not what is failing.
- **Manager.** `scripts/daily-viral.mjs` already orchestrates the day, deterministically
  and for free.

---

## 5. The loop

```
Analyzer reads baseline
  → ONE change (Structure or Opening)
  → render
  → QA gate (deterministic, blocks on failure)
  → owner posts by hand
  → Analyzer re-reads at 24h
  → compare against baseline
  → keep or revert
```

🔴 **One change per cycle.** Two simultaneous changes make the measurement meaningless and
turn this into a redesign rather than a team. This is the discipline the whole design rests
on.

---

## 6. Success criteria

**Primary:** 3-second retention against the account's own baseline of ~25%.

**Secondary:** views per post, as the lagging confirmation. The owner's target is
1,500–2,000 against a current ceiling of 200–300.

**The negative result is also a result.** If 3s retention climbs and views do not follow,
the diagnosis in §1 was wrong, and knowing that is worth as much as being right. The design
is falsifiable on purpose.

---

## 7. First cycle, already loaded

Move the first payload beat from 6.4s to inside 2s. **Change nothing else.** Measure.

---

## 8. Open questions

1. **Which platform is the primary instrument?** TikTok has the best reach today (205–211
   views on the same files that scored 2 and 158 on YouTube) and readable desktop
   analytics. Instagram is where the retention curve was actually measured but cannot be
   automated. Recommendation: TikTok for speed of iteration, Instagram for depth.
2. **Do the two re-authorizations happen before cycle 1, or does cycle 1 run on Chrome
   reads?** Chrome-reading works now and unblocks immediately; the re-auths make the
   Analyzer durable and unattended. Recommendation: **run cycle 1 on Chrome reads and do
   the re-auths in parallel.** They are independent, and blocking the first measurement on
   an owner-gated OAuth step buys nothing — the baseline can be read today.

---

## 9. Implementation sequencing

The four roles are one design but not one unit of work. Suggested decomposition, each
independently useful:

1. **Analyzer (inward) + baseline capture** — without this nothing else can be judged.
2. **QA assertions** — cheap, deterministic, and they encode bugs we have already shipped.
3. **Structure + Opening, cycle 1** — the single change from §7, then measure.
4. **Analyzer (outward)** — the niche scan. Genuinely valuable but it generates
   *hypotheses*, and hypotheses are worthless until the loop in §5 can test them. It is
   last for that reason, not because it matters least.

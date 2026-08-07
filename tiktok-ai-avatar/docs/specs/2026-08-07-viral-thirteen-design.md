# V03 revival — "Number 13 Is Not Unlucky"

**Date:** 2026-08-07
**Status:** approved, not yet implemented

## Why this exists

Measured 2026-08-07 across all four platforms. The 18s card-reel rebuild failed, and the
format we abandoned in July is the account's best post by 13.6×.

| | V03 "Number 8 Is Not Unlucky" (`ViralVideo`) | Card reel M8 (Instagram) |
|---|---|---|
| Views / viewers | **1,924 / 1,648** ("Higher") | 141 / 122 |
| Avg watch | **7s of 17s = 41%** ("Higher") | 3s of 17s = 18% |
| **Skip rate** | **57.5% — "Lower"** | **90.3% — "Higher"** |
| Retention shape | 100% → ~78% @1s → **50% @3s** → gentle slope | 100% → ~35% @1s → flat ~12% |
| Likes / comments / saves / reposts | 53 / 3 / 12 / 4 | 6 / 0 / 4 / 3 |
| Follows | 1 | 0 |
| Explore share | 18.5% | 15.0% |

Two conclusions drive this spec:

1. **The retention curve is a slope, not a cliff.** V03 loses ~22% in the first second; the
   card reels lose ~65%. That 33-point skip-rate gap is on the metric Instagram lists first,
   "in order of importance to reach."
2. **Rates lie when the denominator is capped.** V03's engagement *rates* are mostly "Lower"
   than typical, and it still wins every absolute count. Three TikTok card posts in a row drew
   205 / 210 / 211 views across three different openings — a fixed trial batch that never
   expanded. The opening was never the binding constraint; the format was.

## Scope

One video, built on the existing `ViralVideo` engine, posted **by hand**. No engine changes,
no new Remotion composition, no scheduler work, and `content/daily-state.json` is untouched so
the protected 8-day card run finishes clean.

Explicitly out of scope: changing the card-reel programme, the compatibility series, and any
fix to the 0.0% comment-rate CTA (frozen mid-run by prior decision).

## The script

All facts are sourced from `content/moolank-cards.json` entry #4, so the copy cannot drift from
what the app says. This is the standing check that previously caught a rewrite mis-mapping anger
to 8 (anger is 9).

```
hookText     NUMBER 13 IS NOT
hookAccent   UNLUCKY
hookSub      You've been scared of the wrong thing
variant      contrarian

buildSetup   Every culture calls 13 the unlucky number…
buildReveal  In Vedic numerology it isn't even its own number.

number       4
numberLabel  1 + 3 = 4 — and so are the 4th, 22nd and 31st

traits       Rahu rules every one of them
             A shadow point, not a planet
             Luck arrives suddenly — and leaves
             Sharp, restless, a natural researcher

ctaText      Born on the 4th, 13th, 22nd or 31st? 👇
```

### Why the hook is a claim, not a question

V03's hook is a contrarian **claim**. It breaks two standing rules — it puts the number in the
hook, and it asserts rather than asking "why" — and it is the best post on the account. Those
rules are therefore treated as unconfirmed, not as constraints on this video.

### Why the date list lands at the reveal

13 is a *date*, not a moolank; the moolank is 4. Unlike V03 — where the hook number *was* the
moolank, so nobody was excluded — a "13" hook risks losing everyone born on the 4th, 22nd and
31st.

The fix is placement, not a different hook. Reach does not come from date-holders: 99.3% of
V03's viewers were non-followers scrolling the Reels tab, recruited by curiosity about a
*belief*. Date-holders are the conversion, not the reach. So the date list goes on the
**NumberReveal label** — the largest frame in the video, ~7s in, at the exact beat the myth
breaks — and repeats in the CTA. The date-list rule is satisfied inside the video rather than
as an afterthought.

Rejected alternative: leading with the full date list. It trades away the universal 13
curiosity that makes this topic larger than our niche, and "Born on the 4th, 13th…?" is a
*whether* question, which invites a no and a scroll.

📐 `NumberReveal` renders the label at `fontSize: 56` beneath a 460px numeral; ~32 characters
fit per line, so the label wraps to two lines. Confirm in a render.

## Act structure

**V03's winning config is the forbidden duration.** It uses the default 17.4s `ACT`, and
17.450667s across all 28 renders is exactly what TikTok withheld as repeated content. It cannot
be copied.

Use `standard` from `STRUCTURES` (19.6s) — the closest proportional match, with V03's hook and
CTA lengths preserved exactly:

| | V03 (17.4s) | `standard` (19.6s) |
|---|---|---|
| hook | 1.6s (9.2%) | 1.6s (8.2%) |
| build | 4.8s (27.6%) | 5.2s (26.5%) |
| value | 8.6s (49.4%) | 10.4s (53.1%) |
| cta | 2.4s (13.8%) | 2.4s (12.2%) |

The curiosity gap gets slightly more room (5.2s vs 4.8s), which is the mechanism doing the work.

Rejected: `snap` (14.2s). Its 3.6s build rushes the setup→reveal, and the card-reel data shows
length is not the variable — three lengths (31s / 18s / 12s) all landed on ~210 TikTok views.

## Music

One generation, billed:

```
npm run music:generate -- --bpm=140 --slug=rahu-shadow
```

140 BPM matches V03's measured 139.7. The script's acceptance gate rejects a bed that is not
percussive enough to beat-map, off the requested tempo, or quiet at frame 0 — `--dry-run` prints
the request without sending it.

⚠️ **V03's bed is off-grid and it won anyway.** `starlightV03` measures 139.7 BPM = 12.89
frames/beat at 30fps, not the 12-frame grid the standing "target 150 BPM" rule calls for. What
makes it feel locked is that cuts snap to **tracked** beat times, not a computed grid. So:

1. Register the bed in `MUSIC` (`src/lib/brand.ts`) and in `scripts/lib/music-pool.mjs`
   (`TRACK_BPM`, `FAST_TRACKS` — array order is load-bearing, append last).
2. Run `scripts/build-beat-maps.mjs` to write measured beat times into
   `content/beat-maps.json`.
3. Let `alignToBed` snap act boundaries to those beats. It already prefers `snapActsToBeats`
   over `beatAlignedActs` wherever a map exists. No new code.

## Look

Sage-gold palette, centered layout — V03's exact configuration.

⚠️ Tradeoff, accepted deliberately: reusing both axes is part of the duplicate fingerprint that
suppressed the old account. Judged safe here because duration is the strongest signal a
duplicate detector has and 19.6s ≠ 17.45s, plus a brand-new bed and entirely new copy. Revisit
if this becomes a series rather than one post.

## Where the code goes

A new hand-authored `ViralVideoProps` export in `src/viral/templates.ts`, alongside
`CONTRARIAN_EIGHT`, added to the `VIRAL_TEMPLATES` map as `Viral-07-Contrarian-Thirteen`. The
locked V01–V06 exports are not touched — they omit `structure`/`palette`/`layout` so they keep
rendering byte-identically. **This new template sets all three explicitly**, as every
post-2026-07-30 video must.

- **No manual Root edit.** `Root.tsx` maps over `{...VIRAL_TEMPLATES, ...DAILY_TEMPLATES}` and
  derives duration through `calculateMetadata` from `props.structure`, so the composition
  registers itself at the right length.
- 🪤 **`COVER_COPY` is a full `Record` keyed on `keyof typeof VIRAL_TEMPLATES`.** Adding a
  template key without adding its cover entry fails `tsc`. Needs `{ kicker, title, accent,
  number }`; the kicker names the ruling planet on every single-number cover so the set reads
  as one series in a grid — here, Rahu.

`content/daily-state.json` gets no row. Its `nextVNumber()` maxes the ledger *and* the Desktop
folder names, so a row would make the exporter derive a composition id that does not exist —
the same trap that broke V13/V14.

## Verification before it ships

Renders need eyes, not just assertions: two layout bugs shipped past 127 green tests.

- [ ] Duration on disk is 19.6s-ish and **not** 17.450667s.
- [ ] Sample a **mid-scene** frame. Frame 0 renders empty and the accent line clips at ~frame 6
      — both are pre-existing and correct, do not "fix" them.
- [ ] Hook is legible at frame 15.
- [ ] The NumberReveal label fits and does not overflow at 56px.
- [ ] Audio envelope of the render correlates against the new bed (Pearson vs each candidate),
      proving the bed actually reached the mix rather than trusting a file timestamp.
- [ ] Safe area: TikTok covers ~340px at the bottom, more than Instagram.

## Posting

Rendered to `out/` (gitignored), handed over **under a new filename** — overwriting a file
QuickTime holds open shows "the video did not play" on a perfectly good render.

Posted by hand on a chosen day, alongside the running card programme. Two posts that day,
deliberately, once. Platform choice is the owner's at post time.

🔴 The Facebook publisher is under suspicion: on 2026-08-06 its post did nothing and the owner
deleted it and reposted by hand for all 33 views. Do not route this through the FB publisher
without verifying that path end to end. A zero exit is not evidence the post was distributed.

## What this measures

Judge on the **0–1s retention drop and skip rate**, not view totals — it reads in a day, on n=1.

- **Success:** a retention *slope* like V03's (roughly half the audience still there at 3s) and
  a skip rate materially under the card reels' 90.3%.
- **Failure:** another cliff — ~35% at 1s, flat by 3s — which would mean the format is not what
  separates V03 from the cards, and the difference lies in the topic or in July's algorithmic
  conditions.

Either result is worth having. The card reels have produced the same ~210-view batch three
times; this is the first test of a different explanation.

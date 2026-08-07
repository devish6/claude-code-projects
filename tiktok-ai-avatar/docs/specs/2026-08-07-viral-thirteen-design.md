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

## The goal, in the owner's words

> "Make a video look punchy and have it beat sync properly to the very microsecond, if possible,
> so it actually grabs attention. The information should be worthy so there's retention. The one
> video I shared does all of it."

Three requirements, and V03 is the bar for all three:

1. **Punchy** — cut density, addressed by the custom act structure below.
2. **Beat-locked** — addressed by extending beat-snapping into the value act.
3. **Information worth staying for** — addressed by the curiosity-gap script, whose facts all
   come from the app's own card data.

## Scope

One video, built on the existing `ViralVideo` engine, posted **by hand**. No new Remotion
composition, no scheduler work, and `content/daily-state.json` is untouched so the protected
8-day card run finishes clean.

**One bounded engine change is in scope** (owner-approved 2026-08-07, after measurement showed
the internal cuts drift ~100ms): beat-snapping inside the value act. See *Beat-sync fidelity*.

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

## Act structure — a CUSTOM structure, not one from the pool

**V03's winning config is the forbidden duration.** It uses the default 17.4s `ACT`, and
17.450667s across all 28 renders is exactly what TikTok withheld as repeated content. It cannot
be copied.

But "punchy" is **cut density, not total length**, and no structure in `STRUCTURES` reproduces
V03's rhythm. Measured through `makeValueScenes`:

| structure | total | trait pairs | montage | avg cut |
|---|---|---|---|---|
| V03 (default) | 17.4s ⛔ | **3 × 1.70s** | 1.40s | 2.49s |
| **A — custom: 1.6 / 5.4 / 8.6 / 2.8** | **18.4s** | **3 × 1.70s** | **1.40s** | 2.63s |
| `standard` from pool | 19.6s | 3 × 2.03s | 1.67s | 2.80s |
| `snap` from pool | 14.2s | 2 × 2.10s | 1.40s | 2.37s |

**Use structure A.** Holding the value act at V03's 8.6s preserves the trait cadence frame for
frame; the duration change is bought from `build` (+0.6s, more room for the curiosity gap) and
`cta` (+0.4s, the last card on screen, which does not affect pacing where it matters).

The pool is not mandatory — `structure` is an arbitrary `ActSeconds` prop, and `STRUCTURES`
exists only for the daily auto-picker's variation engine.

⭐⭐ **COUNTER-INTUITIVE, AND WORTH KEEPING: MAKING IT SHORTER MAKES IT FEEL SLOWER.** Below a
~8.3s value act the engine drops from 3 pair scenes to 2 and stretches each past 2.1s, because
`makeValueScenes` adds *scenes* rather than seconds to respect the 1.2s `SCENE_CHANGE` ceiling.
`snap` and every "tighter" variant tested are less punchy per scene than V03. Do not shorten the
value act to increase pace.

## Music — SOURCED FROM PIXABAY, not generated

Owner's call 2026-08-07: source it rather than spend ElevenLabs credits. `music:verify` and
`music:beatmaps` gate *any* registered bed, not just generated ones, so nothing is lost.
`generate-music.mjs` stays available if sourcing fails to turn up a passing track.

### What V03's bed measures — the target profile

| | |
|---|---|
| Tempo | 139.7 BPM, beat map SD **7.1ms** — a very trackable pulse |
| **Opening** | **0s is the loudest second: −16.6 dB mean / −4.2 dB peak** |
| Then | dips to −24.2 dB by 2s, recovers at 3s — hit, space, hit |
| Body | ~−17 to −19.5 dB mean |
| Format | 30.0s, 192kbps CBR, 44.1kHz stereo |

### Selection criteria

1. 🔴 **Must open ON a hard hit** — no fade, no riser, no ambient intro. This is the top filter:
   last screening, 5 of 15 in-band tracks were dropped for exactly this. `BrandAudio` carries
   `fadeFloor={0.85}` precisely to keep a frame-0 transient from being multiplied to zero.
2. **Percussive, not pad-led** — the tracker needs a pulse. `violinEnergetic` fits its own grid
   to only 74ms because its pulse thins out.
3. ⭐ **Tempo is NOT constrained to 140 or 150.** Because cuts snap to *tracked* beats, the
   standing "target 150 BPM / ±6%" rule — which is about grid alignment — does not apply here.
   Any clear, measurable pulse works. V03 is off-grid at 12.89 frames/beat and won anyway.
4. ≥30s of usable body, sliced to 30s at 192k CBR.
5. Genre lead: **phonk** (natively 130–150), dark trap, cinematic percussion.

### Division of labour

The owner picks by ear — "intriguing" is a judgment the measurements do not contain. The gate
below decides whether the pick is *usable*; it cannot decide whether it is good.

🪤 **Pixabay scraping trap:** the list page's `<audio>` elements are **not in row order** — they
are reordered as created, so zipping `querySelectorAll('audio')` against row titles silently
mislabels every result. Click each row's play button and poll until the *playing* `src` changes.
A fixed 450ms wait is not enough.

### Wiring

⚠️ **V03's bed is off-grid and it won anyway.** `starlightV03` measures 139.7 BPM = 12.89
frames/beat at 30fps, not the 12-frame grid the standing "target 150 BPM" rule calls for. What
makes it feel locked is that cuts snap to **tracked** beat times, not a computed grid. So:

1. Drop the sliced file in `public/music/`.
2. Register the bed in `MUSIC` (`src/lib/brand.ts`) and in `scripts/lib/music-pool.mjs`
   (`TRACK_BPM`, `FAST_TRACKS` — array order is load-bearing, append last).
3. `npm run music:verify` — measures every registered bed and prints the table `TRACK_BPM` /
   `TRACK_PHASE_MS` should hold. ⭐ It validates itself against a **synthetic click track** and
   exits non-zero if that reading is wrong; a previous version passed against every real bed
   while being 1.8% wrong at 150 BPM.
4. `npm run music:beatmaps` — writes measured beat times into `content/beat-maps.json`.
   Reject the track if `beatMapQuality` says the tracker could not follow the pulse.
5. Let `alignToBed` snap act boundaries to those beats. It already prefers `snapActsToBeats`
   over `beatAlignedActs` wherever a map exists. **No new code.**

🪤 **A file is not ground truth because a previous session asserted it.** The notes once called
`voltslope-v08.mp3` "150.00 by construction"; once the tool was validated on clicks it read
152.2. Only a signal you construct is ground truth.

## Beat-sync fidelity — the largest available gain

### The hard floor

Sync is **frame-quantized**. At 30fps one frame is 33.3ms and a cut can only land on a frame
boundary, so `Math.round(beat * fps)` gives a worst case of **half a frame, 16.7ms**.
Microsecond alignment is not physically available.

On top of that every MP4 carries **~40–50ms of AAC encoder priming padding** (measured at 40.6ms
on `voltSlope`). It is real but **constant** — it shifts everything equally and does not disturb
the relative rhythm. 🪤 Do not chase it; a previous session mistook it for a fade bug.

### The gap, measured

`snapActsToBeats` snaps only the four **act** boundaries. Every cut *inside* the value act —
number reveal, all three trait pairs, the montage — is a proportional division from
`makeValueScenes` and is not beat-aware. Measured against `starlightV03`'s tracked map using
structure A:

| cut | lands at | nearest beat | drift |
|---|---|---|---|
| value → number reveal | 7.000s | 6.893s | **+107ms** |
| number → pair 1 | 9.167s | 9.042s | **+125ms** |
| pair 1 → pair 2 | 10.867s | 10.755s | **+112ms** |
| pair 2 → pair 3 | 12.567s | 12.472s | **+95ms** |
| → montage | 14.200s | 14.151s | **+49ms** |

3–4 frames off on every cut, in the section holding **5 of the video's 7 cuts**, and 3–7× worse
than the frame limit allows. **V03 has this same drift** — so closing it does not merely match
V03, it beats it.

### The change

`makeValueScenes` in `src/viral/timing.ts` gains an optional array of tracked beat times and
snaps its internal boundaries, exactly as `snapActsToBeats` already does for acts: in order,
each to the nearest beat later than the previous boundary, moved only if within tolerance.

🔴 **Guard required.** Snapping shifts scene lengths, and a pair must never exceed
`SCENE_CHANGE * 2` — the ceiling that keeps any single trait under 1.2s on screen. A 14.8s value
act once held each trait for 2.05s exactly because this was unguarded. The test must fail if a
snapped pair breaches it.

🪤 **Do not duplicate the logic across the .mjs/.ts split.** `snapActsToBeats` lives in
`scripts/lib/variation.mjs` (pipeline-side); `makeValueScenes` lives in `src/viral/timing.ts`
(renderer-side); `.mjs` cannot import `.ts`. The renderer reads `content/beat-maps.json`
directly. A second copy in `src/` would be dead code that drifts — that duplication already
broke three renders via `compositionId`.

### Acceptance

Every cut within **16.7ms** of a tracked beat, verified by measurement against the beat map, not
by inspection.

## Look

Sage-gold palette, centered layout — V03's exact configuration.

⚠️ Tradeoff, accepted deliberately: reusing both axes is part of the duplicate fingerprint that
suppressed the old account. Judged safe here because duration is the strongest signal a
duplicate detector has and 18.4s ≠ 17.45s, plus a brand-new bed and entirely new copy. Revisit
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

- [ ] Duration on disk is ~18.4s and **not** 17.450667s.
- [ ] **Every cut within 16.7ms of a tracked beat** — measured against `content/beat-maps.json`.
- [ ] No trait pair exceeds `SCENE_CHANGE * 2` after snapping (test, not eyeball).
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

# V80–V84: creative decisions (the Muse brief, 2026-10-15)

Five cuts, one template: `muse-series/build.mjs` generates each Hyperframes composition and asserts every
number shown on screen. Each file was checked with ffprobe: H.264, 1080×1920, 30 fps, AAC.

| File | V | Length | Hook on frame 0 |
|---|---|---|---|
| v1_two_numbers.mp4 | V80 | 27s | You have TWO numbers. Not one. |
| v2_western_wrong.mp4 | V81 | 27s | Your life path number is missing a planet. |
| v3_moolank8.mp4 | V82 | 23s | Born on the 8th, 17th or 26th? |
| v4_name_number.mp4 | V83 | 28s | Your name has a number. It might be fighting your birth chart. |
| v5_2026_forecast.mp4 | V84 | 29s | November & December 2026, by your numbers. |

## Where I departed from the brief, and why

1. **V2's hook isn't "Your life path number is wrong."** That claim is false. A Western life path *is* the
   full-date sum, the same number Vedic numerology calls Bhagyank. "Different calendar logic" is not
   what happens. The real difference is that Western sites keep master numbers (11/22/33) and give no planet, while Vedic
   reduces them (11 → 2, the Moon) and reads the birth day on its own (Moolank). So the hook became
   "Your life path number is missing a planet," and the example shows that difference: 19·06·1993 is
   Life Path 11 on a Western site, Bhagyank 2 (Moon) and Moolank 1 (Sun) in Vedic. I dropped
   "5,000 years of astronomers" because we can't back it up.
2. **V5's formula is the one numevix.com uses, not "day + month + year".** The engine
   (`forecast.ts → computeAntardasha`) computes Personal Year = last two digits of the year + Moolank + birth
   month + the planet of the weekday your birthday falls on. If the video taught a different formula, a
   viewer would get a different number on the site. The worked example (born 23 Aug) was checked against
   the real engine: 26 + 5 + 8 + 1 = 40 → 4. The Personal Year meanings are the site's own titles: 1 beginnings,
   4 groundwork, 9 decisive action. The brief's "9 = endings" doesn't match what the site says.
3. **V3 drops the "rings, not crowds" reframe and "undeniable late".** Our measured posts say consolation and
   flattery lose (0-for-4). The wound and the Saturn line stay, and the new concrete trait is "You'd rather do it
   slowly than do it twice." I didn't build the V3b/V3c series extensions (Moolank 3, 5); they're optional in the brief.
   Note: this one-number "Born on the X?" opener is the skeleton V79's diagnosis said tells 8 of 9 viewers
   "not you". It's in the series because the brief asked for it.
4. **Not spoken.** The brief asks for spoken hooks, but there's no voice. The ElevenLabs subscription is active but out of credits, and the account's
   reels have been text over a music bed. Every hook is on screen from frame 0. If you record a voiceover on
   your phone, the timing leaves room for it.
5. **Built in Hyperframes, not raw ffmpeg drawtext.** This is the same pipeline as every V-series cut, and it gives real
   Google fonts, per-line reveals and a fit loop. ffmpeg was used for checks, posters and the bed gain.
6. **The comment CTA is followed exactly, and the site link is kept.** Each end card asks for the comment, then shows
   `numevix.com/[your Moolank]` (V82: `numevix.com/8`), and each caption's first line carries that link.
   Every date CTA shows **DD MM YYYY**, because Moolank comes from the day and 05/06 read the wrong way gives
   the wrong answer.

## The look
"Midnight library": ink-blue dark, two shelves of out-of-focus book spines drawn procedurally, candle glow,
dust motes, animated film grain, vignette. **Cormorant Garamond** (with lining figures forced on, because its default
old-style "5" dropped onto its label) for the lines and numerals. **Manrope** for labels. Parchment
text, gold for the turn. Lines appear one at a time, scenes swap hard, and every scene is lit on its first frame.
Music: five different library beds (Midnight Reverie, Two AM Stillness, Late Night Whisper, Midnight
Murmurs, Resonant Stillness), a page-flip at each scene, a temple bell when a number lands, and a whoosh at the CTA.

## With real footage I'd change
- Put a hand writing the arithmetic on paper under candlelight behind V80/V81/V84. The working is the
  demo, and demo posts are what reach on IG.
- Record the hook in your voice (first 2s) and keep the text.
- Make V83 use the commenter's own name, live: reply videos to the best comments.

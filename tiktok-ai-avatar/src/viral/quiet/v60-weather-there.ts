import type { QuietScene } from "./scenes";

/**
 * V60 — YOU STILL CHECK THE WEATHER IN THE OTHER CITY.
 *
 * ⭐⭐⭐⭐ THE FIRST CUT BUILT AFTER THE OPENING-SURFACE LEVER DIED.
 *
 * V59 was the pre-registered replication of V58 and it failed (2026-09-10).
 * Instagram views, the whole quiet series, read 2026-09-11 off Windsor:
 *
 *        V50 51 · V55 35 · V56 53 · V57 48 · V58 246 · V59 72
 *
 * V59 opened brighter AND flatter than V58 and landed back in the band. V58 is
 * a distribution outlier, not an opening-surface effect. ⛔ So nothing in this
 * cut is chosen to move Instagram's first three seconds. The plates are chosen
 * for what they MEAN.
 *
 * ── WHY THIS IS STILL A QUIET CUT ───────────────────────────────────────────
 * TikTok Studio, read the same day, lifetime views:
 *
 *        V50 607 · V55 653 · V56 154 · V57 637 · V58 635 · V59 615
 *
 * Five of six in a 607-653 band. The kinetic cuts in the same weeks ran
 * 177-645 on TikTok and 80-218 on Instagram. `content/v54-measured.md` made
 * TikTok the primary platform and the owner's 09-08 call was platform fit, so
 * a format that holds a tight band on the primary platform is the one to post.
 * ⚠️ That band is a FLOOR, not a win condition: this cut is judged on whether it
 * stays in it, and nothing here is expected to break it upward.
 *
 * ── THE PLATES ──────────────────────────────────────────────────────────────
 * Measured by `scripts/measure-grounds.mjs`, pre-scrim, in the copy strip:
 *
 *   glass-a       191.1   span 37.7   <- rain on a window, for a line about weather
 *   curtain-h     179.3   span 14.6
 *   linen-b       163.6   span  8.6
 *   stone-d        98.3   span 12.9   <- the ink flips into this
 *   fold-e         49.1   span  2.4   <- the refusal
 *   threshold-f    60.2   span  8.3   <- a doorway, for the ask
 *
 * 🪤 `glass-a` IS REUSED FROM V58'S FRAME 0, ON PURPOSE AND NOT CONSECUTIVELY.
 * The V43/V44 recognition finding bans two posts IN A ROW opening on the same
 * frame (99.5% identical pixels, 1s hold halved). V59 and DRAW01 sit between
 * V58 and this cut, the line is new, and V59's opener (`chalk-g`) shares
 * nothing with it. `v60.test.ts` asserts the frame-0 rule against V59 only.
 *
 * Every pairing is one a previous cut already cleared the gates with:
 * `glass-a` and `linen-b` from V58, the back four from V59. The ladder
 * descends at every step to the payoff and lifts once, at the doorway.
 *
 * ── THE IDEA ────────────────────────────────────────────────────────────────
 * ⚖️ Written to the owner's 2026-09-09 ruling: "relatable and emotional", not
 * necessarily a pain point. The almost-life: the move you nearly made, the
 * city you still check. It is not regret, since the viewer would choose this
 * life again, and granting that is what lets them recognise themselves instead
 * of arguing with the first line.
 *
 * ⭐⭐⭐ THE CONCRETE DETAIL IS FRAME 0. "It's always 2 a.m." beat everything
 * vaguer, and the owner has rejected a cut as vague. The weather in the other
 * city is the specific, slightly embarrassing, true version of "you think about
 * the road not taken".
 *
 * ⭐⭐⭐ THE CONSOLATION THIS THEME INVITES IS "YOU CHOSE RIGHT", and scene 5
 * refuses it. V33/V36 refused; V34/V35/V37/V38 consoled and died.
 * The under-line reads the PRESENT road and promises no outcome, per the
 * production ETHICS_BLOCK ("never promise an outcome, a date, or an amount").
 *
 * ⭐ NO NUMBER, NO LETTER VALUE, NO FORECAST. Like every quiet cut, it makes no
 * claim a commenter can contradict. `v60.test.ts` asserts no digit on screen.
 */
export const V60_SCENES: QuietScene[] = [
  // ── RECOGNITION. The detail IS the hook. "The other city" needs no setup:
  //    anyone who nearly moved knows which city it is before the under-line.
  {
    seconds: 3.0,
    bg: "glass-a",
    scrim: "light",
    fg: "#241C14",
    accent: "#67270C",
    line: "You still check the weather in the other city.",
    accentWord: "the other city",
    under: "the one you almost moved to",
  },
  // ── THE GRANT. Both halves have to be true at once or the viewer argues:
  //    they would choose this life again, AND they still wonder. The under-line
  //    names who they wonder about, which is a person, not a place.
  {
    seconds: 2.7,
    bg: "curtain-h",
    scrim: "light",
    fg: "#1C1712",
    accent: "#67270C",
    line: "You'd choose this life again, and you still wonder.",
    accentWord: "still wonder",
    under: "about the version of you who went",
  },
  // ── THE TURN. What the wondering actually feels like: a visit, not a wish.
  //    "And then you come home" keeps it on the side of the life they chose.
  {
    seconds: 2.5,
    bg: "linen-b",
    scrim: "light",
    fg: "#1C1712",
    accent: "#67270C",
    line: "You go back there sometimes, just to look.",
    accentWord: "just to look",
    under: "and then you come home",
  },
  // ── THE WOUND. Names the cost and blames nobody. Saying it to the people in
  //    this life sounds like wanting to leave it, so it stays unsaid.
  {
    seconds: 2.5,
    bg: "stone-d",
    scrim: "light",
    fg: "#F5F0E8",
    accent: "#E4B978",
    line: "But you can't say it out loud.",
    accentWord: "out loud",
    under: "it sounds like wanting to leave",
  },
  // ── THE PAYOFF, index 4, starting at 10.7s. It refuses "you chose right" and
  //    offers a reading of the road they are on, never a verdict on the one
  //    they did not take and never a promise about where this one goes.
  {
    seconds: 3.0,
    bg: "fold-e",
    scrim: "light",
    fg: "#F2ECE2",
    accent: "#D9A45C",
    line: "I won't tell you that you chose right.",
    accentWord: "chose right",
    under: "I'll tell you what your chart says about the road you're on",
  },
  // ── THE ASK. Bookends frame 0 and names the recipient by the SAME BEHAVIOUR,
  //    a fellow sufferer and never a rescuer, as every shipped CTA in this format.
  //    🪤 The accent span is `whiteSpace: nowrap` (QuietVideo `Line`), so a long
  //    accent cannot wrap and overflows the 860px text box. The first render's
  //    "checks the weather there" ran past the padding, under TikTok's right rail
  //    and across the door's light strip. Found by LOOKING; every gate was green.
  {
    seconds: 2.7,
    bg: "threshold-f",
    scrim: "light",
    fg: "#FFF0E4",
    accent: "#FF8A48",
    line: "Send this to whoever still checks the weather there.",
    accentWord: "the weather there",
    under: "they'll know why · @numevix",
  },
];

/** The beat the cut is built to reach. Everything before it withholds. */
export const V60_PAYOFF_INDEX = 4;

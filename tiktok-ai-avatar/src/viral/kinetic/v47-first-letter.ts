import type { KineticScene } from "./scenes";

/**
 * V47 — WHAT IS YOUR FIRST LETTER WORTH? (post 2 of the 5-post arm)
 *
 * ⛔ THIS IS NOT A NEW TEST. V46 is post 1 of a 5-post arm and V47 is post 2.
 * The package is held EXACTLY: 7 scenes, the same seconds array, the same
 * ground order, the same scrims, the same colors, the same bed, 12.352s, the
 * payoff at scene index 5. Only the episode's copy moves. ⛔ Do not read either
 * post's numbers on their own — read the arm at 5, on the MEDIAN.
 *
 * ⭐⭐⭐ MEASURED 2026-08-26, 60 REELS, WHY THE ARM IS WORTH FINISHING.
 * Against `media_reel_skip_rate` over every reel since 2026-07-15:
 *     skip <= 0.700 -> 12 of 18 posts cleared 500 views, median 1,390
 *     skip >  0.700 ->  0 of 42 posts cleared 500 views, median   210
 * corr(skip, log views) = -0.725. V46 measured 0.789 — the wrong side, and 162
 * views / 125 reach says so.
 * 🪤 BUT THE THRESHOLD IS POST-HOC AND THE FILE THIS ONE FOLLOWS SAYS SO: the
 * `skip <= 0.690` rule was already recorded as FAILING when the outcome was
 * counted at 300 views. Re-cutting the same rule at 0.700/500 views until it
 * separates is threshold-shopping. What survives without a threshold is the
 * correlation, and the direction: the first three seconds gate distribution.
 *
 * ⭐ WHAT V46 DID MOVE, and why frame 0 keeps its treatment. IG's own tooltip
 * put V46's 1s hold at 51.1% against V45's 41.5%, and avg watch was 3.727s of
 * 12.352s (30.2% of runtime) vs V45's 3.087s of 22.656s (13.6%). One post
 * cannot carry that (MDE at n=1 = 0.257 skip pts against an effect this size),
 * which is exactly why the package is held here rather than tuned.
 *
 * 🔴 FRAME 0 STILL MAY NOT REPEAT. Holding the package is not licence to
 * re-show the frame: V43 and V44 opened on 99.5% identical pixels and V44's
 * hold halved. The ground stays `dawn-a` (the arm's ground, and the only light
 * one we own) but the HEADLINE STRING is new, so the frame is not a re-show.
 *
 * ── THE CLAIM, AND ITS LIMIT ────────────────────────────────────────────────
 * From the engine's own map, `vedic-numerology/lib/numerology/name-number.ts:1-4`:
 *
 *   1 A I J Q Y · 2 B K R · 3 C G L S · 4 D M T · 5 E H N X
 *   6 U V W · 7 O Z · 8 F P · 9 — nothing —
 *
 * Two letters carry a 7: O and Z. That is a fact about LETTERS and is stated
 * about letters only — the same limit V46 was built around. ⛔ It may never be
 * restated as "only two names are 7s"; a name reduces by SUMMING its letters.
 *
 * ⚠️ WOUND, NOT ACCUSATION. Nothing here tells anyone their name is wrong and
 * no outcome is predicted. The pull is a rarity, not a fault.
 */

/** ⭐ Held from V46 — the chip is package, not episode. Plain words, no jargon. */
export const KICKER = "VEDIC NUMEROLOGY";

export const V47_SCENES: KineticScene[] = [
  // ── THE HOOK. Second person, plain, no glossary, answerable about YOURSELF
  //    in under a second — the shape every one of this account's best openings
  //    has (.559 "People call 9s aggressive", .671 "Is 2 a weak number?").
  //    ⭐ Universal by construction: everyone has a first letter. No birthdate
  //    filter, which is the gate V46 removed and this arm is holding removed.
  //    🔴 Cream on `heavy`, NOT ink on pale — measured, every scrim darkens
  //    downward, so dark type on dawn decays to 1.4:1 against a 3.0:1 floor.
  {
    seconds: 1.9,
    bg: "dawn-a",
    scrim: "heavy",
    fg: "#FFF6EA",
    accent: "#F4CE8E",
    kicker: KICKER,
    headline: "WHAT IS YOUR FIRST LETTER WORTH?",
  },
  // ── The promise, paid at ~1.9s. Never coy about the thing it opened on. ──
  {
    seconds: 1.7,
    bg: "night-a",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: "EVERY LETTER IS A NUMBER",
    sub: "A is 1. B is 2. C is 3.",
  },
  // ── A letter the viewer is likely to know someone by. S = 3 (engine map). ─
  {
    seconds: 1.5,
    bg: "stone-a",
    fg: "#EDEDED",
    accent: "#B9B9B9",
    headline: "S IS A 3",
    sub: "and so are C, G and L",
  },
  // ── 3 is Jupiter. ⚠️ Trait language only — no prediction, no outcome. ────
  {
    seconds: 1.8,
    bg: "water-a",
    scrim: "light",
    fg: "#EAF2FF",
    accent: "#9CC4E4",
    headline: "3 IS JUPITER",
    sub: "the teacher, the guide",
  },
  // ── THE LOOP OPENS AT 6.9s, past the 6.4s gate. ⛔ The count stays a WORD
  //    where the subject is a numeral — V43 put "4 NUMBERS" on screen in a
  //    video whose answer was 1, 2, 4 and 7 and handed the viewer a wrong
  //    answer. Here 7 is the subject, so 7 stays a numeral and TWO does not.
  {
    seconds: 1.7,
    bg: "violet-a",
    fg: "#F6EAFF",
    accent: "#C89BFF",
    headline: "BUT SOME ARE ALMOST EMPTY",
    sub: "only two letters carry a 7",
  },
  // ── THE PAYOFF, scene index 5, at 8.6s — 70% of the runtime, not V45's
  //    17.6s where measured retention is 4%. ────────────────────────────────
  {
    seconds: 1.9,
    bg: "gold-b",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    headline: "O AND Z. THAT IS ALL.",
    sub: "the only two 7s in the alphabet",
  },
  // ── CTA, held from V46. ⭐ POINTS AT THE PROFILE: viewer→profile is the
  //    measured constraint (131 profile visits on 7,157 viewers in 30 days =
  //    1.83%, and 16 link taps), not reach. ⛔ Never a bare URL — a muted
  //    viewer cannot click it. 🪤 `ember-b` not `gold-c`: cutting gold-b to
  //    another brown silk is a boundary the eye reads as no cut at all.
  {
    seconds: 1.8,
    bg: "ember-b",
    scrim: "light",
    fg: "#FFF0E6",
    accent: "#FF8A4C",
    headline: "Work out your whole name",
    sub: "@numevix · free in bio",
  },
];

/** The scene at which the loop closes. Everything before it withholds. */
export const V47_PAYOFF_INDEX = 5;

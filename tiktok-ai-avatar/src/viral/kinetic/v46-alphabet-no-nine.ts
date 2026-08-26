import type { KineticScene } from "./scenes";

/**
 * V46 — THE ALPHABET HAS NO 9.
 *
 * 🔴 WHY THIS EXISTS. V45 measured 2026-08-25: 203 views, 166 reach, 1s hold
 * 41.5% (IG tooltip), `media_reel_skip_rate` 0.879, 0 new followers. On one
 * server-side instrument the run reads V42 .850 / V43 .754 / V44 .851 / V45
 * .879 — V45 is the WORST of the run and the 94th percentile worst of 36 posts.
 *
 * ⛔⛔ BUT DO NOT RECORD V45 AS A RESULT, AND DO NOT RUN ANOTHER CUT LIKE IT.
 * Two separate findings killed that whole way of working:
 *
 * 1. V45's verdict was VOID BEFORE IT POSTED. Its own header (lines 20-24 of
 *    v45-september-year-turn.ts) says scene 0 bundled a new hook shape AND the
 *    account's first `push` — and the plan then set a single-variable
 *    falsification condition ("under 50% ⇒ recognition is wrong") on top of it.
 *    A bundled cut cannot falsify one of its own two variables.
 *
 * 2. ⭐⭐⭐ n=1 CANNOT READ A HOOK A/B ON THIS ACCOUNT, AT ALL. skip_rate SD
 *    across 36 reels = 0.083. Between posts that were SUPPOSED to match:
 *    08-08a↔08-08b (same day, same format) 0.188 · V36↔V37 (same series,
 *    consecutive days) 0.175, views 1935→188 · 08-12↔08-13 (same hook shape)
 *    0.155. The effect V45 tried to read was 0.125 — SMALLER than the noise
 *    between matched posts. MDE at n=1 ≈ 0.33, larger than the whole observed
 *    range (0.345). 80% power needs 11 posts/arm for a 0.10 shift.
 *    ⇒ Every V-series verdict drawn from a single post has been reading noise.
 *    ⇒ V46 IS THE FIRST OF A 5-POST ARM. ⛔ Do not judge it on its own numbers.
 *
 * ⚠️ ALSO DEAD: `skip_rate <= 0.690` looked like the first real predictive rule
 * (6/6 winners) and it FAILS COUNTING — seven posts cleared 300 views, and
 * 07-31b took 309 at skip 0.806. Among the 29 posts that never escaped the
 * floor the correlation is −0.056, i.e. nothing. ⛔ Do not resurrect it.
 *
 * ⭐⭐⭐ WHAT ACTUALLY CHANGES HERE, AND WHY IT IS NOT ANOTHER HOOK TWEAK.
 *
 * A. THE BIRTHDATE GATE IS GONE. 34 of the last 38 posts open on a date filter
 *    — "BORN 1st, 10th, 19th OR 28th?" — which asks ~8 of every 9 viewers to
 *    disqualify themselves inside the first second, by design, in the exact
 *    window the 1s hold measures. This is the first cut in the run that
 *    addresses 100% of viewers: everybody has a name.
 *    🎯 It is also the only thing we can make that a viewer can act on for
 *    ANOTHER PERSON in under a second. A send requires knowing something about
 *    the recipient; you always know someone's name, you rarely know their
 *    birthday. Share rate is our weakest step (0.75% typical) and shares are
 *    the only mechanism that beats a 53-follower base.
 *
 * B. IT IS 12.4s, NOT 22.656s. V45 put its payoff at 17.6s, where the measured
 *    retention is 4%. A payoff 96% of viewers never reach is not a payoff. The
 *    loop still closes after the 6.4s gate (8.7s) — but as a share of the
 *    video, not marooned past it.
 *
 * C. NEW GROUND AT FRAME 0. V43/V44/V45 all opened on `gold-a` brown silk;
 *    V43 and V44's frame 0 are 99.5% IDENTICAL PIXELS (mean Δ 0.47/255), which
 *    is the strongest form of the recognition problem and has never been
 *    cleanly tested. This opens on `ember-a`. ⛔ Do not return to gold-a for
 *    the rest of this arm.
 *
 * 🪤 NO `push` HERE, DELIBERATELY. V45 introduced it bundled with a new hook,
 * so it has never been measured on its own. Carrying it forward silently would
 * make an untested change permanent. The default 6% drift applies.
 *
 * ── THE CLAIM, AND ITS EXACT LIMIT ──────────────────────────────────────────
 * Derived from the engine's own map, `vedic-numerology/lib/numerology/
 * name-number.ts:1-4`. Every one of the 26 letters carries a value in 1..8:
 *
 *   1 A I J Q Y · 2 B K R · 3 C G L S · 4 D M T · 5 E H N X
 *   6 U V W · 7 O Z · 8 F P · 9 — nothing —
 *
 * 🔴🔴 THE CLAIM IS ABOUT LETTERS AND MAY NEVER BE STATED ABOUT NAMES.
 * "No letter is worth 9" is TRUE. "No name is a 9" is FALSE — a name reduces by
 * SUMMING its letters, and e.g. VEER sums to 18 → 9. Saying the second would be
 * the pratayandar error again: generalising a rule past the case that proves it.
 * That limit is not a footnote here, it IS the payoff (scene 5): a 9 in a name
 * is only ever reached by addition, never carried by a single letter.
 *
 * ⚠️ WOUND, NOT ACCUSATION. Nothing here tells anyone their name is wrong, and
 * no outcome is predicted. The pull is a gap in the alphabet, not a fault.
 *
 * ⛔ NUMERALS. `EIGHT` is spelled in scene 2 on purpose — V43 put "4 NUMBERS"
 * on screen in a video whose answer was 1, 2, 4 and 7 and the typography handed
 * the viewer a wrong answer. Here `9` IS the subject, so it stays a numeral;
 * the COUNT next to it does not.
 */

/** The series chip. ⭐ Not "NAME NUMBER · MOOLANK 1" — V44 published that, and
 *  a chip the feed has already shown reads as a repost of a post it skipped. */
export const KICKER = "CHALDEAN A–Z";

export const V46_SCENES: KineticScene[] = [
  // ── The hook. ⭐ A shape this account has never posted AND a ground it has
  //    never opened on. No moolank, no birthdate, no "BORN [days]?" — the first
  //    frame in 38 posts that does not ask most of the audience to leave. ─────
  {
    seconds: 1.9,
    bg: "ember-a",
    fg: "#FFF0E6",
    accent: "#FF8A4C",
    kicker: KICKER,
    headline: "THE ALPHABET HAS NO 9",
  },
  // ── The mechanism, stated plainly and early. Small, and hiding it would only
  //    make the video coy. The LOOP is not this; it is what the gap means. ────
  {
    seconds: 1.7,
    bg: "night-a",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: "EVERY LETTER IS A NUMBER",
    sub: "A is 1. B is 2. C is 3.",
  },
  // ── THE LOOP OPENS AT 3.6s. ⛔ EIGHT is spelled — see the numerals note. ──
  {
    seconds: 1.6,
    bg: "stone-a",
    fg: "#EDEDED",
    accent: "#B9B9B9",
    headline: "AND THEY STOP AT EIGHT",
    sub: "twenty-six letters, eight values",
  },
  {
    seconds: 1.8,
    bg: "water-a",
    scrim: "light",
    fg: "#EAF2FF",
    accent: "#9CC4E4",
    headline: "NOT ONE LETTER IS A 9",
    sub: "not anywhere in the alphabet",
  },
  // ── Why the gap is worth 12 seconds. 9 is Mars. ⚠️ Trait language only —
  //    no prediction, no outcome. ───────────────────────────────────────────
  {
    seconds: 1.7,
    bg: "violet-a",
    fg: "#F6EAFF",
    accent: "#C89BFF",
    headline: "AND 9 IS MARS",
    sub: "courage, drive, the fighter",
  },
  // ── THE PAYOFF, scene index 5, at 8.7s. Past the 6.4s gate, and at 70% of
  //    the runtime rather than V45's 78% of a video twice as long. ⭐ This line
  //    IS the claim's limit — the thing that keeps it true. ──────────────────
  {
    seconds: 1.9,
    bg: "gold-b",
    fg: "#F6EFE2",
    accent: "#E8B44C",
    headline: "A 9 NAME IS ALWAYS A SUM",
    sub: "never one letter — always the whole name",
  },
  // ── CTA. ⭐ POINTS AT THE PROFILE, because viewer→profile (1.47%) is the
  //    measured constraint, not reach. It is the video's own claim continued:
  //    the reel gave them the letters, the profile gives them their name.
  //    ⛔ Never a bare URL — a muted viewer cannot click it.
  {
    seconds: 1.8,
    bg: "dawn-a",
    scrim: "heavy",
    fg: "#FFF4E6",
    accent: "#F0C88A",
    headline: "Your whole name has one number",
    sub: "@numevix · work yours out free in bio",
  },
];

/** The scene at which the loop closes. Everything before it withholds. */
export const V46_PAYOFF_INDEX = 5;

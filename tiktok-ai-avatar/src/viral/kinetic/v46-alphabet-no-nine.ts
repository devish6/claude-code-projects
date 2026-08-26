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

/**
 * The series chip. ⭐ Not "NAME NUMBER · MOOLANK 1" — V44 published that, and a
 * chip the feed has already shown reads as a repost of a post it skipped.
 *
 * 🔴 WAS "CHALDEAN A–Z" AND THAT WAS JARGON. The chip is the one place a
 * scroller gets told what world they are in, and "Chaldean" tells them nothing
 * unless they already know. Plain words, every time — [[plain language rule]].
 */
export const KICKER = "VEDIC NUMEROLOGY";

export const V46_SCENES: KineticScene[] = [
  // ── THE HOOK. ────────────────────────────────────────────────────────────
  //
  // 🔴 v1 OF THIS CUT OPENED ON "THE ALPHABET HAS NO 9" AND THAT WAS WRONG.
  // Owner, on reading it: *"not catchy at all. I would skip it because I don't
  // know what this means, like there is no context."* He is right, and it is
  // the same error this file was written to diagnose — it is a fact about a
  // SYSTEM the viewer has not been told exists, with no person in it and
  // nothing to recognise. That is a PAYOFF wearing a hook's clothes.
  //
  // ⭐⭐⭐ What the account's own best openings actually do — every one of them
  // is second person and names a belief or feeling the viewer already holds:
  //   skip .559 "People call 9s aggressive and impatient" (best ever)
  //   skip .661 "13 isn't unlucky"
  //   skip .671 "Is 2 a weak number?"        (1,359 views)
  //   skip .690 "If you're an 8, you've probably given more than you got" (1,935)
  // ⇒ A question the viewer can ask about THEMSELVES in under a second, in
  //   words that need no glossary. The 9 gap moves to where it belongs: scene 5.
  //
  // ⭐⭐ AND THE GROUND IS NOW LIGHT. `first-second` names the prime suspect for
  // this account's 0–1s death as "the cold-open card glimpse — dark,
  // low-contrast, near-static: in a feed that reads as *not a video*". v1 opened
  // on `ember-a`, which measures mean luma 20.5 at contrast 13.6 — DARKER and
  // FLATTER than the `gold-a` it was trying to escape (24.5 / 30.9). `dawn-a` is
  // the only genuinely light ground we own: mean 115.0, contrast 77.3, and the
  // account's biggest posts were all shot on the LIGHT format (V36 frame 0 mean
  // ~150–175) while every kinetic cut has been dark (~21).
  // 🔴🔴 AND THE TYPE IS CREAM ON A HEAVY SCRIM, NOT INK ON A LIGHT ONE.
  // I tried ink-on-pale first, reasoning that a pale ground wants dark type.
  // MEASURED OFF THE RENDER, it fails: every scrim in this format darkens
  // DOWNWARD (light = 0.05 -> 0.45 alpha), so dark type and the scrim fight
  // each other and contrast decays down the block —
  //     chip 2.7:1 · line 1 2.4:1 · line 2 1.9:1 · line 3 **1.4:1**
  // against a 3.0:1 large-text floor. That is the same defect already on record
  // ("the dawn ground is pale, so the CTA's dark type had almost no contrast
  // and numevix.com disappeared") arrived at from the other direction.
  // ⇒ dawn-a + `heavy` + cream. The scrim lands the frame near mean luma ~50 —
  //   still 2-3x brighter than any opening this account has shipped (gold-a 24,
  //   ember-a 17) and on the highest-contrast ground we own.
  {
    seconds: 1.9,
    bg: "dawn-a",
    scrim: "heavy",
    fg: "#FFF6EA",
    accent: "#F4CE8E",
    kicker: KICKER,
    headline: "WHAT NUMBER IS YOUR NAME?",
  },
  // ── The promise, paid at ~2s. ⭐ `first-second`: "the promise must be
  //    specific and payable within 2 seconds". The hook asks a question about
  //    the viewer; this answers HOW, immediately, so the cut is never coy about
  //    the thing it opened on. The 9 gap is a SECOND, deeper loop on top. ─────
  {
    seconds: 1.7,
    bg: "night-a",
    scrim: "light",
    fg: "#EAF0FF",
    accent: "#8FB4FF",
    headline: "EVERY LETTER IS A NUMBER",
    sub: "A is 1. B is 2. C is 3.",
  },
  // ── The method, in words a stranger can follow. ──────────────────────────
  {
    seconds: 1.5,
    bg: "stone-a",
    fg: "#EDEDED",
    accent: "#B9B9B9",
    headline: "ADD THEM UP",
    sub: "then add again, down to one digit",
  },
  // ── THE SECOND LOOP OPENS AT 5.1s. ⛔ EIGHT is spelled — numerals note. ──
  {
    seconds: 1.8,
    bg: "water-a",
    scrim: "light",
    fg: "#EAF2FF",
    accent: "#9CC4E4",
    headline: "BUT THEY STOP AT EIGHT",
    sub: "not one letter is a 9",
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
  //    🪤 `ember-b`, not `dawn-a`: dawn now opens the cut, and `gold-c` would
  //       have cut from gold-b to another brown silk — a boundary the eye reads
  //       as no cut at all, which is the exact blindness `checkFrameChanges`
  //       exists to catch and cannot, because it only compares the bg STRING.
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
export const V46_PAYOFF_INDEX = 5;

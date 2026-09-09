import type { QuietScene } from "./scenes";

/**
 * V59 — YOU MADE YOUR PEACE WITH IT YEARS AGO.
 *
 * ⭐⭐⭐⭐ THIS CUT REPLICATES V58. IT DOES NOT EXTEND IT.
 *
 * V58 returned the best numbers this account has ever recorded on the measure
 * that matters at the top of the funnel, and it did so as a single point:
 *
 *              opened on    opener luma   skip    IG views
 *   V50         dawn-a          111.6     0.474      51
 *   V55         dawn-a          111.6     0.571*     34
 *   V56         dawn-a          111.6     0.706*     52
 *   V57         dawn-a          111.6     0.613      43
 *   V58         glass-a         191.1     0.393     213
 *                                                (* settled values)
 *
 * 0.393 is the lowest skip of all 65 posts on the account, beating V50's 0.474
 * which held the record before it. 213 views is not merely the best quiet cut —
 * it is INSIDE the kinetic band (79 / 183 / 189 / 218 in the same window) while
 * the four cuts before it sat at 34-52. The retention card read 88% still
 * present at 0:01, against 67.7% for V36, the best post this account has had.
 *
 * ⇒ "Instagram does not distribute the quiet format" is dead. It rested on four
 * cuts that all opened on the same frame.
 *
 * ── WHY REPLICATE RATHER THAN DISSECT ───────────────────────────────────────
 * V58 moved two things at once: the opener went from a mid plate to a light one
 * AND from cream ink to dark. It also used a frame nobody had seen. Any of the
 * three could carry the effect. The tempting next move is to hold two fixed and
 * vary one — re-open on `glass-a` to separate "light" from "novel".
 *
 * ⛔ That is the second question, and it is the wrong one to ask first. An
 * effect measured once might not be there at all. Decomposing a result before
 * confirming it exists spends a cut on a distinction that may have nothing
 * underneath it. So V59 stacks every ingredient V58 had — light, flat, dark ink,
 * never seen — and asks only: DOES IT HAPPEN AGAIN.
 *
 * ⭐ If it replicates, the account has a repeatable distribution unlock and the
 * decomposition is worth a cut. If it does not, we learned that for the price of
 * one post instead of building a programme on a single point. That is the same
 * error the "two disjoint sets" reading made, and the same one V56's TikTok
 * collapse turned out to be — ONE POINT, not a trend.
 *
 * ── WHERE THE NOVELTY IS SPENT, AND WHY IT IS ONLY TWO PLATES ───────────────
 * 🪤 SKIP MEASURES THE FIRST THREE SECONDS. Scene 1 runs 0.0-2.9s and scene 2
 * starts at 2.9s, so the skip window is scene 1 and a tenth of scene 2. Fresh
 * plates past that point cannot move the number the experiment is about.
 *
 * ⇒ `chalk-g` and `curtain-h` are new. Scenes 3-6 reuse V58's `plaster-c`,
 * `stone-d`, `fold-e` and `threshold-f` deliberately. The V43/V44 finding that
 * repetition halves the 1s hold was about the OPENING frame — 99.5% identical
 * opening pixels — and this cut's opener shares nothing with V58's.
 *
 * 🪤 AND THE PROXIMITY THEORY V58 WAS BUILT ON IS DEAD, which is why spacing is
 * not a design input here. It predicted skip degrades as cuts bunch up (0.474 at
 * no predecessor, 0.571 at four days, 0.706 at one day). V58 went out ONE DAY
 * after V57 and returned the best skip ever recorded. Either proximity is not
 * the driver or the opening surface swamps it; either way it cannot be used to
 * schedule this cut.
 *
 * ── THE PLATES ──────────────────────────────────────────────────────────────
 * Measured by `scripts/measure-grounds.mjs`, pre-scrim, in the copy strip:
 *
 *   chalk-g       227.0   span 13.1   <- the opener, NEW
 *   curtain-h     159.2   span 17.5   <- NEW
 *   plaster-c     137.2   span 10.8
 *   stone-d        98.3   span 12.9   <- the ink flips into this
 *   fold-e         49.1   span  2.4   <- the refusal
 *   threshold-f    60.1   span  8.3   <- the lift for the ask
 *
 * ⭐⭐⭐ `chalk-g` IS BRIGHTER AND FLATTER THAN THE PLATE IT REPLACES — 227.0
 * against `glass-a`'s 191.1, and a span of 13.1 against 37.7. The flatness is
 * the part that matters more than the brightness: `checkTextContrast` has to
 * clear the WORST band, and `glass-a` decayed 38 points down the strip while
 * this holds within 13. There is no weak row for the accent to disappear into.
 *
 * 🪤 AND IT PUTS THE OLD LIBRARY IN ITS PLACE A SECOND TIME. `dawn-a` — the
 * plate four cuts opened on, and the one this repo called "the only light plate"
 * — measures 111.6 mean with a 92-POINT DECAY down the copy strip. It was never
 * a light plate. It was a mid plate falling off a cliff, and the cream ink and
 * heavy scrim it seemed to need were consequences of that, not properties of
 * light grounds. See the note in v58-who-you-used-to-be.ts.
 *
 * ── THE IDEA ────────────────────────────────────────────────────────────────
 * ⚖️ OWNER RULING 2026-09-09, and it widens the field: a claim "does not have to
 * be pain points, just relatable and emotional." The wound rule went 6-for-6 and
 * is not revoked — accusations, flattery and consolation still die — but the
 * claim no longer has to name a wound to earn its place.
 *
 * This is the first cut written to that. Acceptance that did not take: you did
 * the grieving, you were not lying when you said you were fine, and it still
 * arrives. Nobody is blamed and nothing is diagnosed. It is recognition, which
 * is what this format has always sold.
 *
 * ⭐⭐⭐ IT HAS A CONSOLATION WORTH REFUSING, which is the beat that separates
 * the winners from V34/V35/V37/V38. The lie this theme invites is "time heals",
 * and scene 5 declines it outright rather than softening it.
 *
 * ⭐⭐ AND IT TIES TO THE PRODUCT WITHOUT SELLING. The honest answer to "why is
 * it back now" is cycle timing — Mahadasha and Antardasha — which is precisely
 * what the Annual Forecast reads. The under-line offers that conversation and
 * asserts nothing about the future: "what you're standing in", never "when it
 * lifts". A forecast here would break the ethics block's second rule.
 */
export const V59_SCENES: QuietScene[] = [
  // ── RECOGNITION. The paradox is the whole hook: the peace was real AND it
  //    did not hold. Both halves have to be granted or the viewer argues with
  //    the first line instead of recognising themselves in it.
  {
    seconds: 2.9,
    bg: "chalk-g",
    scrim: "light",
    fg: "#241C14",
    accent: "#67270C",
    line: "You made your peace with it years ago.",
    accentWord: "made your peace",
    under: "and it still gets through",
  },
  // ── THE CONFIRMING DETAIL. ⭐⭐⭐ THE FORMAT LIVES HERE. "It's always 2 a.m."
  //    outperformed everything vaguer, and the owner has rejected a cut as
  //    VAGUE before. The anniversary is the day you brace for; the ambush is a
  //    Tuesday, which is the true and specific version.
  {
    seconds: 2.6,
    bg: "curtain-h",
    scrim: "light",
    fg: "#1C1712",
    accent: "#67270C",
    line: "It is never on the anniversary.",
    accentWord: "never",
    under: "it is a song in a shop, on a Tuesday",
  },
  // ── THE TURN. Not a restatement of scene 2 — it converts the recovery into
  //    the problem. Having visibly healed is exactly what removes anywhere to
  //    take it, so the competence becomes the isolation.
  {
    seconds: 2.5,
    bg: "plaster-c",
    scrim: "light",
    fg: "#1C1712",
    accent: "#F2E0BC",
    line: "So you have nowhere to put it.",
    accentWord: "nowhere to put it",
    under: "everyone thinks that chapter closed",
  },
  // ── THE WOUND. Names the cost and blames nobody — the wound-not-accusation
  //    rule. The people who stopped asking are not unkind; they read competence
  //    as closure, which is a reasonable thing to read it as.
  {
    seconds: 2.9,
    bg: "stone-d",
    scrim: "light",
    fg: "#F5F0E8",
    accent: "#E4B978",
    line: "You handled it well, so nobody asks any more.",
    accentWord: "nobody asks",
    under: "competence reads as closure",
  },
  // ── THE PAYOFF, index 4, starting at 10.9s — well past the 6.4s gate.
  //    ⭐⭐⭐ IT REFUSES THE ONE CONSOLATION THIS THEME INVITES: that it stops.
  //    🪤 The under-line describes the PRESENT cycle and promises no future
  //    one. "What you're standing in" is a reading; "when it lifts" would be a
  //    forecast, and the ethics block forbids promising an outcome or a date.
  {
    seconds: 2.9,
    bg: "fold-e",
    scrim: "light",
    fg: "#F2ECE2",
    accent: "#D9A45C",
    line: "I won't tell you it stops.",
    accentWord: "it stops",
    under: "I'll tell you what your chart says you're standing in",
  },
  // ── THE ASK. ⭐ Names the recipient by the SAME BEHAVIOUR, never by virtue:
  //    the other person who answers "fine" quickly. A viewer who does not
  //    recognise themselves still has someone to send it to, so the cut never
  //    leaves a judgment sitting on them.
  //    ⚔️ Rejected: "send this to someone who still checks on you." That names
  //    a rescuer, and every shipped CTA in this format names a fellow sufferer.
  {
    seconds: 2.8,
    bg: "threshold-f",
    scrim: "light",
    fg: "#FFF0E4",
    accent: "#FF8A48",
    line: "Send this to whoever also says they're fine.",
    accentWord: "also says they're fine",
    under: "they'll know why · @numevix",
  },
];

/** The beat the cut is built to reach. Everything before it withholds. */
export const V59_PAYOFF_INDEX = 4;

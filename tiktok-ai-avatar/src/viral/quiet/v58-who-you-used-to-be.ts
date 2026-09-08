import type { QuietScene } from "./scenes";

/**
 * V58 — THEY STILL INTRODUCE YOU AS WHO YOU USED TO BE.
 *
 * ⭐⭐⭐⭐ THE FIFTH QUIET CUT, AND THE FIRST ON GROUNDS THIS ACCOUNT HAS
 * NEVER OWNED. Every previous quiet cut drew from the same 13-plate library
 * shipped 2026-08-21, and by V57 that library was spent: all 13 had appeared.
 * A fifth cut could only have reused plates. So the plates came first.
 *
 * ── WHY THE GROUND AND NOT THE IDEA ─────────────────────────────────────────
 * The strongest signal in the measured set is about the OPENING FRAME, not the
 * writing. All three declining cuts opened on `dawn-a` and closed on `ember-b`,
 * and skip — which measures the first 3 seconds, i.e. the frame the viewer
 * meets — degraded with PROXIMITY to the previous cut:
 *
 *              opened on   skip    gap since previous cut
 *   V50         dawn-a     0.474   no predecessor
 *   V55         dawn-a     0.571   4 days
 *   V56         dawn-a     0.706   1 day
 *
 * That is the V43/V44 shape again (99.5% identical opening pixels; V44's 1s
 * hold halved). ⇒ The variable worth spending a cut on is a first frame the
 * returning viewer has never seen.
 *
 * 🪤 AND THE HONEST LIMIT: `dawn-a` was also the ONLY light plate in the
 * library (luma 115; the next brightest is 38.5). So "opened on dawn-a" and
 * "opened on the one light frame" are the SAME EVENT in all three cuts, and
 * this cut cannot separate them either — it changes both at once. What it can
 * do is stop repeating the frame, which is the part we can act on.
 *
 * ── THE PLATES ──────────────────────────────────────────────────────────────
 * Six new photographic grounds, art-directed as one continuous interior after
 * rain, so the six dissolves move attention within a single room rather than
 * cutting between unrelated places. Measured full-frame / centre-half luma:
 *
 *   glass-a      175 / 191   ← the opener. Brighter than dawn-a ever was.
 *   linen-b      156 / 155
 *   plaster-c    122 / 137
 *   stone-d       93 /  95
 *   fold-e        47 /  44   ← the refusal lands as the frame drops
 *   threshold-f   55 /  56   ← the small lift back for the ask
 *
 * ⭐⭐⭐ THE LUMA LADDER IS DRAMATIC, NOT DECORATIVE. The one large step in it
 * (95 → 44) falls exactly where the WOUND hands off to the REFUSAL. The frame
 * going dark as the cut declines to comfort is the format doing its own work.
 *
 * 🪤🪤 CREAM INK, NEVER DARK INK, ON THE LIGHT OPENER. The instinct on a
 * 191-luma centre is charcoal type. It is wrong here and the repo already
 * measured why: every scrim darkens DOWNWARD, so dark ink on a pale ground
 * fights it and contrast decays down the block — 2.7 / 2.4 / 1.9 / 1.4 against
 * a 3.0:1 floor, i.e. the last line is invisible. Cream + `heavy` measures
 * 7.1:1 on `glass-a`. Every scene below was contrast-checked at the worst
 * point of its own text block; the tightest is scene 3 at 5.2:1.
 */
export const V58_SCENES: QuietScene[] = [
  // ── RECOGNITION. A social encounter, not an interior state: the viewer is
  //    watching someone else describe them, which is where this wound lives.
  {
    seconds: 2.9,
    bg: "glass-a",
    scrim: "heavy",
    fg: "#FFF6EA",
    accent: "#F4CE8E",
    line: "They still introduce you as who you used to be.",
    accentWord: "who you used to be",
    under: "and you let it go, again",
  },
  // ── THE CONFIRMING DETAIL. Concrete and small. The format lives here —
  //    "It's always 2 a.m." outperformed everything vaguer.
  {
    seconds: 2.6,
    bg: "linen-b",
    scrim: "heavy",
    fg: "#FFF6EA",
    accent: "#F4CE8E",
    line: "You stopped correcting it years ago.",
    accentWord: "years ago",
    under: "it stopped being worth the sentence",
  },
  // ── THE TURN. ⭐⭐⭐ This beat was rewritten on Codex's critique in the
  //    Roundtable session: my draft ("It's easier than explaining what
  //    changed") EXPLAINED the previous line instead of turning it. This turns
  //    it — the silence becomes the evidence against you.
  {
    seconds: 2.5,
    bg: "plaster-c",
    scrim: "normal",
    fg: "#F7F2EA",
    accent: "#E4B978",
    line: "Now they think nothing changed.",
    accentWord: "nothing changed",
    under: "your quiet reads as proof",
  },
  // ── THE WOUND. Names the cost without accusing anyone — the wound-not-
  //    accusation rule. Nobody is blamed; the loss is that the work was
  //    unwitnessed. The repetition of "private" is the point, not a slip:
  //    the effort and the result were both unseen.
  {
    seconds: 2.9,
    bg: "stone-d",
    scrim: "normal",
    fg: "#F5F0E8",
    accent: "#DFAE62",
    line: "You did the work in private, and it stayed private.",
    accentWord: "stayed private",
    under: "nobody was there to notice the difference",
  },
  // ── THE PAYOFF, index 4, starting at 10.9s — well past the 6.4s gate.
  //    ⭐⭐⭐ IT REFUSES THE ONE CONSOLATION THIS THEME INVITES: "they'll come
  //    around". That is the lie, and it is declined outright.
  //    🪤 It asserts nothing about the future. The under-line offers a
  //    conversation, never a forecast.
  {
    seconds: 2.9,
    bg: "fold-e",
    scrim: "light",
    fg: "#F2ECE2",
    accent: "#D9A45C",
    line: "I won't tell you they'll catch up.",
    accentWord: "catch up",
    under: "I'll tell you what your chart says you already are",
  },
  // ── THE ASK. ⭐ The recipient is named by the SAME WOUND, not by virtue:
  //    someone else who is still being read wrong. A viewer who does not
  //    recognise themselves still has somebody to send it to, so the cut never
  //    leaves a judgment sitting on them.
  //    ⚔️ Rejected in the Roundtable: "send this to someone who knows you as
  //    you are." It offers recognition one beat after the refusal and undercuts
  //    it. Every shipped CTA names a fellow sufferer, never a rescuer.
  {
    seconds: 2.8,
    bg: "threshold-f",
    scrim: "light",
    fg: "#FFF0E4",
    accent: "#FF8A48",
    line: "Send this to whoever they still get wrong.",
    accentWord: "they still get wrong",
    under: "they'll know why · @numevix",
  },
];

/** The beat the cut is built to reach. Everything before it withholds. */
export const V58_PAYOFF_INDEX = 4;

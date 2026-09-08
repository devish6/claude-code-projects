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
 *                 plate, pre-scrim      DELIVERED by the render
 *   plate       full-frame / copy strip   (copy strip, encoded file)
 *   glass-a         175 / 191                  158.0   <- the opener
 *   linen-b         156 / 164                  135.2
 *   plaster-c       122 / 137                  122.7
 *   stone-d          93 /  99                   95.1
 *   fold-e           47 /  50                   57.4   <- the refusal
 *   threshold-f      55 /  61                   64.3   <- the lift for the ask
 *
 * 🪤 THE THREE COLUMNS ARE NOT LIKE FOR LIKE AND THE FIRST REPORT COMPARED THEM
 * AS IF THEY WERE — Codex caught it. A pre-scrim plate mean and a post-scrim
 * rendered strip answer different questions, so a "77-point designed span"
 * against a rendered one proves nothing. What IS comparable is the rendered
 * column against itself, which is why `measure-quiet-ladder.mjs` fixes one
 * region and one method and uses them for every scene of every cut.
 *
 * ⭐⭐⭐ THE LUMA LADDER IS DRAMATIC, NOT DECORATIVE, and the SECOND render is
 * the one that delivers it. The first flattened it to a span of 35 and put
 * scene 3 ABOVE scene 2 — the descent reversed in the middle and the cut read
 * as one even dim video. Delivered now: 158 / 135 / 123 / 95 / 57 / 64, a span
 * of 101, monotonic all the way down with the small lift back at the end.
 * `scripts/measure-quiet-ladder.mjs` is what says so, on the encoded file.
 *
 * ⭐⭐⭐⭐ WHAT ACTUALLY FLATTENED IT, AND THE RULE THAT REPLACES IT.
 *
 * Not the plates. THE SCRIM — assigned per scene to keep type legible: `heavy`
 * on the bright plates, `light` on the dark ones. A per-scene legibility fix
 * applied to a luma ladder is a LADDER-FLATTENING OPERATION BY CONSTRUCTION,
 * because it darkens exactly the plates whose brightness was the point. It kept
 * 39% of the bright plates and 90% of the dark ones. Nothing was misjudged; the
 * mechanism simply guarantees the outcome.
 *
 * ⇒ SO LEGIBILITY IS SOLVED WITH INK POLARITY AND THE SCRIM IS CONSTANT. All six
 * scenes now carry `light`, and a constant scrim cannot flatten anything. The
 * three light plates take DARK ink; the three dark ones keep cream.
 *
 * 🪤🪤 AND THE OLD RULE HERE SAID THE EXACT OPPOSITE — "CREAM INK, NEVER DARK
 * INK, ON THE LIGHT OPENER" — citing a measurement that dark ink decays to
 * 1.4:1 down the block. That measurement was taken on `dawn-a`, 115 luma, under
 * the HEAVIEST scrim, which darkens a pale ground until it is no longer pale.
 * True of that frame; false as a rule, and it cost this cut its arc. Measured on
 * `glass-a` (175) under `light`, dark ink clears the floor at every row of the
 * block — 5.35:1 at its worst — while cream on that same plate and scrim fails.
 * ⭐ A measurement is evidence about the thing measured. Promoting one to a rule
 * carries its conditions along with it, and those were never restated.
 *
 * ⭐⭐⭐ THE INK FLIPS ONCE, ON THE DISSOLVE INTO `stone-d`, AND THE TYPE HANDS
 * OFF THROUGH NOTHING. Two copies are on screen together for all 15 frames of
 * every dissolve in this format; with opposite inks that is dark lettering
 * stacked on cream lettering. So at the crossing the outgoing copy goes to zero,
 * the frame carries NO TYPE for three frames, and the incoming copy arrives.
 * Verified in the render: frames 231–233 hold 0.00% lettering at mean luma
 * 59–63 — a photograph, not the mean-luma-7 hole kinetic shipped at its payload
 * beat. The gap is only safe because the ground there is bright enough to be the
 * light; `checkInkPolarityHandoff` refuses a crossing anywhere it is not.
 *
 * 🪤 AND THE BOUNDARY IS ONE SCENE LATER THAN CODEX PROPOSED, because measuring
 * it moved it. `plaster-c` at 120 luma is the mid-tone, and a mid-tone ground
 * has no room for an accent on either side: gold reads 2.28:1 there, rust 2.34.
 * Dark ink plus a pale ivory accent reads 3.47 and 3.08 — the only pairing that
 * clears the floor on that plate.
 * It keeps dark ink and a pale ivory accent instead, and the flip moves onto the
 * 120 -> 87 step. `checkTextContrast` is the gate that found it; nothing in this
 * repo could see an accent lost against its own photograph before.
 */
export const V58_SCENES: QuietScene[] = [
  // ── RECOGNITION. A social encounter, not an interior state: the viewer is
  //    watching someone else describe them, which is where this wound lives.
  {
    seconds: 2.9,
    bg: "glass-a",
    scrim: "light",
    fg: "#241C14",
    accent: "#67270C",
    line: "They still introduce you as who you used to be.",
    accentWord: "who you used to be",
    under: "and you let it go, again",
  },
  // ── THE CONFIRMING DETAIL. Concrete and small. The format lives here —
  //    "It's always 2 a.m." outperformed everything vaguer.
  {
    seconds: 2.6,
    bg: "linen-b",
    scrim: "light",
    fg: "#1C1712",
    accent: "#67270C",
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
    scrim: "light",
    fg: "#1C1712",
    accent: "#F2E0BC",
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
    scrim: "light",
    fg: "#F5F0E8",
    accent: "#E4B978",
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

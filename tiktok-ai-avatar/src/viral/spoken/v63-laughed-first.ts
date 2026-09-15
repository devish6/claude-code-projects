import type { SpokenScene } from "./scenes";

/**
 * V63 — YOU LAUGHED FIRST SO NOBODY ELSE HAD TO.
 *
 * ⭐⭐⭐⭐ BUILT OFF THE FIRST READING THAT SEPARATES THE BAND FROM THE FLOOR.
 * Read live in TikTok Studio 2026-09-14, the whole organic board in one pull:
 *
 *   V55 you already know          653 / 17 likes
 *   V57 you recognised it         637 / 23
 *   V58 they still introduce you  635 / 13
 *   V61 read the letters          625 / 41   <- SPOKEN, and the most-liked post
 *   V59 you made your peace       615 / 18      the account has ever had
 *   ---------------------------------------- the floor:
 *   V60 the other city            168 / 4    FAILED its bar
 *   V56 everyone comes to you     154 / 2
 *
 * ── ✅ V61 PASSED ITS BAR: 625 >= 400 at 48h ────────────────────────────────
 * The spoken format is not on probation any more, and its likes/view is 6.6%
 * against 3.6% (V57), 2.9% (V59), 2.6% (V55), 2.0% (V58). It reached the same
 * band as the quiet cuts and was liked nearly twice as hard inside it.
 *
 * ── ⭐⭐⭐ THE CONCLUSION THIS CUT IS BUILT ON: A SCENE, NOT A STATE ────────
 * Every cut in the 615-653 band puts the viewer in a MOMENT WITH A WITNESS:
 * someone introduces you wrongly and you stand there (V58); they finish a
 * sentence you'd already recognised (V57); the room goes quiet while you read
 * the letter out loud (V61); you said you were fine and they believed you (V59).
 *
 * BOTH failures describe a STANDING ROLE with nobody else in the frame:
 * "you're the one everyone comes to" (154) and "you still check the weather in
 * the other city" (168) — the second is literally a person alone with a phone.
 *
 * ⇒ The lever is not register, length, plate ladder or bed. It is whether there
 * is a second person in the scene. n=7, one platform, so it is a READING, not a
 * law — but it is the first thing that separates 615-653 from 154-168, and it
 * is testable: this cut is a scene with a whole room in it.
 *
 * ⚠️ It does NOT explain V60's flat tail (168 at 33h and 168 at 60h is a
 * distribution event, not a retention one). Do not fold those two together.
 *
 * ── ⛔ NO MOOLANK, DELIBERATELY ─────────────────────────────────────────────
 * V62 is the moolank-inside-spoken arm and it is only ~6h old (123 views,
 * against V61's 162 at 6.5h). Putting a number in this cut too would leave
 * nothing to compare V62 against. V63 is the no-number control on the same
 * format, one week apart.
 *
 * ── 🎨 GROUNDS: V61's six, RE-SLOTTED, one cut apart ────────────────────────
 * ⛔ None of V62's (stone-d, threshold-f, fold-e, gold-c, water-a, stone-a), so
 * consecutive cuts still share no world. These six are already measured, so no
 * ChatGPT calibration round — that round is where every trap lives.
 *
 * 🪤 `lamp-i` IS NOT THE OPENER, THOUGH IT WAS V61'S. The letter of the rule
 * allows it — frame 0 may not repeat on CONSECUTIVE posts and V62 opened on
 * stone-d — but V61 is the biggest post this account has and re-serving its
 * exact poster frame to the same audience a week later is the V38 shape: a
 * near-clone whose 1s hold collapsed, plausibly on recognition rather than
 * copy. `envelope-j` has never opened a cut.
 *
 *   envelope-j   96   <- the opener, never used at frame 0 before
 *   dial-k       82
 *   steel-l      66
 *   lamp-i      110   <- the turn. The BRIGHTEST plate on the line about being
 *                        in a lit room, so the ladder spikes here instead of
 *                        descending monotonically as V61 and V62 both do.
 *   fan-m        44   <- the refusal, the floor of the cut
 *   doorway-n    58   <- the lift for the ask
 *
 * Span 66.0, against V62's 66.7 and V61's 42.1. All cream ink, CONSTANT light
 * scrim, ZERO polarity crossings.
 *
 * 📋 NOT YET RENDERED, NOT GATED, NOT WATCHED. Bar when posted:
 * TikTok views >= 400 at 48h — the same bar as V61 and V62, so all three
 * compare directly.
 */
export const V63_SCENES: SpokenScene[] = [
  // ── FRAME 0, THE POSTER FRAME. A scene with a whole room in it, in one
  //    clause. ⭐ The second person is present in the first six words — that is
  //    the entire thesis of this cut, put where the scroller meets it.
  {
    bg: "envelope-j",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "You laughed first so nobody else had to.",
  },
  // ── THE ABSOLUTION, before the wound, the V61/V62 shape: name what it looks
  //    like from outside, then say what it actually was.
  {
    bg: "dial-k",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "You didn't find it funny. The silence was about to cost someone something.",
  },
  // ── THE STING. ⭐⭐⭐ WOUND, NOT ACCUSATION: it names what the room concluded,
  //    never what the viewer is. Being read as easy-going is a pain the viewer
  //    ALREADY FEELS, and the line credits their loyalty in the same breath.
  {
    bg: "steel-l",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "So the room decided you were easy-going, and nobody checked.",
  },
  // ── THE TURN. Still a scene, still witnessed — the cost, stated as a thing
  //    that happens in a room rather than a verdict on a character.
  {
    bg: "lamp-i",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "You have been in rooms where you were the only one working.",
  },
  // ── THE PAYOFF. ⭐⭐⭐ IT REFUSES THE CONSOLATION THIS THEME ATTRACTS —
  //    "stop making it easy for everyone", which is advice shaped like blame.
  //    Promises no outcome, no date, no amount, per the production ETHICS_BLOCK.
  {
    bg: "fan-m",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "I won't tell you to stop doing it.",
  },
  // ── THE ASK. Bookends frame 0 on the same behaviour and gives the send a
  //    person the viewer can picture — the other one who laughs first.
  //    ⛔ Never a bare URL: the route lives in the caption and pinned comment.
  {
    bg: "doorway-n",
    scrim: "light",
    fg: "#FFF0E4",
    accent: "#FF9152",
    text: "Send this to the other one who laughs first.",
  },
];

/** The beat the cut is built to reach. Everything before it withholds. */
export const V63_PAYOFF_INDEX = 4;

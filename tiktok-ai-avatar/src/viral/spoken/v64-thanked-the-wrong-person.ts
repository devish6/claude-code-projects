import type { SpokenScene } from "./scenes";

/**
 * V64 — THEY THANKED THE WRONG PERSON AND YOU LET IT STAND.
 *
 * ⭐⭐⭐⭐ THE FIRST CUT BUILT ON A CONFIRMED READING, NOT A FRESH GUESS.
 * Board read live in TikTok Studio 2026-09-15, whole organic board one pull:
 *
 *   V55 you already know          653 / 17
 *   V57 you recognised it         637 / 23
 *   V58 they still introduce you  635 / 13
 *   V61 read the letters          625 / 41   SPOKEN — most-liked post ever
 *   V59 you made your peace       615 / 18
 *   V62 four seconds / three days 455 / 10   SPOKEN + moolank — PASSED its bar
 *   DRAW01 carousel               421 /  5
 *   ---------------------------------------- the floor:
 *   V60 the other city            168 /  4   FAILED
 *   V56 everyone comes to you     154 /  2   FAILED
 *
 * ── ✅✅ THE SCENE-NOT-A-STATE READING SURVIVED ITS FIRST TEST ──────────────
 * V62 was built on it and cleared 400 inside 24h (455). V63 was built on it and
 * opened at 116 in ~1.5h, ahead of both V61 (162 @ 6.5h) and V62 (123 @ 6h) at
 * the same age. Three for three, and the two failures are still the only two
 * cuts on the board that describe a STANDING ROLE with nobody else in frame.
 * n=9 on one platform — a reading with a passed prediction behind it now, but
 * still not a law. ⛔ Do NOT fold in V60's flat tail; that is distribution.
 *
 * ── ⭐⭐⭐ WHAT THIS CUT ADDS: THE WITNESS DOES SOMETHING, ON PURPOSE ────────
 * Inside the winning band, the moment always has another person ACTING and the
 * viewer ABSORBING it: they introduce you wrongly (V58), they finish the
 * sentence (V57), the room goes quiet while you read (V61), they believed you
 * were fine (V59). V63 is the one where the VIEWER acts and the room absorbs,
 * and it is the weakest opener of the three spoken cuts on IG watch-through
 * ordering. So V64 puts the viewer back on the receiving side: someone else
 * speaks, in a room, and the viewer says nothing. That is the arm being tested.
 *
 * ── 🧲 THE IG SIGNAL THAT PICKED THE THEME ─────────────────────────────────
 * Lowest skip rate the account has ever recorded is V58 at 0.471 — "they still
 * introduce you as who you used to be", a public misattribution the viewer
 * stands through. V64 is the same wound one step further: not being described
 * wrongly, but being credited wrongly, out loud, while someone else is thanked.
 *
 * ── ⛔ NO MOOLANK ───────────────────────────────────────────────────────────
 * V62 is the moolank arm (455) and V63 the no-number control (running). One
 * more no-number cut keeps the number arm at n=1 rather than muddying it; the
 * next cut after this one is where a second number belongs.
 *
 * ── 🎨 GROUNDS: V62's six, RE-SLOTTED, one cut apart ────────────────────────
 * ⛔ None of V63's (envelope-j, dial-k, steel-l, lamp-i, fan-m, doorway-n), so
 * consecutive cuts still share no world. All six are already measured, so no
 * ChatGPT calibration round — that round is where every trap lives.
 *
 *   threshold-f  60.2  <- the opener. V62 opened on stone-d, so this plate has
 *                         never carried a frame 0.
 *   fold-e       49.1
 *   gold-c       31.3
 *   stone-d      98.3  <- the turn. The BRIGHTEST plate on the line about a
 *                         lit room full of people, so the ladder spikes here.
 *   water-a      22.3  <- the refusal, the floor of the cut
 *   stone-a      31.0  <- the lift for the ask
 *
 * Span 76.0, against V63's 66.0, V62's 66.7, V61's 42.1. All cream ink,
 * CONSTANT light scrim, ZERO polarity crossings.
 */
export const V64_SCENES: SpokenScene[] = [
  // ── FRAME 0, THE POSTER FRAME. ⭐ The second person acts in word two, and the
  //    viewer's non-action lands in the same clause. The whole thesis of the
  //    reading, put where the scroller meets it.
  {
    bg: "threshold-f",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "They thanked the wrong person and you let it stand.",
  },
  // ── THE ABSOLUTION, before the wound — the V61/V62/V63 shape. Name what the
  //    silence looks like from outside, then say what it actually cost.
  {
    bg: "fold-e",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "You weren't being modest. Correcting it in front of everyone was worse.",
  },
  // ── THE STING. ⭐⭐⭐ WOUND, NOT ACCUSATION: it names what the ROOM learned,
  //    never what the viewer is. The pain is one the viewer already feels, and
  //    nothing here asks them to agree they were weak.
  {
    bg: "gold-c",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "So the room learned who to thank, and it kept thanking them.",
  },
  // ── THE TURN. Still a scene, still witnessed, still in a room — the cost
  //    stated as something that happened, not as a verdict on a character.
  {
    bg: "stone-d",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "You have sat through applause for work you did alone.",
  },
  // ── THE PAYOFF. ⭐⭐⭐ IT REFUSES THE CONSOLATION THIS THEME ATTRACTS —
  //    "it evens out in the end", the ledger fantasy. ⛔ Distinct from V58's
  //    refusal ("they'll catch up") and V62's ("the right ones stay"): this one
  //    refuses the BOOKKEEPING, not the audience. Promises no outcome, no date,
  //    no amount, per the production ETHICS_BLOCK.
  {
    bg: "water-a",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "I won't tell you that it evens out later.",
  },
  // ── THE ASK. Bookends frame 0 on the same room and gives the send a person
  //    the viewer can actually picture — someone who was standing there.
  //    ⛔ Never a bare URL: the route lives in the caption and pinned comment.
  {
    bg: "stone-a",
    scrim: "light",
    fg: "#FFF0E4",
    accent: "#FF9152",
    text: "Send this to whoever else was in that room.",
  },
];

/** The beat the cut is built to reach. Everything before it withholds. */
export const V64_PAYOFF_INDEX = 4;

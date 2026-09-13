import type { SpokenScene } from "./scenes";

/**
 * V61 — YOU WERE THE ONE WHO READ THE LETTERS OUT LOUD.
 *
 * ⭐⭐⭐⭐ THE FIRST CUT IN THE SPOKEN FORMAT. Spec:
 * `docs/specs/2026-09-12-spoken-format-design.md`.
 *
 * ── THE THEME, AND THE RECYCLE RULING THAT SHAPED IT ────────────────────────
 * The owner's first choice was "the one who handles everything". That OVERLAPS
 * two shipped cuts and was sharpened rather than shipped:
 *
 *   · V56 owns the capable-person-carrying-an-unreciprocated-load wound —
 *     "You always pick up." / "Nobody asks you the same question back." /
 *     "The strong one doesn't get asked." (#caretaker #emotionallabour)
 *   · V59 owns competence-as-a-trap — "You handled it well, so nobody asks any
 *     more. Competence reads as closure."
 *
 * ⇒ The clean air is ORIGIN, not present capability. V56 and V59 are both about
 * who the viewer is NOW; this is about a role assigned THEN — the eldest one who
 * translated at the bank and the doctor's, read the letters, made the calls,
 * knew which drawer. 🪤 The no-recycled-ideas rule bites hardest exactly where
 * it feels satisfied: V44 changed CATEGORY and kept V43's opening string, and
 * its 1s hold halved.
 *
 * ── WHICH OF THE THREE, AND THE WOUND ───────────────────────────────────────
 * FEELING. Nobody pays for information — V43-V49 sold seven facts and V49 took
 * 84 views. The becoming is *someone whose childhood is allowed to have cost
 * something.*
 *
 * ⭐⭐⭐ WOUND, NOT ACCUSATION, and this one needed watching because the obvious
 * version accuses somebody. "Your parents made you grow up too fast" blames
 * them; "you never got to be a child" invites self-pity. Scene 4 exists to take
 * the blame off everyone — *nobody decided this* — so the cut is not a complaint
 * about the viewer's family, and every line names something that HAPPENED or
 * something they were genuinely good at.
 *
 * ⭐⭐⭐ AND IT REFUSES TO CONSOLE, at index 4, which is the beat the cut is
 * built to reach. "It made you who you are" is the hollow thing every one of
 * these viewers has already been handed, and consolation is 0-for-4 on this
 * account (V34, V35, V37, V38). What replaces it reads the cycle they were in
 * and the one they are in now — a promise about a conversation, never an
 * outcome, a date or an amount, per the production ETHICS_BLOCK.
 *
 * ── ⛔ WHAT IT CLAIMS: NOTHING ──────────────────────────────────────────────
 * No number, no letter value, no date arithmetic, no forecast. `v61.test.ts`
 * asserts that NEGATIVE, because a grep for a phrase that is present can never
 * detect one that was removed.
 *
 * ── 🎨 THE GROUNDS, AND WHY THE LADDER IS DARKER THAN THE SPEC SAID ─────────
 * Six new plates, warm tungsten Indian domestic night — a true break from the
 * cool grey "interior after rain" world that V58, V59 and V60 all share.
 * Art direction: `docs/v61-art-direction.md`.
 *
 *   lamp-i      110   a tungsten lamp on a kitchen table   <- the opener
 *   envelope-j   96   a window envelope among papers
 *   dial-k       82   a landline handset
 *   steel-l      66   the rim of a steel tumbler
 *   fan-m        44   a ceiling fan blade in dim light     <- the refusal
 *   doorway-n    58   a lit doorway from a dark room       <- the lift for the ask
 *
 * 🔴 THE SPEC SAID 145 FOR THE TOP PLATE AND THAT WAS WRONG — it was sized
 * against cream ink alone. Cream (relLum 0.932) clears 3.0:1 up to ~142
 * post-scrim, but the gold accent (relLum 0.504) only clears to ~103 post-scrim,
 * and raising the accent towards cream fails `checkAccentContrast`'s 60-channel
 * distance instead. On a mid-tone ground those two gates are in genuine tension
 * — the repo's scrim note says exactly this. ⇒ The ladder came down. Gold on the
 * 110 plate computes to ~3.13:1, which clears with little margin, so the
 * MEASURED bands decide and not this arithmetic.
 *
 * ⭐ All cream ink, CONSTANT `light` scrim, ZERO polarity crossings — this
 * format has no ink handoff, so a flip is not merely discouraged, it is
 * unrenderable by gate.
 */
export const V61_SCENES: SpokenScene[] = [
  // ── FRAME 0, THE POSTER FRAME. The concrete detail IS the hook: "read the
  //    letters out loud" needs no setup, and anyone who did it knows instantly.
  //    ⭐ "It's always 2 a.m." beat everything vaguer, and the owner has
  //    rejected a cut for being vague. This is the specific, slightly
  //    embarrassing, true version of "you grew up too fast".
  {
    bg: "lamp-i",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "You were the one who read the letters out loud.",
  },
  // ── THE RECOGNITION. The envelope with the window in it is the object every
  //    one of these households remembers, and naming it is what makes the
  //    viewer certain the cut is about them and not about someone like them.
  {
    bg: "envelope-j",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "The ones with the little window in the envelope.",
  },
  // ── THE TURN, stated as competence rather than damage. "You knew which
  //    drawer" is praise, and the cut earns its later lines by saying the true
  //    generous thing first — the same move V56 makes with "you always pick up".
  {
    bg: "dial-k",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "You made the phone calls. You knew which drawer.",
  },
  // ── THE WOUND, AND THE ABSOLUTION IN THE SAME BREATH. ⚠️ This is the line
  //    that keeps the cut from becoming an accusation about the family: nobody
  //    chose it, it simply needed doing and the viewer was the one who could.
  {
    bg: "steel-l",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "Nobody decided this. It just needed doing, and you could.",
  },
  // ── THE PAYOFF, index 4. ⭐⭐⭐ IT REFUSES THE CONSOLATION THIS THEME ALWAYS
  //    ATTRACTS. "It made you who you are" is what these viewers have been told
  //    by everyone who ever noticed, and it costs them the right to have minded.
  //    What is offered instead is a reading of the cycles, which promises
  //    nothing about where any of it goes.
  {
    bg: "fan-m",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "I won't tell you it made you who you are.",
  },
  // ── THE ASK. A send to a fellow sufferer named by the SAME BEHAVIOUR, never
  //    a rescuer, and it bookends frame 0 on "the letters" the way V60 bookends
  //    on "weather".
  //    ⛔ Never a bare URL: half of views arrive muted from a feed where nothing
  //    on screen is tappable. The route lives in the caption and the pinned
  //    first comment, which is what converts the RECEIVER of a send.
  {
    bg: "doorway-n",
    scrim: "light",
    fg: "#FFF0E4",
    accent: "#FF9152",
    text: "Send this to whoever else read the letters.",
  },
];

/** The beat the cut is built to reach. Everything before it withholds. */
export const V61_PAYOFF_INDEX = 4;

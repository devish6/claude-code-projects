import type { SpokenScene } from "./scenes";

/**
 * V62 — YOU READ IT IN FOUR SECONDS AND ANSWERED THREE DAYS LATER.
 *
 * ⭐⭐⭐⭐ THE FIRST CUT THAT PUTS A MOOLANK INSIDE THE SPOKEN FORMAT. Owner's
 * ask, 2026-09-13: *"a mix of moolanks and the kind of video we just posted
 * yesterday"* — yesterday being V61, read off Instagram and TikTok rather than
 * off memory, which had it as unposted for the second day running.
 *
 * ── WHERE THE NUMBER ENTERS, AND WHY NOT AT FRAME 0 ─────────────────────────
 * The number lands at index 3, THE TURN. Beats 0-2 are a wound anyone can
 * recognise, so the hook is not gated on being a 7; the dates arrive only once
 * the viewer has already agreed the cut is about them.
 *
 * ⛔ NOT at frame 0, and that is measured, not preferred: V44 opened on
 * `BORN 1ST, 10TH, 19TH OR 28TH?` and its 1s hold went 61.2% -> ~42% with views
 * 219 -> 134, under the ~200 seeding floor. A number-first poster frame asks the
 * scroller to do arithmetic before it has given them a reason to.
 * [[numevix-new-era-no-prerendered]]
 *
 * ── 🔴🔴 THE THING THIS CUT IS FORBIDDEN TO SAY, AND WHO FORBADE IT ─────────
 * `friendship.ts` makes 7 the ONE number not friendly to itself (friend
 * [2, 3, 6], neutral to itself) and gives it a mutual set of [2] alone. All of
 * that is TRUE and DERIVED — and `BELIEF_CORRECTION_SEVEN` in
 * `src/viral/templates.ts` already refused to put it on screen, because naming
 * it *"would hand a 7 a verdict about being alone"*. `content/angles.json`
 * inherits that refusal into `one-way-match`.
 *
 * ⇒ ⛔ NO friendship table, NO pair list, NO "alone", NO self-friendliness, in
 * the video OR the caption. `v62.test.ts` asserts that NEGATIVE, because a grep
 * for a phrase that is present can never detect one that was removed. It is also
 * the STING RULE working: "you are the only number not friends with itself" is a
 * verdict ON the reader, and verdicts are 0-for-4 here (V34, V35, V37, V38).
 *
 * ── WHAT IT DOES CLAIM: TWO THINGS, BOTH ALREADY VETTED ─────────────────────
 * 1. **The dates.** 7th / 16th / 25th IS the definition of moolank 7 — digit
 *    arithmetic, not a trait. Nothing to contradict.
 * 2. **Called cold, it is caution.** Derived from `moolank-cards.json` #7:
 *    `relationships` ("trust comes slowly") and `shadow[0]` ("Questions even the
 *    good things"), quoted as the BELIEF and then corrected. This is the exact
 *    claim `BELIEF_CORRECTION_SEVEN` was built on — that cut was gated,
 *    frame-scanned and then DEFERRED when the run switched angles, so the claim
 *    is owner-approved and has never been published.
 *
 * ⚠️ V61 claimed NOTHING. This one claims those two things, which is a real
 * difference between the two cuts and not an oversight.
 *
 * ── THE WOUND, AND WHY IT IS NOT AN ACCUSATION ──────────────────────────────
 * It names how OTHERS read the viewer, never what the viewer is — the V58 shape
 * ("they still introduce you as who you used to be"), which is the best of the
 * recent band at 635 TikTok / 255 Instagram. Beat 2 is the sting: being called
 * cold by people you would have taken a bullet for is a pain the viewer ALREADY
 * FEELS. Beat 1 does the absolving before the wound lands, the way V61's "nobody
 * decided this" does.
 *
 * ── 🎨 THE GROUNDS: REUSED ON PURPOSE, NO NEW PLATE ROUND ───────────────────
 * Six existing measured plates. Generating six more would mean another ChatGPT
 * calibration round, and that round is where every trap in
 * [[numevix-spoken-format]] lives (luma targets ignored, dark plates
 * unrecoverable, md5-verify every download).
 *
 * ⛔ NONE of V61's six (lamp-i, envelope-j, dial-k, steel-l, fan-m, doorway-n),
 * so two consecutive spoken cuts do not share a world. The opener `stone-d` has
 * appeared mid-cut in V58/V59/V60 and has NEVER opened a cut.
 *
 *   stone-d      86.0   <- the opener
 *   threshold-f  52.7
 *   fold-e       43.0
 *   gold-c       27.8   <- the turn, where the dates land
 *   water-a      19.3   <- the refusal, the floor of the cut
 *   stone-a      26.9   <- the lift for the ask
 *
 * Delivered span 66.7 against V61's 42.1 — the single-ink-polarity rule caps the
 * top of any cream ladder near ~103 (the gold accent, not the cream, is the
 * binding constraint), so this is close to the most range the format allows.
 * Figures are `groundLuma(bg, "light")`, the repo's own function, not arithmetic
 * done here.
 *
 * ⭐ All cream ink, CONSTANT `light` scrim, ZERO polarity crossings.
 */
export const V62_SCENES: SpokenScene[] = [
  // ── FRAME 0, THE POSTER FRAME. The specific, slightly embarrassing, true
  //    version of "you take a long time to trust". ⭐ The owner has rejected a
  //    cut for being vague, and "it's always 2 a.m." beat everything vaguer.
  //    A concrete behaviour needs no setup: anyone who has done it knows in one
  //    beat, and nobody who hasn't is being accused of anything.
  {
    bg: "stone-d",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "You read it in four seconds and answered three days later.",
  },
  // ── THE ABSOLUTION, BEFORE THE WOUND. Two sentences, so the pager breaks it
  //    into two whole clauses. This is the belief-correction shape in miniature:
  //    name what it looks like, then say what it actually was.
  {
    bg: "threshold-f",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "Not because you didn't care. Because you were still deciding.",
  },
  // ── THE STING. ⭐⭐⭐ WOUND, NOT ACCUSATION: it names what other people did
  //    with the silence, and it names the viewer's loyalty in the same line, so
  //    the cut is not a complaint about the viewer OR about the people around
  //    them. "Taken a bullet for" is the part that hurts — the coldness was read
  //    onto someone who was anything but.
  {
    bg: "fold-e",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "You've been called cold by people you'd have taken a bullet for.",
  },
  // ── THE TURN, index 3. The only beat that carries a number, and it carries
  //    ONLY the dates. ⛔ No planet, no trait, no pair — the identification is
  //    the whole job, and the viewer does the rest.
  {
    bg: "gold-c",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "Born on the 7th, the 16th or the 25th.",
  },
  // ── THE PAYOFF, index 4. ⭐⭐⭐ IT REFUSES THE CONSOLATION THIS THEME ALWAYS
  //    ATTRACTS — "the right ones will wait for you", which every cautious
  //    person has been handed and which quietly blames them for the ones who
  //    didn't. What replaces it promises no outcome, no date and no amount, per
  //    the production ETHICS_BLOCK.
  {
    bg: "water-a",
    scrim: "light",
    fg: "#FFF6EA",
    accent: "#E8B36A",
    text: "I won't tell you the right ones stay long enough.",
  },
  // ── THE ASK. Names the SAME BEHAVIOUR as frame 0, never a rescuer, and gives
  //    the send a target the viewer can actually picture. It bookends the poster
  //    frame on "answered three days later" exactly as V61 bookends on "the
  //    letters".
  //    ⛔ Never a bare URL: half of views arrive muted from a feed where nothing
  //    on screen is tappable. The route lives in the caption and the pinned
  //    first comment, which is what converts the RECEIVER of a send.
  {
    bg: "stone-a",
    scrim: "light",
    fg: "#FFF0E4",
    accent: "#FF9152",
    text: "Send this to the 7 who answered three days later.",
  },
];

/** The beat the cut is built to reach. Everything before it withholds. */
export const V62_PAYOFF_INDEX = 4;

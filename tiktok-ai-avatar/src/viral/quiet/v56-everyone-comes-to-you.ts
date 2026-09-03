import type { QuietScene } from "./scenes";

/**
 * V56 — YOU'RE THE ONE EVERYONE COMES TO.
 *
 * ⭐⭐⭐⭐ THE QUIET FORMAT REPLICATED ON INSTAGRAM AND THIS IS THE THIRD CUT.
 * V55 was shipped as a format test with a pre-registered bar of 3,100 ms
 * Instagram average watch. Measured on posting day it came in at **7,745 ms** —
 * 2.5x the bar — with a skip rate of 0.500. The two quiet cuts now sit in a
 * band that nothing else on this account touches:
 *
 *                              IG avg watch    IG skip
 *   V50  (quiet,  15.8s)          7,988 ms      0.474
 *   V55  (quiet,  16.2s)          7,745 ms      0.500
 *   ── every other post, 18 of them, 2026-08-14 → 09-02 ──
 *   median                        3,350 ms      ~0.83
 *   best non-quiet (Aug 15)       7,590 ms      0.690
 *   worst (V54, kinetic)          2,790 ms      0.939
 *
 * 🔴 THE SEPARATION IS CLEAN AND THAT IS THE WHOLE FINDING. Both quiet cuts
 * skip below 0.51. All eighteen other posts in the window skip above 0.68.
 * There is no overlap at all — not a difference of means with tails that touch,
 * two disjoint sets. On n=2 that is not proof, but it is the first time this
 * account has produced a variable that separates its own catalogue without
 * exception, and it has now happened twice in a row on purpose.
 *
 * ⚠️ THE HONEST LIMIT, STATED WHERE IT CANNOT BE SKIPPED. V55 was served **19
 * reach and 24 views** on Instagram. V50 was served 38. These are the two best
 * retention numbers the account has ever recorded and they are measured on
 * fewer than fifty humans between them. The watch-time finding is real and the
 * ranking is real; any claim about how many people it would hold is not.
 *
 * ⛔⛔ AND INSTAGRAM IS NO LONGER AN INSTRUMENT FOR ANYTHING ELSE. Daily reach:
 * ~185/day mid-August → 32 on 09-02 → **19 on 09-03**. The account is being
 * shown to nobody there, and no creative decision can be read off a 19-reach
 * denominator. Retention still reads because it is a RATIO over people who did
 * see it; view counts and reach do not.
 *
 * ── WHERE THE AUDIENCE ACTUALLY IS, MEASURED 2026-09-03 ─────────────────────
 *                     last video (V55)      the platform
 *   Instagram         19 reach / 24 views   dead — 19/day and falling
 *   TikTok            126 views in ~5h      52 posts, 400–650/post settles
 *   YouTube           (window predates)     1K views/wk, +119% WoW, +211% engaged
 *
 * ⇒ TikTok is the judging platform and YouTube is the one compounding. V55's
 * TikTok like rate is **5.6% of views (7/126)** against 1.4% for V54 and 2.5%
 * for V53 — early and on a small base, but pointing the same way as the
 * Instagram retention.
 *
 * 🪤 WHAT COULD NOT BE READ, AND IS THEREFORE NOT CLAIMED. V55's TikTok average
 * watch and watched-full were still unavailable five hours after posting, so
 * two of its three pre-registered bars COULD NOT BE JUDGED. That is the same
 * failure V54 recorded (its YouTube primary was still processing two days out)
 * and it is now the second time in three cuts. ⭐⭐ The rule was written down
 * and then broken again: PRE-REGISTER ONLY INSTRUMENTS THAT EXIST INSIDE THE
 * JUDGING WINDOW. V56 pre-registers Instagram average watch and TikTok views at
 * 48h, both of which have always been readable, and nothing else.
 *
 * ── WHY A THIRD CUT AND NOT A FOURTH FORMAT ────────────────────────────────
 * Because the format is the only variable that has ever moved this account's
 * attention, and it has moved it twice. ⛔ The idea is new; the format is
 * deliberately identical — same six beats, same payoff at index 4, same refusal
 * shape, same send-to-a-named-person ask, same 14–18s band. Changing anything
 * else would confound the third measurement of the only thing that works.
 *
 * ── WHICH OF THE THREE, AND THE WOUND ───────────────────────────────────────
 * **FEELING**, and the becoming is *someone who is allowed to be the one who
 * needs something.* [[numevix-what-people-buy]] — nobody pays for information,
 * they pay to become someone.
 *
 * The moment, and it is neither of the other two: V50 is 2 a.m. after the thing
 * went wrong. V55 is the week before a decision nobody will authorise. This is
 * neither — it is the person everyone else brings their 2 a.m. to, who has
 * never once been on the other end of that call. It is the audience for both
 * previous cuts, described from the outside.
 *
 * ⭐⭐⭐ WOUND, NOT ACCUSATION, and this one had to be watched closely because
 * the obvious version of it is an accusation. "You never let anyone in" blames
 * the viewer for their own isolation; "you should ask for help" is the same
 * sentence with a bow on it. Every line here names something that HAPPENED to
 * them (nobody asks back, the strong one doesn't get asked) or something they
 * already are and should be proud of (you always pick up). Scene 2's `under`
 * exists solely to take the blame off everyone — *not because they don't care*
 * — so the cut never becomes a complaint about the viewer's friends either.
 *
 * ⭐⭐⭐ AND IT REFUSES TO CONSOLE, at index 4, which is the beat the cut exists
 * to reach. "You deserve support too" is the dead version, and consolation is
 * 0-for-4 on this account (V34, V35, V37, V38). What is withheld is the advice
 * every one of these viewers has already been given and already ignored.
 *
 * ── ⛔ WHAT IT CLAIMS: NOTHING ──────────────────────────────────────────────
 * 🔴 No number, no letter value, no date arithmetic, no forecast, anywhere.
 * `v56.test.ts` asserts that NEGATIVE, because a grep for a phrase that is
 * present can never detect one that was removed.
 *
 * ── 🎨 THE GROUNDS ──────────────────────────────────────────────────────────
 * Arc: dawn → stone → night → water → gold → ember.
 *
 * ⚖️ RULING, AND IT RELAXES V55'S GATE ON PURPOSE. Thirteen grounds exist.
 * `dawn-a` is fixed at frame 0 (the only light one, and frame 0 is the cover)
 * and `ember-b` at the close (the only self-lit one), leaving eleven for four
 * interior beats. V50 spent four and V55 spent four more, so only three were
 * left unused — one short of what a third cut needs. The gate therefore binds
 * against **V55 only**, plus a hard ban on either predecessor's PAYOFF ground:
 *   · shares no interior ground with V55 (the cut one day old) — ENFORCED
 *   · payoff is neither `stone-a` (V50's) nor `gold-c` (V55's) — ENFORCED
 *   · may reuse a V50 interior in a NON-payoff slot — permitted, six days apart
 * The documented failure being guarded against is V43/V44: two CONSECUTIVE cuts
 * opening on 99.5% identical pixels, where V44's 1s hold halved. Distance in
 * time is the active ingredient, so the gate is scoped to the neighbour and to
 * the two frames that matter most. `gold-a` has never been used at all and it
 * carries the payoff.
 */

/** ⭐ No kicker chip anywhere in this format — the chip is the V-series tell. */
export const V56_SCENES: QuietScene[] = [
  // ── FRAME 0, THE POSTER FRAME. Static, fully populated, no entrance. ──────
  //    ⭐ It opens on a COMPLIMENT the viewer has heard before and never once
  //    experienced as a good thing. That is the one-element hook: complete in
  //    second one, gates nobody, and carries its own ache without an argument.
  {
    seconds: 2.8,
    bg: "dawn-a",
    scrim: "heavy",
    fg: "#FFF6EA",
    accent: "#F4CE8E",
    line: "You're the one everyone comes to.",
    accentWord: "everyone comes to",
  },
  // ── The recognition beat, and it is PRAISE. The cut earns the right to the
  //    later lines by first saying the true generous thing about them.
  {
    seconds: 2.5,
    bg: "stone-a",
    scrim: "light",
    fg: "#EDEDED",
    accent: "#C6A183",
    line: "You always pick up.",
    accentWord: "always pick up",
    under: "even when you have nothing left to give",
  },
  // ── ⭐ THE TURN, AND THE LINE THE ANGLE RESTS ON. It is stated as an event,
  //    never as a fault — and the `under` deliberately absolves everyone else
  //    so the cut cannot be heard as a complaint about the viewer's friends.
  {
    seconds: 2.7,
    bg: "night-b",
    scrim: "light",
    fg: "#EEF2FA",
    accent: "#93AEDC",
    line: "Nobody asks you the same question back.",
    accentWord: "asks you",
    under: "not because they don't care",
  },
  // ── The structural reason, in six words. ⚠️ Wound, not accusation: it names
  //    a rule about how the world treats capable people, not a flaw in them.
  {
    seconds: 2.6,
    bg: "water-b",
    scrim: "light",
    fg: "#E9F1F8",
    accent: "#86B4D2",
    line: "The strong one doesn't get asked.",
    accentWord: "doesn't get asked",
    under: "so you carry yours quietly",
  },
  // ── THE PAYOFF, index 4, starting at 10.6s — well past the 6.4s gate.
  //    ⭐⭐⭐ AND IT REFUSES TO CONSOLE. "Ask for help" is precisely what this
  //    viewer has been told by everyone who has ever noticed, and precisely
  //    what they have already declined to do. Saying it again is the dead cut.
  //    What is offered instead is the one thing nobody has offered: to be the
  //    person who asks THEM a question.
  //    🪤 It asserts nothing. "What your chart says you're carrying" is a
  //    promise about a conversation, not a forecast.
  {
    seconds: 2.9,
    // 🔴 `gold-a` — never used in this format by either predecessor, and
    //    deliberately not `stone-a` (V50's payoff) or `gold-c` (V55's). It is
    //    warm, it bridges the cool water beat into the ember close, and it puts
    //    the account's three most important frames on three different grounds.
    bg: "gold-a",
    scrim: "normal",
    fg: "#F3F1EC",
    accent: "#E0A855",
    line: "I'm not going to tell you to ask for help.",
    accentWord: "ask for help",
    under: "I'll tell you what your chart says you're carrying",
  },
  // ── THE ASK. A send to a named person, and the naming closes scene 3's loop
  //    the way V55's "months" closed its own scene 1.
  //
  //    ⚔️ Settled ruling stands: the MECHANISM is Funnel's (a send to a
  //    specific human, never a save) and the WORDING is Angle's (the target is
  //    named by a wound, never by reassurance). "The other one who never gets
  //    asked" is identifiable in under a second and comforts nobody.
  //
  //    🔴 SAVES STAY KILLED ON THE COUNTS: August corr(reach, saves) = 0.74.
  //    ⚠️ AND THE LIMIT ON THE SEND: shares do NOT buy reach here (Spearman
  //    0.12 across August). It is chosen because at ~52 followers it is the
  //    only act that produces a WARM arrival, not because it compounds.
  //    ⛔ Never a bare URL — half of views arrive muted from a feed where
  //    nothing on screen is tappable. The route lives in the caption and the
  //    pinned first comment, which is what converts the RECEIVER of a send.
  {
    seconds: 2.9,
    bg: "ember-b",
    scrim: "light",
    fg: "#FFF0E4",
    accent: "#FF9152",
    line: "Send this to the other one who never gets asked.",
    accentWord: "never gets asked",
    under: "they'll know why · @numevix",
  },
];

/** The beat the cut is built to reach. Everything before it withholds. */
export const V56_PAYOFF_INDEX = 4;

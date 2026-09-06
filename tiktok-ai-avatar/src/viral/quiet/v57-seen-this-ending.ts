import type { QuietScene } from "./scenes";

/**
 * V57 — YOU RECOGNISED IT BEFORE THEY FINISHED THE SENTENCE.
 *
 * ⭐⭐⭐⭐ THE FOURTH QUIET CUT, AND THE FIRST ONE THAT CHANGES THE SURFACE
 * RATHER THAN ONLY THE IDEA. V56 failed both of its pre-registered bars.
 *
 * ── WHAT V56 ACTUALLY DID, MEASURED 2026-09-05 ──────────────────────────────
 *   bar: Instagram average watch >= 7,000 ms   →  6,324 ms   ✗ FAIL
 *   bar: TikTok views at 48h >= 400            →  113 at ~38h ✗ FAILING
 * V55 settled at 653 TikTok views and V50 at 607, so 113 is not a slow start,
 * it is a different outcome.
 *
 * ⭐⭐⭐⭐ AND THE THREE CUTS DECLINE MONOTONICALLY ON BOTH INSTRUMENTS:
 *
 *                    IG avg watch   IG skip   TikTok views   posted
 *   V50 (quiet)         7,652 ms     0.474        607        08-30
 *   V55 (quiet)         6,871 ms     0.571        653        09-03
 *   V56 (quiet)         6,324 ms     0.706        113        09-04
 *   other 17 of last 20  3,246 ms     0.844         —          —
 *
 * 🪤🪤 THE NUMBERS IN THIS REPO'S MEMORY WERE READ AT FIVE HOURS AND THEY DECAY.
 * V55 was recorded as 7,745 ms / skip 0.500 / 19 reach on posting day. Settled,
 * it is 6,871 ms / 0.571 / 21. ⇒ **A retention number read inside the first day
 * is not the number.** Every comparison here uses settled values, and the decay
 * runs the RIGHT way for the finding below: V56 is the YOUNGEST of the three and
 * still the WORST, so its true deficit is if anything understated.
 *
 * 🔴 THE "TWO DISJOINT SETS" CLAIM IS DEAD. V50 and V55 were said to skip below
 * 0.51 while all eighteen other posts skipped above 0.68 — no overlap. On
 * settled data V56 skips 0.706, above the best non-quiet post's 0.691. The
 * quiet format still beats the median by roughly 2x on watch time and it is
 * still the only thing on this account that has ever cleared 6,000 ms. It no
 * longer sorts the catalogue without exception. ⛔ Do not restate the disjoint
 * claim; it was true of two cuts and is not true of three.
 *
 * ── ⭐⭐⭐⭐ WHY THE SURFACE, AND NOT THE IDEA ──────────────────────────────
 * The tempting read is that the ideas drifted — V50 and V55 are first-person
 * interior states, V56 stepped outside to a compliment about the viewer's
 * social role. That is probably a real contributor and this cut acts on it too
 * (see THE MOMENT below). But it is not what the recommendation rests on,
 * because it has NO same-account control: three points declining in order is a
 * 1-in-6 shape under pure noise, measured on 38/21/34 humans.
 *
 * ⭐⭐⭐ WHAT DOES HAVE A CONTROL IS REPETITION, AND THE CONTROL IS V43/V44 —
 * two CONSECUTIVE cuts that opened on 99.5% identical pixels, where V44's
 * one-second hold HALVED. Now look at the openings of the three quiet cuts:
 *
 *   V50  dawn-a → … → ember-b     (no quiet predecessor)          skip 0.474
 *   V55  dawn-a → … → ember-b     (4 days after V50)              skip 0.571
 *   V56  dawn-a → … → ember-b     (ONE day after V55)             skip 0.706
 *
 * ⭐⭐⭐⭐ **ALL THREE OPEN ON THE SAME GROUND AND CLOSE ON THE SAME GROUND, AND
 * THE SKIP RATE DEGRADES WITH PROXIMITY TO THE PREVIOUS ONE.** Skip rate is
 * defined as the share of views abandoned inside the first three seconds — it
 * is a measurement OF THE OPENING FRAME, and the opening frame is the thing
 * that has been held constant. The ordering is exactly what a learned surface
 * produces, it matches a failure this account has already documented once, and
 * it explains why the damage is concentrated where it is: skip took its largest
 * single jump (0.571 → 0.706) while watch time fell least.
 *
 * The surface is more than the photograph. By beat 5 a repeat viewer knows what
 * beat 6 is: every cut has paid off with "I won't tell you it's fine" / "I'm not
 * going to tell you it'll work out" / "I'm not going to tell you to ask for
 * help", and every cut has closed on "Send this to …".
 *
 * ⭐⭐⭐⭐ AND YOUTUBE IS THE CONTROL THAT MAKES THIS MORE THAN A STORY.
 * A learned surface can only cost you where the audience REPEATS. Measured
 * 2026-09-05 in YouTube Studio: the channel has **6 subscribers**, so its Shorts
 * traffic is effectively all cold — nobody there has seen the last three cuts.
 *
 *              Instagram avg watch   TikTok views   YouTube views
 *   V55            6,871 ms              653             84
 *   V56            6,324 ms              113            132   ← 65.2% avg viewed
 *
 * ⇒ **V56 is worse than V55 on the two platforms with a returning audience and
 * BETTER on the one without one.** That is the shape repetition fatigue makes
 * and it is not the shape a weak idea makes — a weak idea should have been weak
 * on YouTube too. ⚠️ On 84 and 132 views, so it is a control, not a proof; and
 * it is the reason V57 pre-registers TikTok rather than YouTube.
 *
 * ── ⚖️ THE SINGLE VARIABLE, STATED HONESTLY ────────────────────────────────
 * ⭐⭐⭐ THE IDEA IS NOT A VARIABLE IN THIS FORMAT — IT CANNOT BE HELD CONSTANT,
 * because a published idea is never reused. So "one change per cycle" has never
 * meant what it sounds like: V50 → V55 → V56 each changed the copy and nothing
 * else, which is why their decline cannot be attributed to any decision.
 *
 * V57's one variable is **whether the cut is still recognisable as the previous
 * cut**. That is one hypothesis, and it is implemented in four places because
 * the surface is made of four things:
 *   1. the OPENING ground        `dawn-a`  → `gold-c`
 *   2. the CLOSING ground        `ember-b` → `ember-a`
 *   3. ZERO ground overlap with V56 anywhere (all six differ; V56 shared five
 *      of its six with a predecessor)
 *   4. the payoff's REFUSAL CONSTRUCTION — the refusal itself is kept, because
 *      consolation is 0-for-4 on this account (V34, V35, V37, V38); what
 *      changes is that it no longer opens "I'm not going to tell you".
 * ⛔ Do not describe this as four changes and do not "restore" one of them to
 * make it tidier. Four surfaces, one claim: a viewer who saw V56 yesterday must
 * not recognise this before they read it.
 *
 * ⚠️ AND THE COST IS NAMED RATHER THAN HIDDEN. `dawn-a` is the ONLY light
 * ground this repo owns — mean luma 115, against 38.5 for the next brightest.
 * Leaving it trades cover BRIGHTNESS for cover NOVELTY, and brightness is not
 * nothing: the kinetic format's diagnosis was that a dark, near-static open
 * "reads as not-a-video" in a feed. `gold-c` is chosen because it is the best
 * available answer to that objection — 34.3 luma, but a tactile, specular,
 * high-variance photograph that reads as FOOTAGE rather than as a card, which
 * is what the kinetic frames failed to do. Frame 0's rendered luma is reported
 * in NOTES.md and gated by `npm run qa:frame`; if it fails, the fix is the
 * scrim, not the finding.
 * 🔴 THE REAL CONSTRAINT THIS EXPOSES: thirteen grounds, six per cut, and a
 * no-reuse rule. V56's gate was already unsatisfiable and had to be rewritten.
 * **The ground pool has to grow before a fifth cut**, or the next gate gets
 * rewritten again — which is the failure mode, not the gate.
 *
 * ── THE MOMENT, AND IT IS DELIBERATELY NEITHER OF THE OTHER THREE ──────────
 * V50 is 2 a.m. after the thing went wrong. V55 is the week before a decision
 * nobody will authorise. V56 is the person those two viewers phone — and it is
 * the one that stepped OUTSIDE the viewer, opening on praise rather than on an
 * ache. This is DURING: mid-conversation, daylight, other people in the room,
 * face still arranged, at the second you hear a sentence you have heard before
 * and know exactly how the whole thing ends. First person, present tense, and
 * the ache is in frame 0 rather than deferred to scene 3.
 *
 * ⭐ WHICH OF THE THREE: **FEELING**, and the becoming is *someone who can
 * finally see the shape of the thing that keeps happening to them.*
 * [[numevix-what-people-buy]] — nobody pays for information, they pay to become
 * someone. ⭐⭐ This is also the one interior state that is NATIVE to the offer:
 * a chart is a claim about a pattern, so wanting the pattern named needs no
 * argument and still asserts nothing.
 *
 * ⭐⭐⭐ WOUND, NOT ACCUSATION — AND THIS SUBJECT'S ACCUSATION IS RIGHT THERE.
 * "You're the common denominator" and "you keep choosing this" are the same
 * sentence with the blame moved onto the viewer, and they are the whole trap of
 * a recurrence subject. Every line here states the recurrence as an EVENT that
 * happened to them more than once — they saw it coming early and it arrived
 * anyway — never as a trait they carry. Scene 3 names a rule about how
 * foresight works, not a flaw in the person holding it.
 *
 * ⭐⭐⭐ THE PAYOFF REFUSES BOTH AVAILABLE CONSOLATIONS, not one: "this time
 * will be different" and "it wasn't your fault". It also refuses the accusation.
 * What is offered instead is the thing nobody has offered — to say what the
 * shape is.
 *
 * ── ⛔ WHAT IT CLAIMS: NOTHING ──────────────────────────────────────────────
 * 🔴 No number, no letter value, no date arithmetic, no forecast, anywhere.
 * `v57.test.ts` asserts that NEGATIVE, because a grep for a phrase that is
 * present can never detect one that was removed.
 *
 * ── 🎯 PRE-REGISTERED, AND ONLY THESE ──────────────────────────────────────
 * **TikTok views at 48h ≥ 400** (primary — the only bar V56 failed against a
 * real distribution; V55 653, V50 607, V56 113).
 * **Instagram skip rate ≤ 0.60** (secondary — skip is the instrument that
 * measures the opening frame, and the opening frame is what changed).
 * ⛔ NOT Instagram reach or views: 21–38 reach cannot carry a creative verdict.
 * ⛔ NOT TikTok average watch or watched-full — unreadable inside the window on
 * V54 AND V55. **Pre-register only instruments that exist in the judging
 * window**; that rule has now been broken twice and is not being broken again.
 * ⚠️ Read them SETTLED, not at five hours. See the decay note above.
 */

/** ⭐ No kicker chip anywhere in this format — the chip is the V-series tell. */
export const V57_SCENES: QuietScene[] = [
  // ── FRAME 0, THE POSTER FRAME. Static, fully populated, no entrance. ──────
  //    🔴 `gold-c`, NOT `dawn-a` — the one deliberate break, and the reason
  //    this cut exists. Three cuts have opened on the same pale gradient and
  //    the skip rate has climbed each time. A viewer who saw V56 yesterday
  //    must not recognise this frame before they have read it.
  //    ⭐ The ache is IN frame 0. V56 opened on a compliment and deferred the
  //    ache to scene 3; second two is where this account's cliff is, and praise
  //    is complete in second one, so it gives nobody a reason to stay.
  {
    seconds: 2.7,
    bg: "gold-c",
    scrim: "normal",
    fg: "#FFF4E4",
    accent: "#E8B86A",
    line: "You recognised it before they finished the sentence.",
    accentWord: "before they finished",
  },
  // ── What they did with the recognition, and it is true rather than kind:
  //    they kept their face arranged and let the room carry on. Daylight,
  //    other people present — deliberately not V50's 2 a.m. and not V55's night.
  {
    seconds: 2.5,
    bg: "violet-b",
    scrim: "light",
    fg: "#EDE9F4",
    accent: "#A98FD0",
    line: "You nodded and let them finish.",
    accentWord: "nodded",
    under: "you'd already seen the whole shape of it",
  },
  // ── ⭐ THE TURN, AND THE LINE THE ANGLE RESTS ON. Stated as an event that
  //    has happened to them repeatedly — never as a fault, never as a choice.
  {
    seconds: 2.8,
    bg: "water-a",
    scrim: "light",
    fg: "#E8F0F6",
    accent: "#8FB8D4",
    line: "Knowing early has never once stopped it.",
    accentWord: "never once stopped it",
    under: "that is the part nobody warns you about",
  },
  // ── The structural reason. ⚠️ Wound, not accusation: it names a rule about
  //    what foresight can and cannot do, not a flaw in the person who has it.
  //    ⛔ NOT "you're the common denominator" — that is this subject's trap.
  {
    // 🪤 NOT `night-a`. The first render put it here and the scene measured a
    //    mean luma of ~9.8 for its whole 2.6s — below `qa:frame`'s own MIN_MEAN
    //    of 12, in the beat immediately before the payoff, which is the segment
    //    where this repo measured 56.9% of surviving viewers leaving. It was not
    //    a black frame (the copy never ramps from zero in this format, and
    //    stddev held) but `night-a` is the darkest ground we own at 8.66 luma
    //    and `violet-a` at 16.2 costs nothing to use instead.
    seconds: 2.6,
    bg: "violet-a",
    scrim: "light",
    fg: "#EFEAF6",
    accent: "#93A7DC",
    line: "Seeing it coming is not the same as stopping it.",
    accentWord: "not the same",
    under: "so you brace, and it arrives anyway",
  },
  // ── THE PAYOFF, index 4, starting at 10.6s — well past the 6.4s gate.
  //    ⭐⭐⭐ IT REFUSES BOTH CONSOLATIONS. "This time will be different" is the
  //    lie, "it wasn't your fault" is the other one, and "you're the common
  //    denominator" is the accusation hiding behind both. All three are declined.
  //    🔴 AND THE CONSTRUCTION CHANGES. V50/V55/V56 all opened this beat with
  //    "I won't tell you" / "I'm not going to tell you". A fourth identical
  //    opener is the same learned surface as a fourth identical cover frame —
  //    the refusal is the format's contract, the phrasing is not.
  //    🪤 It asserts nothing. "What your chart says the pattern is" is a promise
  //    about a conversation, not a forecast.
  {
    seconds: 2.9,
    // 🔴 `gold-b` — never used in this format by ANY predecessor, so the account's
    //    four most important frames now sit on four different grounds
    //    (V50 stone-a · V55 gold-c · V56 gold-a · V57 gold-b).
    bg: "gold-b",
    scrim: "normal",
    fg: "#F5F0E8",
    accent: "#DFAE62",
    line: "I won't promise this time is different.",
    accentWord: "this time is different",
    under: "I'll tell you what your chart says the pattern is",
  },
  // ── THE ASK. ⭐ The target is named by the REPETITION, not by strength or
  //    patience — identifiable in under a second and comforting nobody.
  //
  //    ⚔️ Settled ruling stands: the MECHANISM is Funnel's (a send to a specific
  //    human, never a save) and the WORDING is Angle's (named by a wound).
  //    ⚠️ AND IT CARRIES THE VERDICT RULE: a viewer who does not recognise
  //    themselves still has somebody to send it to, so the cut never leaves a
  //    judgment about their own life sitting on them.
  //
  //    🔴 SAVES STAY KILLED ON THE COUNTS: August corr(reach, saves) = 0.74.
  //    ⚠️ AND THE LIMIT ON THE SEND: shares do NOT buy reach here (Spearman
  //    0.12 across August). It is chosen because at ~52 followers it is the only
  //    act that produces a WARM arrival, not because it compounds.
  //    ⛔ Never a bare URL — half of views arrive muted from a feed where
  //    nothing on screen is tappable. The route lives in the caption and the
  //    pinned first comment, which is what converts the RECEIVER of a send.
  //
  //    🔴 `ember-a`, not `ember-b`: the closing frame is part of the surface too,
  //    and it is the frame the send decision is made on.
  {
    seconds: 2.8,
    bg: "ember-a",
    scrim: "light",
    fg: "#FFF0E4",
    accent: "#FF8A48",
    line: "Send this to whoever is watching it happen again.",
    accentWord: "watching it happen again",
    under: "they'll know why · @numevix",
  },
];

/** The beat the cut is built to reach. Everything before it withholds. */
export const V57_PAYOFF_INDEX = 4;

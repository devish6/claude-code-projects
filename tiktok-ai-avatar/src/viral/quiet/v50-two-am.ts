import type { QuietScene } from "./scenes";

/**
 * V50 — NOBODY LOOKS UP THEIR BIRTH DATE ON A GOOD DAY.
 *
 * ⭐⭐⭐ THE FIRST CUT IN 50 THAT SELLS A FEELING INSTEAD OF A FACT.
 *
 * The owner's brief, 2026-08-29: *"These styles of videos are getting us the
 * one-second hold, but that's all they're getting us. We're not getting any
 * views. Change the style, make it emotionally touching, make it something
 * extremely relatable."* And the frame he asked to build on, in his words:
 *
 *   > People buy 3 things: a solution, a shortcut, or a feeling. A solution
 *   > removes pain. A shortcut makes the result feel easier. A feeling makes
 *   > them want to become the version of themselves your offer represents.
 *   > Nobody is going to pay for information. They're paying to BECOME someone
 *   > — someone with more money, more certainty, more visibility.
 *
 * V43–V49 sold information, exclusively: four numbers, the letters of the Sun,
 * a year that starts on your birthday, the alphabet's missing 9, what your
 * first letter is worth, driver × conductor, days per number. Seven cuts, seven
 * facts, and V49's own header admits it shipped "a fact about the CALENDAR."
 * **Nobody was ever going to pay to become someone who knows a fact about the
 * calendar.** This cut names the moment the viewer actually lives in.
 *
 * ── WHICH OF THE THREE, AND THE WOUND ───────────────────────────────────────
 * **FEELING**, primarily — the becoming is *someone who has stopped carrying
 * this alone at 2 a.m.* It carries **solution** in the last two beats (a reading
 * is a person answering) and the ask itself is the **shortcut**: one message
 * with one date in it, no form, no payment, no table to read.
 *
 * The pain, and the viewer already feels it: *there was a night this year when
 * you had run out of people to ask, and you typed your birth date into a search
 * bar instead.* ⭐⭐⭐ WOUND, NOT ACCUSATION (6/6 on this account's own posts):
 * it names a thing that HAPPENED to them, assigns no character trait, and —
 * load-bearing — **does not absolve.** Scene 4 exists to refuse the consolation
 * the shape is begging for. "You're not behind, you're on your own clock" is the
 * dead version of this cut and it has lost four times (V34, V35, V37, V38).
 *
 * ── ⛔ WHAT IT CLAIMS: NOTHING ──────────────────────────────────────────────
 * 🔴 **There is no numerology assertion anywhere in this cut.** No number, no
 * letter value, no date arithmetic, no forecast. `assertsFacts` is false
 * trivially, there is nothing to derive from the engine and nothing a commenter
 * can contradict. That is the intended shipping state, not an oversight — and
 * it is why the one thing that has capped every emotional cut in this category
 * (the claim inside it) cannot bite here.
 *
 * 🪤 AND THE ONE WE REFUSED, so nobody re-proposes it. The market's winning
 * caption is a monthly forecast — *"September is finally bringing you the
 * results you've been patiently waiting for"* (370K). We cannot run it and did
 * not fake it: `lib/numerology/personal-year.ts` anchors a Personal Year to the
 * FULL DOB, birthday→birthday, and the ruleset has no universal-month
 * convention, so a moolank-segmented monthly forecast is not derivable. Writing
 * one would be the pratayandar error again. Already on record under
 * `personal-year-turn` in `content/angles.json`, and refused a second time here.
 *
 * ── 🎨 WHY IT LOOKS DIFFERENT, MEASURED ─────────────────────────────────────
 * V49 renders at a whole-video mean luma of **27.9/255**, dropping 57.9 → 15.8
 * at 1.9s and never again passing 31.3 — because `checkFrameChanges` forbids
 * repeating a ground and 12 of our 13 grounds are dark (measured: `dawn-a`
 * 115.0, then `stone-a` 38.5, and everything else 8.7–25.3). The order here is
 * an ARC, not a rotation: dawn → stars → smoke → moonlit water → stone → embers.
 *
 * 🔴 THE BRIGHT GROUND GOES ON FRAME 0, AND THAT WAS A CORRECTION. The first
 * V50 render opened on `night-b` and measured frame 0 at **mean luma 19.96** —
 * three times DARKER than the V49 frame 0 it was meant to improve on. Diagnosing
 * "the format ships black cards" and then shipping a darker cover is the exact
 * shape of error this file's header warns about elsewhere. `dawn-a` is the only
 * light asset the account owns and frame 0 is the COVER — the one frame that
 * has to stop a thumb — so it goes there. The close takes `ember-b`, which
 * carries its own light source (glowing coals) and so reads warm rather than
 * merely dark, and the orange accent holds against cream at the CTA.
 *
 * ⚠️ HONEST LIMIT, AND IT IS THE REAL CEILING ON THIS CUT: five of six grounds
 * are still dark, and NONE of the thirteen contains a human being. The market
 * post this cut is chasing (273K, 12.5% like rate) is a woman's face and hands
 * lit by a diya. Warm human imagery — a room, a lit screen, hands — does not
 * exist in `public/grounds/` and cannot be made from what is there. That is an
 * asset problem, not a writing one, and no further re-cut will solve it.
 *
 * 🪤 CONTRACTIONS AND SENTENCE CASE ARE PART OF THE CHANGE. Every V-series
 * frame 0 is left-aligned UPPERCASE Cinzel over a kicker chip. A scroller who
 * has passed six of them recognises the SHAPE before reading a word — V43 and
 * V44 opened on 99.5% identical pixels and V44's 1s hold halved. The cheapest
 * way not to be recognised is not to be the same object.
 *
 * ── 🎯 HOW TO JUDGE IT, AND HOW NOT TO ──────────────────────────────────────
 * ⛔⛔ **NOT ON VIEWS.** σ of log₁₀(views) with the creative held is ≈0.6 on this
 * account — one sigma is ×4, and three natural controls (three reels four
 * minutes apart: 1,683/216/2,409; byte-identical captions: 1,935/188) put the
 * spread at 10× with nothing changed. A single post cannot report anything.
 * ⛔ Not on skip rate either — retired as a target; keep only `skip > 0.85` as a
 * floor to avoid.
 *
 * ✅ **JUDGE ON LIKES PER VIEW, AND ONLY INSIDE THE FLOOR REGIME (~140–270
 * views). Beat 8.0% — ≥16 likes on ~200 views.**
 * Banked baseline, needing no control post: the 13 mature floor posts from
 * 08-14→08-28 took **109 likes on 2,674 views = 4.08% ± 0.75pp**. Best ever
 * observed on the floor is 5.13%, and P(a floor post reaches 8% by chance) =
 * **0.84%**. ⭐⭐⭐ WHY THIS ONE FIRES AT n=1 WHEN VIEWS CANNOT: likes/view is
 * measured *conditional on the views the post actually got*, so the whole
 * distribution lottery — the thing that makes 62-posts-per-arm necessary — is
 * conditioned away. Per-post CV is 34%; the 3× effect the market fact predicts
 * is ~6σ. Saves and shares are the same test with a 4× smaller count, needing
 * ~5× the posts.
 * 🪤 **VOID IF THE POST BREAKS OUT.** Our own 1,936-view post ran 1.03% — a 4×
 * collapse, because breakout audiences are cold. If reach clears ~400, this
 * read is destroyed; say so and re-run on the next cut rather than reporting it.
 *
 * 🔴 TWO METRICS PREVIOUSLY ON RECORD ARE DEAD FIELDS — do not judge on either:
 *   • **`profile_links_taps` has NEVER been non-zero**, on any day, including
 *     nine days totalling 15,911 reach. Windsor's own field description counts
 *     taps on the call/email/text/address buttons — **the website link is not in
 *     that list** and this account has none of those buttons. "Zero link taps"
 *     is a measurement of nothing. ⚠️ The bio link is also untagged, so GA4
 *     cannot see arrivals either; tagging it is a five-minute fix and is the
 *     only way this account will ever observe one.
 *   • **`follows_and_unfollows` is SUPPRESSED under 100 followers** (we are at
 *     52), so it reads zero regardless of truth.
 * ⛔ And retire the comment count: 0 comments in ~5,300 views puts a 95% upper
 * bound on our rate of 0.057%, which sits ABOVE every plausible niche rate. The
 * zero-run cannot distinguish "normal" from "exactly zero" — it carries no
 * information at this reach. (The oft-quoted "0 for ~45 posts" is also stale:
 * the account's first non-zero comment landed 2026-08-12, so the run is ~17.)
 */

/** ⭐ No kicker chip anywhere in this format — the chip is the V-series tell. */
export const V50_SCENES: QuietScene[] = [
  // ── FRAME 0, THE POSTER FRAME. Static, fully populated, no entrance. ──────
  //    It addresses 100% of viewers: no birthdate gate, no jargon, nothing to
  //    disqualify yourself from inside the second the 1s hold measures. 34 of
  //    the last 38 posts opened on "BORN 1st, 10th, 19th OR 28th?", which asks
  //    ~8 of every 9 viewers to leave immediately.
  {
    seconds: 2.6,
    bg: "dawn-a",
    scrim: "heavy",
    fg: "#FFF6EA",
    accent: "#F4CE8E",
    line: "Nobody looks up their birth date on a good day.",
    accentWord: "good day",
  },
  // ── The hour, named. This is the recognition beat — it either lands as "that
  //    was me" inside 2 seconds or the cut has failed and no later line saves it.
  {
    seconds: 2.5,
    bg: "night-b",
    scrim: "light",
    fg: "#EEF2FA",
    accent: "#9FB6DA",
    line: "It's always 2 a.m.",
    accentWord: "2 a.m.",
    under: "and you've already run out of people to ask",
  },
  // ── ⭐ THE LINE THE WHOLE ANGLE RESTS ON. It refuses the cheap read of its
  //    own audience — they are not credulous, they are out of options. Saying so
  //    is the single most respectful thing this account has ever put on screen.
  {
    seconds: 2.5,
    bg: "violet-a",
    scrim: "light",
    fg: "#F3EAFA",
    accent: "#C6A0F0",
    line: "You're not looking for magic.",
    accentWord: "magic",
    under: "you're looking for a reason",
  },
  // ── The want, stated plainly. ⚠️ Wound, not accusation: it names what they
  //    wanted, never what they are.
  {
    seconds: 2.6,
    bg: "water-b",
    scrim: "light",
    fg: "#E9F1F8",
    accent: "#8FB9D6",
    line: "You want someone to say: this is genuinely hard.",
    accentWord: "genuinely hard",
  },
  // ── THE PAYOFF, index 4, starting at 10.2s — well past the 6.4s distribution
  //    gate. ⭐⭐⭐ AND IT REFUSES TO CONSOLE. Every dead cut on this account
  //    (V34, V35, V37, V38) softened here. Consolation is what the viewer
  //    expects, which is exactly why withholding it is the beat that earns the
  //    ask. What is sold is CERTAINTY — the owner's own word.
  {
    seconds: 2.7,
    bg: "stone-a",
    scrim: "normal",
    fg: "#F2F2F2",
    // 🔴 WAS #D8D8D8 — 26 channels from the ink, i.e. no accent at all. The
    //    amber also foreshadows the ember ground the CTA lands on.
    accent: "#E8B36A",
    line: "I won't tell you it's fine.",
    accentWord: "fine",
    under: "I'll tell you what your chart actually says",
  },
  // ── THE ASK — A SEND TO A NAMED PERSON, AND THE NAMING CLOSES SCENE 1's LOOP.
  //
  //    ⚔️ THIS BEAT SETTLES A CONFLICT THE TEAM HAS NOW RAISED TWICE. Funnel
  //    ruled: kill the save CTA, ask for a send to a specific human. Angle
  //    ruled: the send target Funnel proposed — "the one person who still
  //    thinks they're behind" — is CONSOLATION, and consolation is 0-for-4 on
  //    this account's own posts (V34, V35, V37, V38). Both are right about
  //    their own lane, so the mechanism is Funnel's and the wording is Angle's:
  //    a named send whose target is named by a WOUND, not by reassurance.
  //    "Whoever's still awake" is identifiable in under a second, ties straight
  //    back to the 2 a.m. beat, and comforts nobody.
  //
  //    🔴 SAVES ARE KILLED ON THE COUNTS, NOT ON TASTE. August corr(reach,
  //    saves) = 0.74 — the save count is a FUNCTION of reach, and no save CTA
  //    this account has run has ever produced a count outside the range reach
  //    alone explains. V49's explicit "screenshot the table" produced three.
  //    ⚠️ AND THE HONEST LIMIT ON THE SEND: shares do NOT buy reach here. The
  //    two highest-share posts in account history (172 shares → 328 reach;
  //    126 → 500) are among its WORST-reaching, and Spearman corr(reach,
  //    shares) across August is 0.12 — nothing. The send is chosen because it
  //    is the only act at 52 followers that can produce a WARM arrival, not
  //    because it compounds. ⛔ Do not promote it to a growth mechanism if it
  //    fires. 📌 `CTAEnding.tsx:18` still cites "126 shares → 499 reach" as the
  //    justification for the share era; its own exhibit refutes it. Fix it.
  //
  //    ⛔ Never a bare URL — half of views arrive muted from the Reels tab,
  //    where nothing on screen is clickable. The route to site lives in the
  //    caption and in the pinned first comment, which is what converts the
  //    RECEIVER of a send — the only viewer this account gets who arrives warm.
  {
    seconds: 2.9,
    bg: "ember-b",
    scrim: "light",
    fg: "#FFF0E4",
    accent: "#FF9152",
    line: "Send this to whoever's still awake.",
    accentWord: "still awake",
    under: "they'll know why · @numevix",
  },
];

/** The beat the cut is built to reach. Everything before it withholds. */
export const V50_PAYOFF_INDEX = 4;

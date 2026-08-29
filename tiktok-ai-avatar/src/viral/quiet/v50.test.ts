import { describe, expect, it } from "vitest";
import { sec } from "../timing";
import {
  DISSOLVE,
  MAX_WORDS,
  QUIET_SCENE_MAX,
  QUIET_SCENE_MIN,
  checkAccentContrast,
  checkAccentWords,
  checkDissolveFits,
  checkGroundChanges,
  checkHoldDurations,
  checkLineLength,
  checkPayoffLate,
  copyEntrance,
  groundOpacity,
  runQuietGates,
  totalFrames,
} from "./scenes";
import { V50_PAYOFF_INDEX, V50_SCENES } from "./v50-two-am";

/**
 * ⭐⭐⭐ EVERY GATE HERE CARRIES A POSITIVE CONTROL.
 *
 * The lesson this repo has paid for more than any other: **a guard that cannot
 * fail is worse than none.** Three of fifteen mutation-tested guards in the
 * tarot work came back green against a deliberately broken input, and one let
 * an entire crawlable section be deleted with 1,812 tests passing. `assert(ok)`
 * on the real scenes proves only that today's scenes pass — it says nothing
 * about whether the gate would notice if they stopped. So every `expect(ok)` is
 * paired with a mutant that must FAIL.
 */

describe("V50 — the quiet format's gates actually fail", () => {
  it("passes every gate on the real scenes", () => {
    const failed = runQuietGates(V50_SCENES, V50_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}: ${g.detail}`)).toEqual([]);
  });

  it("checkGroundChanges FAILS when two neighbours share a ground", () => {
    const mutant = V50_SCENES.map((s, i) => (i === 1 ? { ...s, bg: V50_SCENES[0].bg } : s));
    expect(checkGroundChanges(mutant).ok).toBe(false);
  });

  it("checkHoldDurations FAILS both above the ceiling and below the floor", () => {
    const tooLong = V50_SCENES.map((s, i) => (i === 0 ? { ...s, seconds: 6 } : s));
    const tooShort = V50_SCENES.map((s, i) => (i === 0 ? { ...s, seconds: 1.2 } : s));
    expect(checkHoldDurations(tooLong).ok).toBe(false);
    expect(checkHoldDurations(tooShort).ok).toBe(false);
  });

  it("checkDissolveFits FAILS when a hold cannot contain two dissolves", () => {
    const mutant = V50_SCENES.map((s, i) => (i === 2 ? { ...s, seconds: 0.9 } : s));
    expect(checkDissolveFits(mutant).ok).toBe(false);
  });

  it("checkAccentWords FAILS when the accent word is not in its line", () => {
    const mutant = V50_SCENES.map((s, i) => (i === 0 ? { ...s, accentWord: "nowhere" } : s));
    expect(checkAccentWords(mutant).ok).toBe(false);
  });

  it("checkAccentWords is CASE SENSITIVE, because the renderer's split is", () => {
    // 🪤 `Line` does `text.indexOf(accentWord)`. A case-insensitive gate would
    //    pass a word the renderer then fails to find, colouring nothing.
    const mutant = V50_SCENES.map((s, i) => (i === 5 ? { ...s, accentWord: "send" } : s));
    expect(checkAccentWords(mutant).ok).toBe(false);
  });

  it("checkAccentContrast FAILS when the accent is the same colour as the ink", () => {
    // 🔴 SHIPPED ONCE: scene 4 ran accent #D8D8D8 against fg #F2F2F2 and the
    //    emphasis was invisible. checkAccentWords was green — it only proves the
    //    word is present, never that the viewer can see it is emphasised.
    const mutant = V50_SCENES.map((s, i) => (i === 4 ? { ...s, accent: s.fg } : s));
    expect(checkAccentContrast(mutant).ok).toBe(false);
    // ...and a near-miss must fail too, or the gate only catches exact equality.
    const near = V50_SCENES.map((s, i) => (i === 4 ? { ...s, accent: "#D8D8D8", fg: "#F2F2F2" } : s));
    expect(checkAccentContrast(near).ok).toBe(false);
  });

  it("checkLineLength FAILS on a line over the word ceiling", () => {
    const long = Array.from({ length: MAX_WORDS + 1 }, () => "word").join(" ");
    const mutant = V50_SCENES.map((s, i) => (i === 0 ? { ...s, line: long, accentWord: undefined } : s));
    expect(checkLineLength(mutant).ok).toBe(false);
  });

  it("checkPayoffLate FAILS when the payoff moves before the 6.4s gate", () => {
    expect(checkPayoffLate(V50_SCENES, 1).ok).toBe(false);
  });
});

/**
 * 🔴🔴 THE BLACK-FRAME CLASS, ASSERTED AS A PROPERTY RATHER THAN A CONSTANT.
 *
 * V48 shipped frame 56 at **0.19% non-black, mean luma 7.05** because the copy —
 * the only bright thing on a dark ground — ramped from opacity 0 at every scene
 * start. Fixing that with a tuned constant is what this repo did twice, and both
 * times a hole shipped anyway. These tests assert the INVARIANT: nothing this
 * format renders may ever be at zero opacity on a frame the viewer sees.
 */
describe("nothing in the quiet format ever fades from zero", () => {
  it("total ground opacity stays ~1 across a whole dissolve", () => {
    // Scene A is ending while scene B is beginning. At every frame of the
    // overlap the two must sum to at least 1 — that is what makes a black cut
    // frame structurally impossible rather than merely unobserved.
    const framesA = sec(2.6);
    for (let k = 0; k <= DISSOLVE; k++) {
      const outgoing = groundOpacity(framesA - DISSOLVE + k, framesA, false, false);
      const incoming = groundOpacity(k, sec(2.5), false, false);
      expect(outgoing + incoming).toBeGreaterThanOrEqual(0.999);
    }
  });

  it("copy opacity is never below 1, on any frame of any scene", () => {
    for (const isFirst of [true, false]) {
      for (let f = 0; f <= sec(4); f++) {
        expect(copyEntrance(f, isFirst).opacity).toBe(1);
      }
    }
  });

  it("frame 0 of scene 0 is fully opaque — the poster frame", () => {
    // 🪤 Shipped blank TWICE. `qa:frame` was right both times.
    expect(groundOpacity(0, sec(2.6), true, false)).toBe(1);
    expect(copyEntrance(0, true)).toEqual({ opacity: 1, lift: 0 });
  });

  it("a later scene is already fully lit by the time its dissolve ends", () => {
    expect(groundOpacity(DISSOLVE, sec(2.6), false, false)).toBe(1);
  });

  it("THE LAST SCENE NEVER FADES OUT — it has no partner to fade in beneath it", () => {
    // 🔴🔴 SHIPPED ONCE, IN THE FIRST V50 RENDER: the final frame measured mean
    //    luma 9.4 / 4.11% non-black, under qa:frame's own MIN_MEAN of 12,
    //    because the out-ramp fired on a scene with no successor. The CTA
    //    dissolved into black. The invariant is "every fade has a partner".
    const frames = sec(2.9);
    for (let k = 0; k <= DISSOLVE; k++) {
      expect(groundOpacity(frames - DISSOLVE + k, frames, false, true)).toBe(1);
    }
    // ...and the positive control: a NON-last scene must still fade out, or the
    // assertion above would pass against a function that never ramps at all.
    expect(groundOpacity(frames - 1, frames, false, false)).toBeLessThan(1);
  });
});

/**
 * ⭐⭐⭐ THE COPY'S OWN CLAIMS. `v46.test.ts` asserts a NEGATIVE — that a
 * forbidden phrase appears nowhere — because a grep for a phrase that IS there
 * can never detect one that was removed. The same shape applies here, and it is
 * the whole safety story of this cut: it makes NO numerology claim, so the
 * assertion is that it never starts making one.
 */
describe("V50 claims nothing it cannot support", () => {
  const allCopy = V50_SCENES.map((s) => `${s.line} ${s.under ?? ""}`)
    .join(" ")
    .toLowerCase();

  it("contains no digit anywhere — no number, date, or letter value", () => {
    // 🪤 "2 a.m." is an HOUR, not a numerology claim, and it is the one numeral
    //    the cut is allowed. Everything else must be prose.
    const digits = allCopy.replace(/2 a\.m\./g, "").match(/\d/g) ?? [];
    expect(digits).toEqual([]);
  });

  it("never asserts a forecast — the claim the market wins on and we cannot derive", () => {
    // `lib/numerology/personal-year.ts` anchors a Personal Year to the FULL DOB,
    // birthday->birthday, and the ruleset has no universal-month convention. A
    // moolank-segmented monthly forecast is NOT derivable. Writing one is the
    // pratayandar error: generalising past the case that proves it.
    for (const banned of ["september", "this month", "next month", "will bring", "is coming", "predict"]) {
      expect(allCopy).not.toContain(banned);
    }
  });

  it("never consoles — consolation is 0-for-4 on this account", () => {
    // V34, V35, V37, V38 all softened and all died. The refusal in scene 4 is
    // the payload; these are the phrasings that would silently undo it.
    for (const banned of ["it's okay", "it is okay", "you're not alone", "don't worry", "it's not your fault"]) {
      expect(allCopy).not.toContain(banned);
    }
  });

  it("never leaves a verdict on the reader", () => {
    // The 81 driver x conductor readings are unshippable for exactly this
    // reason — "It is a bad combination", "delays and disappointments".
    for (const banned of ["you should", "you failed", "your fault", "weak", "unlucky", "bad "]) {
      expect(allCopy).not.toContain(banned);
    }
  });

  it("asks for a SEND to a named person, never a save", () => {
    // August corr(reach, saves) = 0.74 — the save count is a FUNCTION of reach,
    // and no save CTA this account has run has produced a count outside the
    // range reach alone explains. V49's "screenshot the table" produced 3.
    expect(allCopy).toContain("send this to");
    expect(allCopy).not.toContain("save this");
    expect(allCopy).not.toContain("screenshot");
    expect(allCopy).not.toContain("comment");
  });

  it("names the send target by a wound, not by reassurance", () => {
    // ⚔️ Funnel proposed "the one person who still thinks they're behind".
    // Angle refused it: that is consolation, and consolation is 0-for-4 here.
    // The mechanism is Funnel's; the wording is Angle's.
    expect(allCopy).not.toContain("behind");
    expect(allCopy).toContain("still awake");
  });

  it("carries no bare URL — half of views arrive muted from the Reels tab", () => {
    expect(allCopy).not.toContain("numevix.com");
    expect(allCopy).not.toContain("link in bio");
  });

  it("opens in the second person and gates nobody out", () => {
    // 34 of the last 38 posts opened on "BORN 1st, 10th, 19th OR 28th?", which
    // asks ~8 of every 9 viewers to disqualify themselves inside the exact
    // second the 1s hold measures. This cut addresses 100% of viewers.
    expect(V50_SCENES[0].line.toLowerCase()).not.toContain("born on");
    expect(V50_SCENES[0].line.toLowerCase()).toContain("nobody");
  });
});

describe("V50's shape", () => {
  it("holds longer per beat than the kinetic format can", () => {
    // The format's whole reason to exist: KINETIC_SCENE_MAX is 2.2s and you
    // cannot feel something in 1.7 seconds. Every beat here clears that.
    for (const s of V50_SCENES) expect(sec(s.seconds)).toBeGreaterThan(sec(2.2));
  });

  it("carries one sentence per beat — no kicker, no digit, no table", () => {
    for (const s of V50_SCENES) {
      expect(s.line.trim().split(/\s+/).length).toBeLessThanOrEqual(MAX_WORDS);
      // A beat may carry a quiet second line, never a third object.
      expect(Object.keys(s)).not.toContain("table");
      expect(Object.keys(s)).not.toContain("kicker");
    }
  });

  it("puts the ONE light ground on frame 0, because frame 0 is the cover", () => {
    // 🔴 The first V50 render opened on `night-b` and measured frame 0 at mean
    //    luma 19.96 — 3x darker than the V49 frame 0 it was meant to beat.
    //    `dawn-a` is 115.0; the next brightest of the 13 is `stone-a` at 38.5.
    expect(V50_SCENES[0].bg).toBe("dawn-a");
  });

  it("closes on a ground that carries its own light source", () => {
    // `ember-b` is only 22.8 mean luma but the coals are self-lit, so the CTA
    // frame reads warm rather than dark. ⛔ Never `night-a` (8.7) at the close.
    expect(V50_SCENES[V50_SCENES.length - 1].bg).toBe("ember-b");
  });

  it("pairs cream type with the heavy scrim on the pale ground", () => {
    // 🪤 Measured, not reasoned: every scrim darkens DOWNWARD, so dark ink on
    //    dawn decays to 1.4:1 against a 3.0:1 floor. Cream + heavy = 17.2:1.
    const dawn = V50_SCENES.filter((s) => s.bg === "dawn-a");
    expect(dawn.length).toBeGreaterThan(0);
    for (const s of dawn) {
      expect(s.scrim).toBe("heavy");
      expect(s.fg.toUpperCase()).toMatch(/^#F{1,2}/);
    }
  });

  it("runs between 14 and 18 seconds", () => {
    const seconds = totalFrames(V50_SCENES) / 30;
    expect(seconds).toBeGreaterThan(14);
    expect(seconds).toBeLessThan(18);
  });

  it("keeps every hold inside the format's own window", () => {
    for (const s of V50_SCENES) {
      expect(sec(s.seconds)).toBeGreaterThanOrEqual(QUIET_SCENE_MIN);
      expect(sec(s.seconds)).toBeLessThanOrEqual(QUIET_SCENE_MAX);
    }
  });
});

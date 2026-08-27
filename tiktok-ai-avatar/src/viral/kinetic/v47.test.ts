import { describe, expect, it } from "vitest";
import { V43_SCENES } from "./v43-moolank-1";
import { V44_SCENES } from "./v44-name-number-1";
import { V45_SCENES } from "./v45-september-year-turn";
import { V46_SCENES, KICKER as V46_KICKER } from "./v46-alphabet-no-nine";
import { V47_SCENES, V47_PAYOFF_INDEX, KICKER } from "./v47-first-letter";
import { runKineticGates, totalFrames, sceneOffsets, FPS } from "./scenes";

/**
 * 🔴 THIS FILE WAS OWED. V47 shipped 2026-08-26 against a 9:35pm deadline with
 * no test of its own — the only cut in the kinetic run without one. It is
 * written here after the fact, which means every assertion below had to be
 * mutation-tested against the shipped file rather than driving it. Three guards
 * in this repo's history came back green against a broken implementation; a
 * guard that cannot fail is worse than none.
 */

const PRIOR = [
  { name: "V43", scenes: V43_SCENES },
  { name: "V44", scenes: V44_SCENES },
  { name: "V45", scenes: V45_SCENES },
  { name: "V46", scenes: V46_SCENES },
];

/**
 * ⭐⭐⭐ THE CLAIM'S LIMIT, AS A GATE — the one guard this file exists for.
 *
 * V47's payoff is "O AND Z. THAT IS ALL." That is TRUE of LETTERS and FALSE of
 * NAMES: a name reduces by SUMMING its letters, so a name can land on 7 without
 * containing an O or a Z at all. The false version is the shorter, punchier
 * line — "only two names are 7s" — and it is exactly the sentence a later edit
 * reaches for when it is trimming a sub for width.
 *
 * 🪤 This is the same trap V46 was built around ("no LETTER is worth 9" vs "no
 * NAME is a 9", falsified by VEER -> 18 -> 9). It recurs because the letter map
 * and the name number live one arithmetic step apart and the copy does not
 * carry the step.
 */
describe("V47 — two LETTERS carry a 7, and it may never be restated about NAMES", () => {
  /** The engine's own map, `vedic-numerology/lib/numerology/name-number.ts:1-4`. */
  const CHALDEAN: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
    N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
  };
  const reduce = (n: number): number => {
    let v = n;
    while (v > 9 && v !== 11 && v !== 22 && v !== 33) {
      v = String(v).split("").reduce((a, d) => a + Number(d), 0);
    }
    return v;
  };
  const nameNumber = (s: string) => reduce([...s].reduce((a, c) => a + CHALDEAN[c], 0));

  const copy = V47_SCENES.map((s) => `${s.headline ?? ""} ${s.sub ?? ""}`).join(" ").toUpperCase();

  it("exactly two letters carry a 7, and they are O and Z — the fact the payoff rests on", () => {
    const sevens = Object.entries(CHALDEAN)
      .filter(([, v]) => v === 7)
      .map(([k]) => k)
      .sort();
    expect(sevens).toEqual(["O", "Z"]);
  });

  /**
   * 🪤 THE COUNTEREXAMPLE THAT MAKES THE STRONGER CLAIM FALSE.
   * NEHA = N5 + E5 + H5 + A1 = 16 -> 7, and it contains neither an O nor a Z.
   * So "only two 7s" is true of the alphabet and false of the name set.
   */
  it("a NAME can be a 7 with no O and no Z in it", () => {
    expect(nameNumber("NEHA")).toBe(7);
    expect("NEHA").not.toMatch(/[OZ]/);
  });

  it("no scene restates the letter fact as a fact about names", () => {
    for (const forbidden of [
      "TWO NAMES",
      "ONLY TWO NAMES",
      "NAMES ARE 7",
      "NAMES CAN BE 7",
      "NO NAME IS A 7",
      "ONLY O AND Z ARE 7S",
    ]) {
      expect(copy).not.toContain(forbidden);
    }
  });

  /**
   * ⭐ The positive half. Asserting the absence of the false sentence is not
   * enough — an edit that dropped the scoping noun entirely ("only two carry a
   * 7") would pass every NOT above while being just as wrong. So every scene
   * that makes the two-of-them claim must name LETTERS in the same breath.
   */
  it("every 'only two' claim is scoped to letters or the alphabet in the same scene", () => {
    const claims = V47_SCENES.map((s) => `${s.headline ?? ""} ${s.sub ?? ""}`.toUpperCase()).filter(
      (t) => /\bTWO\b/.test(t) || /\bO AND Z\b/.test(t),
    );
    expect(claims.length).toBeGreaterThan(0);
    for (const t of claims) expect(t).toMatch(/LETTER|ALPHABET/);
  });

  it("the payoff names both letters and scopes them to the alphabet", () => {
    const payoff = V47_SCENES[V47_PAYOFF_INDEX];
    expect(payoff.headline?.toUpperCase()).toContain("O AND Z");
    expect(payoff.sub?.toUpperCase()).toContain("ALPHABET");
  });

  /**
   * ⛔ V43 put "4 NUMBERS" on screen in a video whose answer was 1, 2, 4 and 7,
   * and the typography handed the viewer a wrong answer. Here 7 IS the subject,
   * so 7 stays a numeral and the COUNT must stay a word.
   */
  it("spells the count and leaves the numeral to the subject", () => {
    const counting = V47_SCENES.map((s) => s.sub ?? "").find((t) => /carry a 7/i.test(t));
    expect(counting).toBeDefined();
    expect(counting).toMatch(/\btwo\b/i);
    expect(counting).not.toMatch(/\b2\b/);
  });
});

/**
 * ⛔ V47 IS POST 2 OF A HELD PACKAGE. Its own header states the hold in six
 * parts: 7 scenes, the same seconds array, the same ground order, the same
 * scrims, the same bed, the payoff at index 5. A held package that quietly
 * stopped being held would void the read it exists to enable, so the file's
 * claim about itself is asserted rather than trusted.
 */
describe("V47 — the package is held exactly, as the header claims", () => {
  it("keeps V46's scene count", () => {
    expect(V47_SCENES).toHaveLength(7);
    expect(V47_SCENES).toHaveLength(V46_SCENES.length);
  });

  it("keeps V46's per-scene seconds exactly", () => {
    expect(V47_SCENES.map((s) => s.seconds)).toEqual(V46_SCENES.map((s) => s.seconds));
  });

  it("keeps V46's ground order exactly", () => {
    expect(V47_SCENES.map((s) => s.bg)).toEqual(V46_SCENES.map((s) => s.bg));
  });

  it("keeps V46's scrims exactly", () => {
    expect(V47_SCENES.map((s) => s.scrim)).toEqual(V46_SCENES.map((s) => s.scrim));
  });

  it("keeps V46's chip — the kicker is package, not episode", () => {
    expect(KICKER).toBe(V46_KICKER);
    expect(V47_SCENES[0].kicker).toBe(KICKER);
  });

  it("closes the loop at the same scene index V46 does", () => {
    expect(V47_PAYOFF_INDEX).toBe(5);
  });

  /**
   * 🪤 THE HEADER IS 0.052s OUT. It says "12.352s" in three places; the seconds
   * array actually sums to 369 frames = 12.300s at 30fps. Asserting the real
   * number, not the documented one — a duration is the strongest signal a
   * duplicate detector has and the ledger should carry the true value.
   */
  it("runs 369 frames — 12.300s — and is byte-identical in length to V46", () => {
    expect(totalFrames(V47_SCENES)).toBe(369);
    expect(totalFrames(V47_SCENES) / FPS).toBeCloseTo(12.3, 3);
    expect(totalFrames(V47_SCENES)).toBe(totalFrames(V46_SCENES));
  });
});

/**
 * 🔴 HOLDING THE PACKAGE IS NOT LICENCE TO RE-SHOW THE FRAME. V43 and V44
 * opened on 99.5% identical pixels and V44's 1s hold halved (61.2% -> ~42%).
 * The ground is held on purpose here — it is the arm's ground and the only
 * light one we own — so the STRING is the whole of what makes frame 0 new.
 */
describe("V47 — frame 0 is new", () => {
  it.each(PRIOR)("does not reuse $name's hook headline", ({ scenes }) => {
    expect(V47_SCENES[0].headline).not.toBe(scenes[0].headline);
  });

  it("holds the arm's opening ground on purpose", () => {
    expect(V47_SCENES[0].bg).toBe("dawn-a");
    expect(V46_SCENES[0].bg).toBe("dawn-a");
  });

  /** 🪤 Positive control on the assertion above: if V46 ever stops opening on
   *  dawn-a, "the arm's ground is held" has quietly become a statement about
   *  one file rather than about the arm. */
  it("V43, V44 and V45 opened elsewhere — the ground really is the arm's", () => {
    for (const { scenes } of PRIOR.slice(0, 3)) expect(scenes[0].bg).not.toBe("dawn-a");
  });

  /** V45 bundled `push` with a new hook and so never measured it; V46 refused
   *  to inherit it. Post 2 of the same arm may not quietly reintroduce it. */
  it("does not reintroduce V45's untested opening push", () => {
    expect(V47_SCENES[0].push).toBeUndefined();
    expect(V45_SCENES[0].push).toBeDefined();
  });

  /**
   * 🔴🔴 THE PALE-GROUND RULE, MEASURED OFF A REAL RENDER. Every scrim darkens
   * DOWNWARD, so ink type on the dawn ground decays to 1.4:1 against a 3.0:1
   * floor. The safe pairing is CREAM type on a HEAVY scrim.
   */
  it("pairs the pale opening ground with a heavy scrim and light type", () => {
    const s = V47_SCENES[0];
    const hex = (s.fg ?? "").replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    expect(0.2126 * r + 0.7152 * g + 0.0722 * b).toBeGreaterThan(200);
    expect(s.scrim).toBe("heavy");
  });
});

describe("V47 — structure", () => {
  it("passes every kinetic gate", () => {
    const failed = runKineticGates(V47_SCENES, V47_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}${g.detail ? ` — ${g.detail}` : ""}`)).toEqual([]);
  });

  it("closes the loop after the 6.4s gate but inside the back half", () => {
    const startS = sceneOffsets(V47_SCENES)[V47_PAYOFF_INDEX] / FPS;
    const totalS = totalFrames(V47_SCENES) / FPS;
    expect(startS).toBeGreaterThanOrEqual(6.4);
    expect(startS / totalS).toBeLessThan(0.78);
  });

  /** The gate V46 removed and this arm is holding removed: 34 of the last 38
   *  posts opened on a date filter that disqualifies ~8 of 9 viewers on sight. */
  it("the hook contains no birthdate filter and no jargon", () => {
    const opening = `${V47_SCENES[0].headline ?? ""} ${V47_SCENES[0].kicker ?? ""}`.toUpperCase();
    expect(opening).not.toMatch(/BORN/);
    expect(opening).not.toMatch(/\d+(ST|ND|RD|TH)\b/);
    expect(opening).not.toMatch(/MOOLANK/);
    for (const w of ["CHALDEAN", "PYTHAGOREAN", "ANTARDASHA", "MAHADASHA", "PRATAYANDAR"]) {
      expect(opening).not.toContain(w);
    }
  });

  it("addresses the viewer directly, the shape every best-holding opener has", () => {
    expect(V47_SCENES[0].headline ?? "").toMatch(/\bYOUR?\b/i);
  });

  /** 🪤 The hook may not spend the payoff. V46 v1 opened on its own answer and
   *  the owner's verdict was "a payoff wearing a hook's clothes". */
  it("does not spend the payoff in the hook", () => {
    expect((V47_SCENES[0].headline ?? "").toUpperCase()).not.toContain("O AND Z");
  });

  /** ⚠️ WOUND, NOT ACCUSATION — standing rule. The video may name the ache; it
   *  may not tell the viewer they got it wrong, and it may not predict. */
  it("never puts the error on the viewer and predicts no outcome", () => {
    const copy = V47_SCENES.map((s) => `${s.headline ?? ""} ${s.sub ?? ""}`).join(" ");
    expect(copy).not.toMatch(/your fault|you failed|you were wrong|wrong name/i);
    expect(copy).not.toMatch(/you will|will bring|guarantee/i);
  });

  /** ⛔ Never a bare URL — a muted viewer on the Reels tab cannot click it. And
   *  no price: the two posts that named ₹354 are the two lowest-reach posts in
   *  the whole 61-post window. */
  it("asks for the profile, with no bare URL and no price", () => {
    const cta = V47_SCENES[V47_SCENES.length - 1];
    const text = `${cta.headline ?? ""} ${cta.sub ?? ""}`;
    expect(text).toContain("@numevix");
    expect(text).not.toMatch(/numevix\.com/);
    expect(text).not.toMatch(/[₹$]\s?\d|\d+\s?(rs|inr|usd)/i);
  });
});
